import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { DeskUser } from '../entities/desk-user.entity.js';
import { TpaPolicy } from '../entities/tpa-policy.entity.js';
import { PmjayFamily } from '../entities/pmjay-family.entity.js';
import { PmjayMember } from '../entities/pmjay-member.entity.js';
import { HealthPackage } from '../entities/health-package.entity.js';
import { Role } from '../common/enums/claims.enums.js';

// YYYY-MM-DD, offset in days from today
const day = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger('Seed');

  constructor(
    @InjectRepository(DeskUser) private deskUsers: Repository<DeskUser>,
    @InjectRepository(TpaPolicy) private policies: Repository<TpaPolicy>,
    @InjectRepository(PmjayFamily) private families: Repository<PmjayFamily>,
    @InjectRepository(PmjayMember) private members: Repository<PmjayMember>,
    @InjectRepository(HealthPackage) private packages: Repository<HealthPackage>,
  ) {}

  async onModuleInit() {
    if ((await this.deskUsers.count()) > 0) {
      this.log.log('Seed data already present, skipping');
      return;
    }
    await this.seedDeskUsers();
    await this.seedPolicies();
    await this.seedFamilies();
    await this.seedPackages();
    this.log.log('Seed data inserted');
  }

  private async seedDeskUsers() {
    await this.deskUsers.save([
      {
        userName: 'tpadesk',
        password: await bcrypt.hash('Tpa@123', 10),
        role: Role.TPA_DESK,
      },
      {
        userName: 'pmjaydesk',
        password: await bcrypt.hash('Pmjay@123', 10),
        role: Role.PMJAY_DESK,
      },
    ]);
  }

  private async seedPolicies() {
    await this.policies.save([
      {
        // normal policy, 10% co-pay
        policyNo: 'TPA-1001',
        holderName: 'Rahul Mehta',
        insurerName: 'Star Health',
        tpaName: 'Medi Assist',
        sumInsured: 500000,
        balance: 500000,
        coPayPercent: 10,
        validFrom: day(-200),
        validTill: day(300),
      },
      {
        // normal policy, 20% co-pay
        policyNo: 'TPA-1002',
        holderName: 'Sneha Kapoor',
        insurerName: 'HDFC ERGO',
        tpaName: 'Paramount Health',
        sumInsured: 300000,
        balance: 300000,
        coPayPercent: 20,
        validFrom: day(-100),
        validTill: day(265),
      },
      {
        // EXPIRED policy -> verification must fail
        policyNo: 'TPA-1003',
        holderName: 'Amit Verma',
        insurerName: 'ICICI Lombard',
        tpaName: 'Health India TPA',
        sumInsured: 400000,
        balance: 400000,
        coPayPercent: 10,
        validFrom: day(-730),
        validTill: day(-30),
      },
      {
        // TINY balance -> large estimates must be blocked
        policyNo: 'TPA-1004',
        holderName: 'Neha Singh',
        insurerName: 'Niva Bupa',
        tpaName: 'Family Health Plan TPA',
        sumInsured: 300000,
        balance: 5000,
        coPayPercent: 10,
        validFrom: day(-150),
        validTill: day(215),
      },
      {
        // large balance, no co-pay
        policyNo: 'TPA-1005',
        holderName: 'Karan Malhotra',
        insurerName: 'Care Health',
        tpaName: 'Medi Assist',
        sumInsured: 1000000,
        balance: 1000000,
        coPayPercent: 0,
        validFrom: day(-60),
        validTill: day(305),
      },
    ]);
  }

  private async seedFamilies() {
    const year = new Date().getFullYear();
    await this.families.save([
      // fresh family
      { familyId: 'FAM-001', headName: 'Ramesh Yadav', annualLimit: 500000, usedAmount: 0, year },
      // partly used
      { familyId: 'FAM-002', headName: 'Sunita Devi', annualLimit: 500000, usedAmount: 200000, year },
      // NEARLY EXHAUSTED -> only 10,000 left
      { familyId: 'FAM-003', headName: 'Mohan Lal', annualLimit: 500000, usedAmount: 490000, year },
    ]);

    await this.members.save([
      { familyId: 'FAM-001', memberName: 'Ramesh Yadav', cardNo: 'PMJAY-1001', age: 45 },
      { familyId: 'FAM-001', memberName: 'Geeta Yadav', cardNo: 'PMJAY-1002', age: 42 },
      { familyId: 'FAM-001', memberName: 'Aman Yadav', cardNo: 'PMJAY-1003', age: 19 },
      { familyId: 'FAM-002', memberName: 'Sunita Devi', cardNo: 'PMJAY-2001', age: 50 },
      { familyId: 'FAM-002', memberName: 'Rajesh Kumar', cardNo: 'PMJAY-2002', age: 28 },
      { familyId: 'FAM-003', memberName: 'Mohan Lal', cardNo: 'PMJAY-3001', age: 62 },
      { familyId: 'FAM-003', memberName: 'Kamla Devi', cardNo: 'PMJAY-3002', age: 58 },
    ]);
  }

  // SAMPLE rates for the project, not the official PM-JAY package rates
  private async seedPackages() {
    await this.packages.save([
      { code: 'GS-001', name: 'Appendectomy', specialty: 'General Surgery', rate: 25000, expectedDays: 3 },
      { code: 'GS-002', name: 'Hernia Repair', specialty: 'General Surgery', rate: 22000, expectedDays: 2 },
      { code: 'GS-003', name: 'Gallbladder Removal', specialty: 'General Surgery', rate: 30000, expectedDays: 3 },
      { code: 'OR-001', name: 'Total Knee Replacement', specialty: 'Orthopedics', rate: 90000, expectedDays: 5 },
      { code: 'OR-002', name: 'Femur Fracture Fixation', specialty: 'Orthopedics', rate: 45000, expectedDays: 5 },
      { code: 'OB-001', name: 'Normal Delivery', specialty: 'Obstetrics', rate: 9000, expectedDays: 2 },
      { code: 'OB-002', name: 'Caesarean Section', specialty: 'Obstetrics', rate: 18000, expectedDays: 4 },
      { code: 'CA-001', name: 'Angioplasty (single stent)', specialty: 'Cardiology', rate: 80000, expectedDays: 3 },
      { code: 'OP-001', name: 'Cataract Surgery', specialty: 'Ophthalmology', rate: 8000, expectedDays: 1 },
      { code: 'UR-001', name: 'Kidney Stone Removal', specialty: 'Urology', rate: 35000, expectedDays: 3 },
      { code: 'GM-001', name: 'Pneumonia Management', specialty: 'General Medicine', rate: 15000, expectedDays: 5 },
      { code: 'GM-002', name: 'Dengue Management', specialty: 'General Medicine', rate: 12000, expectedDays: 4 },
    ]);
  }
}