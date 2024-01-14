import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { SaveOrderDto } from './dtos/save-order.dto';
import { Therapist } from 'src/users/therapist/therapist.entity';
import { Patient } from 'src/users/patient/patient.entity';
import { Locations } from 'src/locations/locations.entity';
import { Categories } from 'src/categories/categories.entity';
import { In } from 'typeorm';
import { Orders } from './orders.entity';

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
}
