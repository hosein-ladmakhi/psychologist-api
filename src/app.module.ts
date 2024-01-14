import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TherapistSchedulesModule } from './therapist-schedules/therapist-schedules.module';
import { LocationsModule } from './locations/locations.module';
import { TherapistSchedulesDayOffModule } from './therapist-schedules-day-off/therapist-schedules-day-off.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    CoreModule,
    UsersModule,
    CategoriesModule,
    TherapistSchedulesModule,
    LocationsModule,
    TherapistSchedulesDayOffModule,
    OrdersModule,
  ],
})
export class AppModule {}
