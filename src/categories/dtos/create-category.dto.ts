import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDTO {
  @IsNotEmpty()
  @IsString()
  faName: string;

  @IsNotEmpty()
  @IsString()
  enName: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
