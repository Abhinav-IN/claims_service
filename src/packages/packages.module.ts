import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service.js';
import { PackagesController } from './packages.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthPackage } from '../entities/health-package.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([HealthPackage]), AuthModule],
  providers: [PackagesService],
  controllers: [PackagesController]
})
export class PackagesModule {}
