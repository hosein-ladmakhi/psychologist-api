import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AddTherapistSchedulesDayOffDTO } from './dtos/add-therapist-schedules-day-off.dto';
import { TherapistSchedulesDayOff } from './therapist-schedules-day-off.entity';
import { TherapistSchedules } from 'src/therapist-schedules/therapist-schedules.entity';
import { Therapist } from 'src/users/therapist/therapist.entity';

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
    const therapists = await Therapist.find();
    const results: any[] = [];

    for (let i = 0; i < therapists.length; i++) {
      const therapist = therapists[i];
      const daysoff = await TherapistSchedulesDayOff.find({
        relations: { schedule: { therapist: true } },
        where: { schedule: { therapist: { id: therapist.id } } },
      });
      results.push({ user: therapist, items: daysoff });
    }
    return results;
  }

  @Get('/therapists/:id')
  async getTherapistsDayOffBaseOnTherapistId(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: any = {},
  ) {
    const limit = +(query['limit'] || 10);
    const page = +(query['page'] || 0) * limit;

    const daysOff = await TherapistSchedulesDayOff.find({
      where: { schedule: { therapist: { id } } },
      relations: { schedule: { therapist: true, location: true } },
      order: { id: -1 },
      skip: page,
      take: limit,
    });

    const daysOffCount = await TherapistSchedulesDayOff.count({
      where: { schedule: { therapist: { id } } },
    });

    return { content: daysOff, count: daysOffCount };
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
