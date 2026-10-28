import { Module } from '@nestjs/common';
import { SeedService } from './seed.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeskUser } from '../entities/desk-user.entity.js';
import { TpaPolicy } from '../entities/tpa-policy.entity.js';
import { PmjayFamily } from '../entities/pmjay-family.entity.js';
import { PmjayMember } from '../entities/pmjay-member.entity.js';
import { HealthPackage } from '../entities/health-package.entity.js';

@Module({
    imports : [TypeOrmModule.forFeature([DeskUser, TpaPolicy, PmjayFamily, PmjayMember, HealthPackage])],
    providers : [SeedService],
})
export class SeedModule {}
