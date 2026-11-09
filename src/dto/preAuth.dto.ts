import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { PreauthStatus } from '../common/enums/claims.enums.js';

export class ResubmitPreauthDto {
  @IsString()
  @IsNotEmpty()
  reply: string;
}

export class ApprovePreauthDto {
  // required for TPA, ignored for Ayushman (fixed to package rate)
  @IsOptional()
  @IsInt()
  @Min(1)
  approvedAmount?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class QueryPreauthDto {
  @IsString()
  @IsNotEmpty()
  remarks: string;
}

export class RejectPreauthDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ListPreauthsDto {
  @IsOptional()
  @IsEnum(PreauthStatus)
  status?: PreauthStatus;
}