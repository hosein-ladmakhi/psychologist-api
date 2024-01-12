import { Module } from '@nestjs/common';
import { TherapistController } from './therapist.controller';

@Module({ controllers: [TherapistController] })
export class TherapistModule {}
