import { IsInt, IsOptional, Min } from 'class-validator';

export class DischargeDto {
  @IsInt()
  @Min(1)
  finalBill: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  nonPayableAmount?: number;
}