import { Module } from '@nestjs/common';
import { PatientModule } from './patient/patient.module';
import { TherapistModule } from './therapist/therapist.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [PatientModule, TherapistModule, AdminModule]
})
export class UsersModule {}
