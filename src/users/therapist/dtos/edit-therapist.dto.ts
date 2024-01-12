import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { DegtreeOfEducation, Gender } from '../therapist.entity';

export class EditTherapistDTO {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  phone2?: string;

  @IsOptional()
  @IsString()
  @IsEnum(DegtreeOfEducation)
  degreeOfEducation?: DegtreeOfEducation;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  workingFields?: number[];
}
