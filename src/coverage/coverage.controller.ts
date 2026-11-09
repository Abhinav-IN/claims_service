import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CoverageService } from './coverage.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/claims.enums.js';
import { VerifyCoverageDto } from '../dto/verify-coverage.dto.js';

@ApiTags('coverage')
@UseGuards(AuthGuard)
@Controller('/api/v1/coverage')
export class CoverageController {
  constructor(private readonly coverageService: CoverageService) {}

  @Post('/verify')
  @Roles(Role.PATIENT)
  @ApiCreatedResponse({ description: 'Coverage verified and saved successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid user headers' })
  @ApiForbiddenResponse({ description: 'Only patients can verify coverage' })
  async verify(@Req() req: any, @Body() dto: VerifyCoverageDto) {
    return await this.coverageService.verify_service(req.user.id, dto.type, dto.ref);
  }

  @Get('/me')
  @Roles(Role.PATIENT)
  @ApiOkResponse({ description: 'Returns the current patient coverage' })
  @ApiNotFoundResponse({ description: 'No coverage on file for this patient' })
  async get_coverage(@Req() req: any) {
    return await this.coverageService.get_coverage_service(req.user.id);
  }

  @Get('/patient/:id')
  @Roles(Role.DOCTOR)
  @ApiOkResponse({ description: 'Returns the coverage of the given patient' })
  @ApiNotFoundResponse({ description: 'No coverage on file for this patient' })
  async get_patient_coverage(@Param('id', ParseIntPipe) id: number) {
    return await this.coverageService.get_coverage_service(id);
  }
}