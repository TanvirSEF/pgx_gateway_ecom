// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RedeemHandoffDto {
  @ApiProperty({ description: 'The signed one-time payment handoff token issued by PGX Casino' })
  @IsString()
  @MinLength(10)
  token: string;
}
