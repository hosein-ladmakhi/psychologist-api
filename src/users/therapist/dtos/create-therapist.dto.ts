import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DegtreeOfEducation, Gender } from '../therapist.entity';

export class CreateTherapistDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  phone2: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(DegtreeOfEducation)
  degreeOfEducation: DegtreeOfEducation;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  bio: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsArray()
  workingFields: number[];
}
