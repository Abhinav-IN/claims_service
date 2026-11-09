import { BadRequestException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity.js';
import { Preauth } from '../entities/pre-auth.entity.js';
import { JwtPayload } from '../interfaces/auth.interface.js';
import { CaseStatus, ClaimStatus, PayerType, PreauthStatus } from '../common/enums/claims.enums.js';
import { deskPayerType } from '../common/helper.js';
import { TpaPolicy } from '../entities/tpa-policy.entity.js';
import { calcPmjaySplit, calcTpaSplit } from '../common/calculation/split.calculation.js';
import { PmjayMember } from '../entities/pmjay-member.entity.js';
import { PmjayFamily } from '../entities/pmjay-family.entity.js';
import { TreatmentCase } from '../entities/treatment-case.entity.js';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim) private claims: Repository<Claim>,
    @InjectRepository(Preauth) private preauths: Repository<Preauth>,
    private dataSource: DataSource,
  ) {}

  async list_for_desk_service(user: JwtPayload, status?: ClaimStatus) {
    const qb = this.claims
      .createQueryBuilder('cl')
      .innerJoinAndSelect('cl.case', 'c')
      .where('c.payerType = :t', { t: deskPayerType(user.role) });
    if (status) qb.andWhere('cl.status = :s', { s: status });

    const rows = await qb.orderBy('cl.id', 'DESC').getMany();
    if (rows.length === 0) return [];

    const preauths = await this.preauths.find({
      where: { caseId: In(rows.map((r) => r.caseId)) },
    });
    return rows.map((r) => ({
      ...r,
      preauthStatus: preauths.find((p) => p.caseId === r.caseId)?.status ?? null,
    }));
  }

  async settle_service(user: JwtPayload, id: number) {
    await this.dataSource.transaction(async (m) => {
      const { claim, c } = await this.lockPending(m, user, id);

      const preauth = await m.findOne(Preauth, { where: { caseId: c.id } });
      if (!preauth || preauth.status !== PreauthStatus.APPROVED) {
        throw new BadRequestException(
          'Pre-authorization must be approved before the claim can be settled',
        );
      }

      let split: { payer: number; patient: number };

      if (c.payerType === PayerType.TPA) {
        const policy = await m.findOne(TpaPolicy, {
          where: { policyNo: c.coverageRef },
          lock: { mode: 'pessimistic_write' },
        });
        if (!policy) throw new NotFoundException('Policy not found');

        split = calcTpaSplit(
          claim.finalBill,
          claim.nonPayableAmount,
          preauth.approvedAmount ?? preauth.requestedAmount,
          policy.coPayPercent,
          policy.balance,
        );
        await m.update(TpaPolicy, policy.id, {
          balance: policy.balance - split.payer,
        });
      } else {
        const member = await m.findOne(PmjayMember, {
          where: { cardNo: c.coverageRef },
        });
        if (!member) throw new NotFoundException('Card not found');

        const family = await m.findOne(PmjayFamily, {
          where: { familyId: member.familyId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!family) throw new NotFoundException('Family not found');

        const remaining = family.annualLimit - family.usedAmount;
        if (remaining < c.estimatedCost) {
          throw new BadRequestException(
            `Family balance insufficient: ₹${remaining} left, package costs ₹${c.estimatedCost}`,
          );
        }
        split = calcPmjaySplit(c.estimatedCost);
        await m.update(PmjayFamily, family.id, {
          usedAmount: family.usedAmount + split.payer,
        });
      }

      await m.update(Claim, claim.id, {
        status: ClaimStatus.SETTLED,
        payerAmount: split.payer,
        patientAmount: split.patient,
        settledAt: new Date(),
      });
      await m.update(TreatmentCase, c.id, { status: CaseStatus.CLOSED });
    });

    return this.view(id);
  }

  async reject_service(user: JwtPayload, id: number, reason: string) {
    await this.dataSource.transaction(async (m) => {
      const { claim, c } = await this.lockPending(m, user, id);

      await m.update(Claim, claim.id, {
        status: ClaimStatus.REJECTED,
        rejectionReason: reason,
        payerAmount: 0,
        patientAmount: claim.finalBill, // patient pays the whole bill
      });
      await m.update(TreatmentCase, c.id, { status: CaseStatus.CLOSED });
    });

    return this.view(id);
  }

  // locks the claim row so two clicks can never settle the same claim twice
  private async lockPending(m: EntityManager, user: JwtPayload, id: number) {
    const claim = await m.findOne(Claim, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!claim) throw new NotFoundException('Claim not found');

    const c = await m.findOne(TreatmentCase, { where: { id: claim.caseId } });
    if (!c) throw new NotFoundException('Case not found');

    if (c.payerType !== deskPayerType(user.role)) {
      throw new ForbiddenException('This claim belongs to the other desk');
    }
    if (claim.status !== ClaimStatus.SUBMITTED) {
      throw new BadRequestException(`Claim is already ${claim.status}`);
    }
    return { claim, c };
  }

  private async view(id: number) {
    const claim = await this.claims.findOne({
      where: { id },
      relations: { case: true },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    return claim;
  }
}