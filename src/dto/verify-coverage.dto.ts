import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PayerType } from '../common/enums/claims.enums.js';

export class VerifyCoverageDto {
  @IsEnum(PayerType)
  type: PayerType;

  // TPA policy number or Ayushman card number
  @IsString()
  @IsNotEmpty()
  ref: string;
}