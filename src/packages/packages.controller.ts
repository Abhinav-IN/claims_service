
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { PackagesService } from './packages.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/claims.enums.js';
import { PackageResponseDto } from '../dto/package.dto.js';

@ApiTags('packages')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/v1/packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get('/')
  @Roles(Role.PMJAY_DESK)
  @ApiOkResponse({
    description: 'List of available health packages',
    type: PackageResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired JWT',
  })
  @ApiForbiddenResponse({
    description: 'User role is not permitted to view packages',
  })
  async find_all_packages(): Promise<PackageResponseDto[]> {
    return await this.packagesService.find_all_packages_service();
  }
}
