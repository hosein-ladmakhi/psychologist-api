import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { TherapistScheduleType } from 'src/therapist-schedules/therapist-schedules.entity';
import { BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

export class SaveOrderDto {
  @IsNotEmpty()
  @IsNumber()
  patient: number;

  @IsNotEmpty()
  @IsNumber()
  therapist: number;

  @IsNotEmpty()
  @IsNumber()
  day: number;

  @IsNotEmpty()
  @IsNumber()
  location: number;

  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  @IsNumber()
  room: number;

  @IsNotEmpty()
  @IsInt({ each: true })
  @IsArray()
  categories: number[];

  @IsNotEmpty()
  @IsString()
  type: TherapistScheduleType;

  @IsNotEmpty()
  @IsString()
  startHour: string;

  @IsNotEmpty()
  @IsString()
  endHour: string;
}
