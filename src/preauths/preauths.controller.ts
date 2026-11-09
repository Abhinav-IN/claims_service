import { Body, Controller, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PreauthsService } from './preauths.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/claims.enums.js';
import { ResubmitPreauthDto } from '../dto/preAuth.dto.js';
import { AuthGuard } from '../common/guards/auth.guard.js';

@ApiTags('preauths')
@ApiBearerAuth()
@Controller('api/v1/preauths')
export class PreauthsController {constructor(private preauths: PreauthsService) {}

  @UseGuards(AuthGuard)
  @Roles(Role.DOCTOR)
  @Post(':id/resubmit')
  async resubmit(
    @Req() req : any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResubmitPreauthDto,
  ) {
    return await this.preauths.resubmit_service(req.user, id, dto.reply);
  }
}