import { IsNotEmpty } from 'class-validator';

export class AddTherapistSchedulesDayOffDTO {
  @IsNotEmpty()
  schedule: number;

  @IsNotEmpty()
  date: string;
}
