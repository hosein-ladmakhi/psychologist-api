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
import { In } from 'typeorm';
import { Orders } from './orders.entity';
import { MultipleSaveOrderDto } from './dtos/multiple-save-order.dto';

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

  @Get('own/page')
  async getOwnOrder(@Query() query: any) {
    const therapist = await Therapist.findOne({ where: {} });
    let where: Record<any, any> = {
      therapist: { id: therapist.id },
    };
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
}
