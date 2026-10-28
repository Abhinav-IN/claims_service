import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, } from 'class-validator';

export class CreateCaseDto {
  @IsInt()
  @Min(1)
  appointmentId: number;

  @IsInt()
  @Min(1)
  patientId: number;

  @IsString()
  @IsNotEmpty()
  patientName: string;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  // required for Ayushman cases (rate is taken from the package)
  @IsOptional()
  @IsString()
  packageCode?: string;

  // required for TPA cases
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedCost?: number;

  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;
}