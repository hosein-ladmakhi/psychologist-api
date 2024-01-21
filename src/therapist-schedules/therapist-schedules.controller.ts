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
import { AddTherapistSchedulesDTO } from './dtos/add-therapist-schedules.dto';
import { TherapistSchedules } from './therapist-schedules.entity';
import { Therapist } from 'src/users/therapist/therapist.entity';
import { Locations } from 'src/locations/locations.entity';

@Controller('therapist-schedules')
export class TherapistSchedulesController {
  @Post()
  async createTherapistSchedules(@Body() body: AddTherapistSchedulesDTO) {
    const therapist = await Therapist.findOne({
      where: { id: body.therapist },
    });

    if (!therapist) {
      throw new NotFoundException('therapist is not defined');
    }

    const location = await Locations.findOne({
      where: { id: body.location },
    });

    if (!location) {
      throw new NotFoundException('location is not defined');
    }

    return TherapistSchedules.save(
      TherapistSchedules.create({
        day: body.day,
        endHour: body.endTime,
        location,
        therapist,
        type: body.type,
        startHour: body.startTime,
        room: body.room,
      }),
    );
  }

  @Get('/therapist/per-day/:id')
  async getTherapistSchedulesPerDay(@Param('id', ParseIntPipe) id: number) {
    const datas = await TherapistSchedules.find({
      where: { therapist: { id } },
    });
    const days = [
      {
        day: 1,
        items: [],
      },
      {
        day: 2,
        items: [],
      },
      {
        day: 3,
        items: [],
      },
      {
        day: 4,
        items: [],
      },
      {
        day: 5,
        items: [],
      },
      {
        day: 6,
        items: [],
      },
      {
        day: 7,
        items: [],
      },
    ];

    return days.map((daysItem) => {
      const items = datas.filter((element) => element.day === daysItem.day);
      return { ...daysItem, items };
    });
  }

  @Get('/therapist/:id/day/:day')
  async getTherapistSchedulesBasedOnTherapistAndDay(
    @Query() query = {},
    @Param('id', ParseIntPipe) id: number,
    @Param('day', ParseIntPipe) day: number,
  ) {
    let where: Record<any, any> = {
      therapist: { id },
      day,
    };
    const limit = +(query['limit'] || 10);
    const page = +(query['page'] || 0) * limit;
    const content = await TherapistSchedules.find({
      order: { id: -1 },
      skip: page,
      take: limit,
      where,
      relations: {
        location: true,
        therapist: true,
      },
    });

    const count = await TherapistSchedules.count({
      where,
    });

    return { content, count };
  }

  @Get('/therapist/:id')
  async getTherapistSchedules(
    @Query() query = {},
    @Param('id', ParseIntPipe) id: number,
  ) {
    let where: Record<any, any> = {
      therapist: { id },
    };
    const limit = +(query['limit'] || 10);
    const page = +(query['page'] || 0) * limit;
    const content = await TherapistSchedules.find({
      order: { id: -1 },
      skip: page,
      take: limit,
      where,
      relations: {
        location: true,
        therapist: true,
      },
    });
    const count = await TherapistSchedules.count({
      where,
    });

    return { content, count };
  }

  @Get('/reservation')
  async getSchedulesReservation(@Query() query = {}) {
    let where: Record<any, any> = {};
    const content = await TherapistSchedules.find({
      order: { id: -1 },
      where,
      relations: {
        location: true,
        therapist: { workingFields: true },
      },
    });
    return content;
  }

  @Delete(':id')
  async deleteSchedule(@Param('id', ParseIntPipe) id: number) {
    const schedule = await TherapistSchedules.findOne({
      where: { id },
    });
    if (!schedule) {
      throw new NotFoundException('schedule is not defined');
    }
    await schedule.remove();
    return schedule;
  }
}
