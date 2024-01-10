import { IsOptional, IsString } from 'class-validator';

export class EditCategoryDTO {
  @IsOptional()
  @IsString()
  faName?: string;

  @IsOptional()
  @IsString()
  enName?: string;
}
