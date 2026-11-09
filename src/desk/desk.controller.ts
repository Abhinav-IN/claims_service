import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/claims.enums.js';
import { PreauthsService } from '../preauths/preauths.service.js';
import { ClaimsService } from '../claims/claims.service.js';
import { ApprovePreauthDto, ListPreauthsDto, QueryPreauthDto, RejectPreauthDto } from '../dto/preAuth.dto.js';
import { ListClaimsDto, RejectClaimDto } from '../dto/claims.dto.js';
import { AuthGuard } from '../common/guards/auth.guard.js';

@ApiTags('desk')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles(Role.TPA_DESK, Role.PMJAY_DESK)
@Controller('api/v1/desk')
export class DeskController {
  constructor(private preauths: PreauthsService, private claims: ClaimsService) {}

  @Get('/preauths')
  async listPreauths(@Req() req : any, @Query() q: ListPreauthsDto) {
    return await this.preauths.list_for_desk_service(req.user, q.status);
  }

  @Post('preauths/:id/approve')
  async approve(
    @Req() req : any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApprovePreauthDto,
  ) {
    return await this.preauths.approve_service(req.user, id, dto);
  }

  @Post('preauths/:id/query')
  async query(
    @Req() req : any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: QueryPreauthDto,
  ) {
    return await this.preauths.query_service(req.user, id, dto.remarks);
  }

  @Post('preauths/:id/reject')
  async reject(
    @Req() req : any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectPreauthDto,
  ) {
    return await this.preauths.reject_service(req.user, id, dto.reason);
  }

  @Get('claims')
  async listClaims(@Req() req : any, @Query() q: ListClaimsDto) {
    return await this.claims.list_for_desk_service(req.user, q.status);
  }

  @Post('claims/:id/settle')
  async settle(
    @Req() req : any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.claims.settle_service(req.user, id);
  }

  @Post('claims/:id/reject')
  async rejectClaim(
    @Req() req : any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectClaimDto,
  ) {
    return await this.claims.reject_service(req.user, id, dto.reason);
  }
}