import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TherapistScheduleType } from '../therapist-schedules.entity';

export class AddOwnSchedulesDTO {
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsNotEmpty()
  @IsNumber()
  day: number;

  @IsNotEmpty()
  @IsNumber()
  location: number;

  @IsNotEmpty()
  @IsNumber()
  room: number;

  @IsNotEmpty()
  @IsEnum(TherapistScheduleType)
  type: TherapistScheduleType;
}
