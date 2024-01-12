import { Module } from '@nestjs/common';
import { TherapistSchedulesDayOffController } from './therapist-schedules-day-off.controller';

@Module({
  controllers: [TherapistSchedulesDayOffController]
})
export class TherapistSchedulesDayOffModule {}
