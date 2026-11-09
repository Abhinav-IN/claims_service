import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ClaimStatus } from '../common/enums/claims.enums.js';

export class ListClaimsDto {
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;
}

export class RejectClaimDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}