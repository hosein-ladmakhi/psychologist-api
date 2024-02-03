import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SaveOrderDto } from './dtos/save-order.dto';
import { Therapist } from 'src/users/therapist/therapist.entity';
import { Patient } from 'src/users/patient/patient.entity';
import { Locations } from 'src/locations/locations.entity';
import { Categories } from 'src/categories/categories.entity';
import { ILike, In } from 'typeorm';
import { Orders } from './orders.entity';
import { MultipleSaveOrderDto } from './dtos/multiple-save-order.dto';
import * as moment from 'moment';

@Controller('orders')
export class OrdersController {
  @Post()
  async saveOrder(@Body() body: SaveOrderDto) {
    // therapist checking
    const therapist = await Therapist.findOne({
      where: { id: body.therapist },
    });
    if (!therapist) {
      throw new NotFoundException('therapist is not defined');
    }

    // patient checking
    const patient = await Patient.findOne({ where: { id: body.patient } });
    if (!patient) {
      throw new NotFoundException('patient is not defined');
    }

    // location checking
    const location = await Locations.findOne({ where: { id: body.location } });

    if (!location) {
      throw new NotFoundException('location is not defined');
    }

    // categories checking
    const categories = await Categories.find({
      where: { id: In(body.categories) },
    });

    if (categories.length !== body.categories.length) {
      throw new NotFoundException('categories is not valid');
    }

    return Orders.save(
      Orders.create({
        address: location.address,
        city: location.city,
        categories: categories,
        date: body.date,
        day: body.day,
        endHour: body.endHour,
        patient,
        room: body.room,
        startHour: body.startHour,
        therapist,
        type: body.type,
      }),
    );
  }

  @Post('multiple')
  async multipleSaveOrder(@Body() body: MultipleSaveOrderDto) {
    const responses: any[] = [];
    for (let i = 0; i < body.items.length; i++) {
      const response = await this.saveOrder(body.items[i]);
      responses.push(response);
    }

    return responses;
  }

  @Get()
  getOrders() {
    return Orders.find();
  }

  @Get('page')
  async getOrdersPage(@Query() query: any = {}) {
    console.log(query);
    let where: Record<any, any> = {};
    if (query.status) where['status'] = query.status;
    const limit = +(query['limit'] || 10);
    const page = +(query['page'] || 0) * limit;
    const content = await Orders.find({
      order: { id: -1 },
      skip: page,
      take: limit,
      where,
      relations: {
        therapist: true,
        patient: true,
        documentation: true,
      },
    });
    const count = await Orders.count({
      where,
    });

    return { content, count };
  }

  @Patch('change-status/:id')
  async changeOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    const order = await Orders.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('order is not defined');
    }
    order.status = body.status;
    return order.save();
  }

  @Get('own')
  async getOwnOrder(@Query() query: any) {
    const therapist = await Therapist.findOne({ where: {} });
    let where: Record<any, any> = {
      therapist: { id: therapist.id },
    };
    if (query.status) where['status'] = query.status;
    if (query.day) where['day'] = +query.day;
    if (query.date) where['date'] = query.date;
    if (query.location) where['address'] = ILike(`%${query.location}%`);
    if (query.patient) where['patient'] = { id: +query.patient };
    if (query.category) where['categories'] = ILike(`%${query.category}%`); //Must Repair In Future
    if (query.type) where['type'] = query.type;
    if (query.status) where['status'] = query.status;
    if (query.startHour) where['startHour'] = query.startHour;
    if (query.endHour) where['endHour'] = query.endHour;
    const content = await Orders.find({
      order: { id: -1 },
      where,
      relations: {
        therapist: true,
        patient: true,
        documentation: true,
      },
    });
    return content;
  }

  @Get('detail/:therapistId')
  async getOrderObjects(@Param('therapistId') therapistId: number) {
    const orders = await Orders.find({
      order: { id: -1 },
      where: { therapist: { id: therapistId } },
      relations: {
        patient: true,
      },
    });
    const patients = orders
      .map((e) => e.patient)
      .reduce((acc, item) => {
        if (!acc.find((element) => element.id === item.id)) acc.push(item);
        return acc;
      }, []);

    const locations = orders
      .map((e) => e.address)
      .reduce((acc, item) => {
        if (!acc.includes(item)) acc.push(item);
        return acc;
      }, []);

    const times = orders
      .map((e) => `${e.startHour}_${e.endHour}`)
      .reduce((acc, item) => {
        if (!acc.includes(item)) acc.push(item);
        return acc;
      }, []);

    const categories = orders
      .map((e) => e.categories)
      .reduce((acc, item) => {
        item.map((i) => acc.push(i));
        return acc;
      }, [])
      .reduce((acc, item) => {
        if (!acc.find((e) => e.enName === item.enName)) acc.push(item);
        return acc;
      }, []);

    return { patients, locations, times, categories };
  }

  @Get('today/:therapistId')
  getTodayOrder(@Param('therapistId') id: number) {
    console.log(new Date().toLocaleDateString());
    return Orders.find({
      where: { date: moment().format('YYYY-MM-DD') as any, therapist: { id } },
      order: { id: -1 },
      relations: {
        therapist: true,
        patient: true,
        documentation: true,
      },
    });
  }

  @Get('patient/:patientId')
  getOrderByPatientId(@Param('patientId') id: number) {
    return Orders.find({
      where: { patient: { id } },
      relations: {
        documentation: { order: { therapist: true } },
        therapist: true,
        patient: true,
      },
      order: { id: -1 },
    });
  }

  @Get(':id')
  getOrderById(@Param('id') id: number) {
    return Orders.findOne({
      where: { id },
      relations: {
        documentation: { order: { therapist: true } },
        therapist: true,
        patient: true,
      },
    });
  }
}
