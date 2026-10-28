
import { ApiProperty } from '@nestjs/swagger';

export class PackageResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'CARD-001' })
  code: string;

  @ApiProperty({ example: 'Cardiac Care Package' })
  name: string;

  @ApiProperty({ example: 'Cardiology' })
  specialty: string;

  @ApiProperty({ example: 50000, description: 'Package rate' })
  rate: number;

  @ApiProperty({ example: 5, description: 'Expected duration in days' })
  expectedDays: number;
}
