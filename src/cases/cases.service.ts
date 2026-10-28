import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { TreatmentCase } from '../entities/treatment-case.entity.js';
import { Preauth } from '../entities/pre-auth.entity.js';
import { Claim } from '../entities/claim.entity.js';
import { PatientCoverage } from '../entities/patient-coverage.entity.js';
import { CoverageService } from '../coverage/coverage.service.js';
import { PackagesService } from '../packages/packages.service.js';
import { JwtPayload } from '../interfaces/auth.interface.js';
import { CreateCaseDto } from '../dto/cases.dto.js';
import { CaseStatus, PayerType, PreauthStatus, Role } from '../common/enums/claims.enums.js';
import { DischargeDto } from '../dto/discharge.dto.js';
import { calcPmjaySplit, calcTpaSplit } from '../common/calculation/split.calculation.js';
import { deskPayerType } from '../common/helper.js';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(TreatmentCase) private cases: Repository<TreatmentCase>,
    @InjectRepository(Preauth) private preauths: Repository<Preauth>,
    @InjectRepository(Claim) private claims: Repository<Claim>,
    @InjectRepository(PatientCoverage) private coverages: Repository<PatientCoverage>,
    private coverage: CoverageService,
    private packages: PackagesService,
    private dataSource: DataSource,
  ) {}

  async create_case_service(user: JwtPayload, dto: CreateCaseDto) {
    const cov = await this.coverages.findOne({
      where: { patientId: dto.patientId },
    });
    if (!cov) {
      throw new BadRequestException(
        'Patient has no verified coverage. Treat as self-pay in the base system.',
      );
    }

    const duplicate = await this.cases.findOne({
      where: {
        appointmentId: dto.appointmentId,
        status: Not(In([CaseStatus.REJECTED, CaseStatus.CLOSED])),
      },
    });
    if (duplicate) {
      throw new ConflictException(
        'An active treatment case already exists for this appointment',
      );
    }

    let estimatedCost: number;
    let packageCode: string | null = null;

    if (cov.coverageType === PayerType.TPA) {
      if (!dto.estimatedCost) {
        throw new BadRequestException('estimatedCost is required for TPA cases');
      }
      const policy = await this.coverage.getTpaPolicyOrThrow(cov.coverageRef);
      const problem = this.coverage.tpaProblem(policy);
      if (problem) throw new BadRequestException(problem);
      if (dto.estimatedCost > policy.balance) {
        throw new BadRequestException(
          `Estimated cost exceeds policy balance (₹${policy.balance} left)`,
        );
      }
      estimatedCost = dto.estimatedCost;
    } else {
      if (!dto.packageCode) {
        throw new BadRequestException('packageCode is required for Ayushman cases');
      }
      const pkg = await this.packages.findByCode(dto.packageCode);
      if (!pkg) throw new NotFoundException('Package not found');

      const { family } = await this.coverage.getFamilyByCardOrThrow(cov.coverageRef);
      const remaining = family.annualLimit - family.usedAmount;
      if (remaining < pkg.rate) {
        throw new BadRequestException(
          `Family balance insufficient: ₹${remaining} left, package costs ₹${pkg.rate}`,
        );
      }
      estimatedCost = pkg.rate;
      packageCode = pkg.code;
    }

    const isEmergency = dto.isEmergency ?? false;

    const created = await this.dataSource.transaction(async (m) => {
      const c = await m.save(
        TreatmentCase,
        m.create(TreatmentCase, {
          appointmentId: dto.appointmentId,
          patientId: dto.patientId,
          patientName: dto.patientName,
          doctorId: user.id,
          doctorName: user.userName,
          diagnosis: dto.diagnosis,
          payerType: cov.coverageType,
          coverageRef: cov.coverageRef,
          packageCode,
          estimatedCost,
          isEmergency,
          // emergency: treat first, approval follows within 24h
          status: isEmergency ? CaseStatus.ADMITTED : CaseStatus.REQUESTED,
        }),
      );
      await m.save(
        Preauth,
        m.create(Preauth, {
          caseId: c.id,
          requestedAmount: estimatedCost,
          postApprovalDue: isEmergency ? new Date(Date.now() + DAY_MS) : null,
        }),
      );
      return c;
    });

    return this.get_case_service(user, created.id);
  }

  async get_my_case_service(patientId: number) {
    const rows = await this.cases.find({
      where: { patientId },
      order: { id: 'DESC' },
    });
    return this.attach(rows);
  }

  async get_doctor_case_service(doctorId: number) {
    const rows = await this.cases.find({
      where: { doctorId },
      order: { id: 'DESC' },
    });
    return this.attach(rows);
  }

  async get_case_service(user: JwtPayload, id: number) {
    const c = await this.cases.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Case not found');
    this.assertCanView(user, c);
    const [full] = await this.attach([c]);
    return full;
  }

  async preview_service(user: JwtPayload, id: number, finalBill: number, nonPayable: number) {
    const c = await this.loadOwnedAdmitted(user, id);
    const split = await this.computeSplit(c, finalBill, nonPayable);
    return {
      caseId: c.id,
      payerType: c.payerType,
      finalBill,
      nonPayableAmount: nonPayable,
      ...split,
    };
  }

  async discharge_service(user: JwtPayload, id: number, dto: DischargeDto) {
    const c = await this.loadOwnedAdmitted(user, id);
    const nonPayable = dto.nonPayableAmount ?? 0;

    const existing = await this.claims.findOne({ where: { caseId: c.id } });
    if (existing) throw new ConflictException('A claim already exists for this case');

    const split = await this.computeSplit(c, dto.finalBill, nonPayable);

    await this.dataSource.transaction(async (m) => {
      await m.save(
        Claim,
        m.create(Claim, {
          caseId: c.id,
          finalBill: dto.finalBill,
          nonPayableAmount: nonPayable,
          payerAmount: split.payerAmount,
          patientAmount: split.patientAmount,
        }),
      );
      await m.update(TreatmentCase, c.id, { status: CaseStatus.DISCHARGED });
    });

    return this.get_case_service(user, c.id);
  }

  private async computeSplit(c: TreatmentCase, finalBill: number, nonPayable: number) {
    if (nonPayable > finalBill) {
      throw new BadRequestException('Non-payable amount cannot exceed the final bill');
    }
    const preauth = await this.preauths.findOne({ where: { caseId: c.id } });
    if (!preauth) throw new NotFoundException('Pre-authorization not found');
    if (preauth.status === PreauthStatus.REJECTED) {
      throw new BadRequestException('Pre-authorization was rejected');
    }

    // emergency cases may be discharged before approval; numbers are then provisional
    const provisional = preauth.status !== PreauthStatus.APPROVED;
    if (provisional && !c.isEmergency) {
      throw new BadRequestException('Pre-authorization is not approved yet');
    }

    if (c.payerType === PayerType.TPA) {
      const policy = await this.coverage.getTpaPolicyOrThrow(c.coverageRef);
      const approved = preauth.approvedAmount ?? preauth.requestedAmount;
      const { payer, patient } = calcTpaSplit(
        finalBill,
        nonPayable,
        approved,
        policy.coPayPercent,
        policy.balance,
      );
      return {
        approvedAmount: approved,
        coPayPercent: policy.coPayPercent,
        payerAmount: payer,
        patientAmount: patient,
        provisional,
      };
    }

    const { payer, patient } = calcPmjaySplit(c.estimatedCost);
    return {
      approvedAmount: c.estimatedCost,
      coPayPercent: 0,
      payerAmount: payer,
      patientAmount: patient,
      provisional,
    };
  }

  private async loadOwnedAdmitted(user: JwtPayload, id: number) {
    const c = await this.cases.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Case not found');
    if (c.doctorId !== user.id) {
      throw new ForbiddenException('This case belongs to another doctor');
    }
    if (c.status !== CaseStatus.ADMITTED) {
      throw new BadRequestException(
        `Case is ${c.status}; discharge is only possible when it is ADMITTED`,
      );
    }
    return c;
  }

  private assertCanView(user: JwtPayload, c: TreatmentCase) {
    let allowed: boolean;
    if (user.role === Role.PATIENT) allowed = c.patientId === user.id;
    else if (user.role === Role.DOCTOR) allowed = c.doctorId === user.id;
    else allowed = c.payerType === deskPayerType(user.role);
    if (!allowed) throw new ForbiddenException('You cannot view this case');
  }

  private async attach(cases: TreatmentCase[]) {
    if (cases.length === 0) return [];
    const ids = cases.map((c) => c.id);
    const [preauths, claims] = await Promise.all([
      this.preauths.find({ where: { caseId: In(ids) } }),
      this.claims.find({ where: { caseId: In(ids) } }),
    ]);
    return cases.map((c) => ({
      ...c,
      preauth: preauths.find((p) => p.caseId === c.id) ?? null,
      claim: claims.find((x) => x.caseId === c.id) ?? null,
    }));
  }
}