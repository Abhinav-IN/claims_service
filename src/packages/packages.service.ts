
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthPackage } from '../entities/health-package.entity.js';

@Injectable()
export class PackagesService {
  constructor(@InjectRepository(HealthPackage) private readonly packages: Repository<HealthPackage>) {}

  async find_all_packages_service(): Promise<HealthPackage[]> {
    return await this.packages.find({
      order: {
        specialty: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findByCode(code: string): Promise<HealthPackage | null> {
    return this.packages.findOne({
      where: { code },
    });
  }
}
