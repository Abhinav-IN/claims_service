import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientCoverage } from '../entities/patient-coverage.entity.js';
import { TpaPolicy } from '../entities/tpa-policy.entity.js';
import { PmjayFamily } from '../entities/pmjay-family.entity.js';
import { PmjayMember } from '../entities/pmjay-member.entity.js';
import { PayerType } from '../common/enums/claims.enums.js';

const today = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

@Injectable()
export class CoverageService {
  constructor(
    @InjectRepository(PatientCoverage) private coverages: Repository<PatientCoverage>,
    @InjectRepository(TpaPolicy) private policies: Repository<TpaPolicy>,
    @InjectRepository(PmjayFamily) private families: Repository<PmjayFamily>,
    @InjectRepository(PmjayMember) private members: Repository<PmjayMember>,
  ) {}

  async getTpaPolicyOrThrow(policyNo: string): Promise<TpaPolicy> {
    const policy = await this.policies.findOne({ where: { policyNo } });
    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  tpaProblem(policy: TpaPolicy): string | null {
    const t = today();
    if (t < policy.validFrom || t > policy.validTill) {
      return 'Policy is expired or not yet active';
    }
    if (policy.balance <= 0) return 'Policy balance is exhausted';
    return null;
  }

  async getFamilyByCardOrThrow(cardNo: string): Promise<{ member: PmjayMember; family: PmjayFamily }> {
    const member = await this.members.findOne({ where: { cardNo } });
    if (!member) {
      throw new NotFoundException('Card not found - patient is not eligible');
    }
    const family = await this.families.findOne({
      where: { familyId: member.familyId },
    });
    if (!family) throw new NotFoundException('Family record not found');
    return { member, family };
  }

  
  async verify_service(patientId: number, type: PayerType, rawRef: string) {
    const ref = rawRef.trim();

    if (type === PayerType.TPA) {
      const policy = await this.getTpaPolicyOrThrow(ref);
      const problem = this.tpaProblem(policy);
      if (problem) throw new BadRequestException(problem);
    } else {
      await this.getFamilyByCardOrThrow(ref);
    }

    const row =
      (await this.coverages.findOne({ where: { patientId } })) ??
      this.coverages.create({ patientId });
    row.coverageType = type;
    row.coverageRef = ref;
    await this.coverages.save(row);

    return this.get_coverage_service(patientId);
  }

  async get_coverage_service(patientId: number) {
    const cov = await this.coverages.findOne({ where: { patientId } });
    if (!cov) {
      throw new NotFoundException('No coverage on file for this patient');
    }

    if (cov.coverageType === PayerType.TPA) {
      const p = await this.getTpaPolicyOrThrow(cov.coverageRef);
      const problem = this.tpaProblem(p);
      return {
        coverageType: PayerType.TPA,
        coverageRef: p.policyNo,
        holderName: p.holderName,
        insurerName: p.insurerName,
        tpaName: p.tpaName,
        sumInsured: p.sumInsured,
        balance: p.balance,
        coPayPercent: p.coPayPercent,
        validTill: p.validTill,
        isActive: problem === null,
        inactiveReason: problem,
      };
    }

    const { member, family } = await this.getFamilyByCardOrThrow(cov.coverageRef);
    const familyMembers = await this.members.find({
      where: { familyId: family.familyId },
    });
    return {
      coverageType: PayerType.AYUSHMAN,
      coverageRef: member.cardNo,
      memberName: member.memberName,
      familyId: family.familyId,
      headName: family.headName,
      annualLimit: family.annualLimit,
      usedAmount: family.usedAmount,
      remaining: family.annualLimit - family.usedAmount,
      members: familyMembers.map((m) => ({
        name: m.memberName,
        cardNo: m.cardNo,
      })),
    };
  }
}