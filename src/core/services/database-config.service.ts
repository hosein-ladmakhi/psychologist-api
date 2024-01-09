import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Categories } from 'src/categories/categories.entity';
import { Locations } from 'src/locations/locations.entity';
import { TherapistSchedulesDayOff } from 'src/therapist-schedules-day-off/therapist-schedules-day-off.entity';
import { TherapistSchedules } from 'src/therapist-schedules/therapist-schedules.entity';
import { Patient } from 'src/users/patient/patient.entity';
import { Therapist } from 'src/users/therapist/therapist.entity';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      database: this.configService.get<string>('APP_DB_NAME'),
      password: this.configService.get<string>('APP_DB_PASSWORD'),
      username: this.configService.get<string>('APP_DB_USERNAME'),
      port: +this.configService.get<number>('APP_DB_PORT'),
      type: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
      entities: [
        Therapist,
        Patient,
        Categories,
        Locations,
        TherapistSchedules,
        TherapistSchedulesDayOff,
      ],
    };
  }
}
