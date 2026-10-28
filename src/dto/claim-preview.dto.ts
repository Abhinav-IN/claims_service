import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ClaimPreviewDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  finalBill: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nonPayable?: number;
}