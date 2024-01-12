import { Module } from '@nestjs/common';
import { TherapistSchedulesController } from './therapist-schedules.controller';

@Module({
  controllers: [TherapistSchedulesController]
})
export class TherapistSchedulesModule {}
