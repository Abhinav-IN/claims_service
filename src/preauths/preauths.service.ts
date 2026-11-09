import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Preauth } from '../entities/pre-auth.entity.js';
import { CoverageService } from '../coverage/coverage.service.js';
import { JwtPayload } from '../interfaces/auth.interface.js';
import { CaseStatus, ClaimStatus, PayerType, PreauthStatus } from '../common/enums/claims.enums.js';
import { deskPayerType } from '../common/helper.js';
import { ApprovePreauthDto } from '../dto/preAuth.dto.js';
import { TreatmentCase } from '../entities/treatment-case.entity.js';
import { Claim } from '../entities/claim.entity.js';

@Injectable()
export class PreauthsService {
  constructor(
    @InjectRepository(Preauth) private preauths: Repository<Preauth>, private coverage: CoverageService, private dataSource: DataSource,) {}

  async resubmit_service(user: JwtPayload, id: number, reply: string) {
    const p = await this.load(id);
    if (p.case.doctorId !== user.id) {
      throw new ForbiddenException('This case belongs to another doctor');
    }
    if (p.status !== PreauthStatus.QUERY) {
      throw new BadRequestException(`Nothing to reply to; status is ${p.status}`);
    }
    await this.preauths.update(id, {
      status: PreauthStatus.SUBMITTED,
      hospitalReply: reply,
    });
    return this.view(id);
  }

  async list_for_desk_service(user: JwtPayload, status?: PreauthStatus) {
    const qb = this.preauths
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.case', 'c')
      .where('c.payerType = :t', { t: deskPayerType(user.role) });
    if (status) qb.andWhere('p.status = :s', { s: status });

    const rows = await qb.orderBy('p.id', 'DESC').getMany();
    const now = Date.now();
    return rows.map((p) => ({
      ...p,
      // emergency request still undecided after its 24h window
      isOverdue:
        !!p.postApprovalDue &&
        (p.status === PreauthStatus.SUBMITTED || p.status === PreauthStatus.QUERY) &&
        p.postApprovalDue.getTime() < now,
    }));
  }

  async approve_service(user: JwtPayload, id: number, dto: ApprovePreauthDto) {
    const p = await this.loadForDesk(user, id);
    if (p.status !== PreauthStatus.SUBMITTED) {
      throw new BadRequestException(`Cannot approve a request that is ${p.status}`);
    }
    const c = p.case;
    let approved: number;

    if (c.payerType === PayerType.TPA) {
      if (!dto.approvedAmount) {
        throw new BadRequestException('approvedAmount is required for TPA approval');
      }
      if (dto.approvedAmount > p.requestedAmount) {
        throw new BadRequestException(
          `Approved amount cannot exceed the requested ₹${p.requestedAmount}`,
        );
      }
      const policy = await this.coverage.getTpaPolicyOrThrow(c.coverageRef);
      const problem = this.coverage.tpaProblem(policy);
      if (problem) throw new BadRequestException(problem);
      if (dto.approvedAmount > policy.balance) {
        throw new BadRequestException(
          `Approved amount exceeds policy balance (₹${policy.balance} left)`,
        );
      }
      approved = dto.approvedAmount;
    } else {
      // Ayushman: amount is fixed to the package rate, client value is ignored
      const { family } = await this.coverage.getFamilyByCardOrThrow(c.coverageRef);
      const remaining = family.annualLimit - family.usedAmount;
      if (remaining < c.estimatedCost) {
        throw new BadRequestException(
          `Family balance insufficient: ₹${remaining} left, package costs ₹${c.estimatedCost}`,
        );
      }
      approved = c.estimatedCost;
    }

    await this.dataSource.transaction(async (m) => {
      await m.update(Preauth, p.id, {
        status: PreauthStatus.APPROVED,
        approvedAmount: approved,
        deskRemarks: dto.remarks ?? p.deskRemarks,
      });
      // emergency cases are already ADMITTED
      if (c.status === CaseStatus.REQUESTED) {
        await m.update(TreatmentCase, c.id, { status: CaseStatus.ADMITTED });
      }
    });
    return this.view(id);
  }

  async query_service(user: JwtPayload, id: number, remarks: string) {
    const p = await this.loadForDesk(user, id);
    if (p.status !== PreauthStatus.SUBMITTED) {
      throw new BadRequestException(`Cannot raise a query on a request that is ${p.status}`);
    }
    await this.preauths.update(id, {
      status: PreauthStatus.QUERY,
      deskRemarks: remarks,
    });
    return this.view(id);
  }

  async reject_service(user: JwtPayload, id: number, reason: string) {
    const p = await this.loadForDesk(user, id);
    if (p.status !== PreauthStatus.SUBMITTED && p.status !== PreauthStatus.QUERY) {
      throw new BadRequestException(`Cannot reject a request that is ${p.status}`);
    }

    await this.dataSource.transaction(async (m) => {
      await m.update(Preauth, p.id, {
        status: PreauthStatus.REJECTED,
        deskRemarks: reason,
      });
      await m.update(TreatmentCase, p.case.id, { status: CaseStatus.REJECTED });

      // emergency case already discharged with a pending claim -> claim fails too
      const claim = await m.findOne(Claim, { where: { caseId: p.case.id } });
      if (claim && claim.status === ClaimStatus.SUBMITTED) {
        await m.update(Claim, claim.id, {
          status: ClaimStatus.REJECTED,
          rejectionReason: 'Pre-authorization was rejected',
          payerAmount: 0,
          patientAmount: claim.finalBill,
        });
      }
    });
    return this.view(id);
  }

  private async load(id: number) {
    const p = await this.preauths.findOne({
      where: { id },
      relations: { case: true },
    });
    if (!p) throw new NotFoundException('Pre-authorization not found');
    return p;
  }

  private async loadForDesk(user: JwtPayload, id: number) {
    const p = await this.load(id);
    if (p.case.payerType !== deskPayerType(user.role)) {
      throw new ForbiddenException('This request belongs to the other desk');
    }
    return p;
  }

  private view(id: number) {
    return this.load(id);
  }
}