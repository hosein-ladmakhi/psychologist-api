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
  UseGuards,
} from '@nestjs/common';
import { AddTherapistSchedulesDTO } from './dtos/add-therapist-schedules.dto';
import { TherapistSchedules } from './therapist-schedules.entity';
import { Therapist } from 'src/users/therapist/therapist.entity';
import { Locations } from 'src/locations/locations.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TokenGuard } from 'src/auth/token.guard';
import { AddOwnSchedulesDTO } from './dtos/add-own-schedule.dto';

@Controller('therapist-schedules')
export class TherapistSchedulesController {
  @UseGuards(TokenGuard)
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
  @UseGuards(TokenGuard)
  @Post('own')
  async createOwnSchedules(
    @Body() body: AddOwnSchedulesDTO,
    @CurrentUser() user: Therapist,
  ) {
    const therapist = await Therapist.findOne({
      where: { id: user.id },
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

  @Get('filtered-data')
  async getOwnScheduleFilteredData(@CurrentUser() user: Therapist) {
    const content = await TherapistSchedules.find({
      order: { id: -1 },
      where: { therapist: { id: user.id } },
      relations: {
        location: true,
      },
    });

    return {
      locations: content.map((c) => c.location),
      times: content.map((t) => `${t.startHour}_${t.endHour}`),
      rooms: content.map((c) => c.room),
    };
  }

  @Get('/therapist/per-day/:id')
  async getTherapistSchedulesPerDay(@Param('id', ParseIntPipe) id: number) {
    const datas = await TherapistSchedules.find({
      where: { therapist: { id } },
      relations: { location: true, therapist: { workingFields: true } },
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

  @Get('/therapist/own')
  @UseGuards(TokenGuard)
  async getTherapistSchedulesByOwn(
    @CurrentUser() user: Therapist,
    @Query() query: any = {},
  ) {
    console.log(123, query);
    let where: Record<any, any> = {
      therapist: { id: user.id },
    };
    if (query['day']) where['day'] = query['day'];
    if (query['location']) where['location'] = { id: query['location'] };
    if (query['room']) where['room'] = query['room'];
    if (query['type']) where['type'] = query['type'];
    if (query['startHour']) where['startHour'] = query['startHour'];
    if (query['endHour']) where['endHour'] = query['endHour'];
    const content = await TherapistSchedules.find({
      order: { id: -1 },
      where,
      relations: {
        location: true,
      },
    });

    return content;
  }

  @Get('/therapist/reserve/:id')
  getTherapistScheduleForOrder() {}

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
  @UseGuards(TokenGuard)
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
