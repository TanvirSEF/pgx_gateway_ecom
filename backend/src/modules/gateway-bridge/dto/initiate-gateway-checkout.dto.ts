import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitiateGatewayCheckoutDto {
  @ApiProperty({ description: 'Merchant Reference ID on PGX Gateway', example: 'REF_98124' })
  @IsString()
  @IsNotEmpty()
  merchantRefId: string;

  @ApiPropertyOptional({ description: 'Reseller ID on PGX Gateway', example: 'arxopay' })
  @IsString()
  @IsOptional()
  resellerId?: string;

  @ApiProperty({ description: 'Merchant Order Identifier', example: 'ORD-9821' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Transaction Amount (in major currency units, e.g. 50.00)', example: 50.00 })
  @IsNumber()
  @Min(0.5)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Customer email address', example: 'customer@example.com' })
  @IsString()
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Customer full name', example: 'Alex Smith' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Product title displayed on Stripe invoice', example: 'Digital Asset License' })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({ description: 'URL to redirect customer upon successful payment' })
  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({ description: 'URL to redirect customer if payment is cancelled' })
  @IsString()
  @IsNotEmpty()
  cancelUrl: string;

  @ApiPropertyOptional({ description: 'Routing mode: test for sandbox trial, live for real payments', example: 'test', default: 'test' })
  @IsString()
  @IsOptional()
  mode?: 'test' | 'live';
}
