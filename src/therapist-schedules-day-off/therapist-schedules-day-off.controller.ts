import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AddTherapistSchedulesDayOffDTO } from './dtos/add-therapist-schedules-day-off.dto';
import { TherapistSchedulesDayOff } from './therapist-schedules-day-off.entity';
import { TherapistSchedules } from 'src/therapist-schedules/therapist-schedules.entity';

@Controller('therapist-schedules-day-off')
export class TherapistSchedulesDayOffController {
  @Post()
  async createTherapistSchedulesDayOff(
    @Body() body: AddTherapistSchedulesDayOffDTO,
  ) {
    const schedule = await TherapistSchedules.findOne({
      where: { id: body.schedule },
    });

    if (!schedule) {
      throw new NotFoundException('schedule not defined');
    }

    return TherapistSchedulesDayOff.save(
      TherapistSchedulesDayOff.create({
        schedule,
        date: body.date,
      }),
    );
  }

  @Get('/therapists')
  async getTherapistsDayOff() {
    const daysoff = await TherapistSchedulesDayOff.find({
      relations: { schedule: { therapist: true } },
    });

    return daysoff.reduce((acc: any, item: TherapistSchedulesDayOff) => {
      const index = acc.findIndex(
        (element) => element.user.id === item.schedule.therapist.id,
      );
      if (index > -1) {
        acc[index]?.items?.push(item);
        return acc;
      }
      acc.push({ user: item.schedule.therapist, items: [item] });
      return acc;
    }, []);
  }

  @Delete(':id')
  async deleteTherapistSchedulesDayOff(@Param('id', ParseIntPipe) id: number) {
    const therapistSchedulesOffDay = await TherapistSchedulesDayOff.findOne({
      where: { id },
    });
    if (!therapistSchedulesOffDay) {
      throw new NotFoundException('Therapist Schedules Off Day is not defined');
    }
    await therapistSchedulesOffDay.remove();
    return therapistSchedulesOffDay;
  }
}
