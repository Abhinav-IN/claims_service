import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards,} from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse,} from '@nestjs/swagger';
import { CoverageService } from './coverage.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/claims.enums.js';
import { Request } from 'express';
import { VerifyCoverageDto } from '../dto/verify-coverage.dto.js';

@ApiTags('coverage')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('/api/v1/coverage')
export class CoverageController {
  constructor(private readonly coverageService: CoverageService) {}

  @Post('/verify')
  @Roles(Role.PATIENT)
  @ApiOkResponse({ description: 'Coverage verified and saved successfully' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired JWT',
  })
  @ApiForbiddenResponse({
    description: 'User role is not permitted to verify coverage',
  })
  async verify(@Req() req: any, @Body() dto: VerifyCoverageDto) {
    return await this.coverageService.verify_service(req.user.id, dto.type, dto.ref);
  }

  @Get('/me')
  @Roles(Role.PATIENT)
  @ApiOkResponse({ description: 'Returns the current patient coverage' })
  async get_coverage(@Req() req: any) {
    return await this.coverageService.get_coverage_service(req.user.id);
  }
}
