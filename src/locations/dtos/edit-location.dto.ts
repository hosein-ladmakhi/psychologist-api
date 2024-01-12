import { IsOptional, IsString } from 'class-validator';

export class EditLocationDTO {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
