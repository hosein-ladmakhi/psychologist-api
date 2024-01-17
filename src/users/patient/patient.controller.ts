import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Patient } from './patient.entity';
import { CreatePatientDTO } from './dtos/create-patient.dto';
import { EditPatientDTO } from './dtos/edit-patient.dto';
import { ILike, Like } from 'typeorm';

@Controller('patient')
export class PatientController {
  @Post()
  async createPatient(@Body() body: CreatePatientDTO) {
    if (
      await Patient.findOne({
        where: [
          { firstName: body.firstName, lastName: body.lastName },
          { phone: body.phone },
        ],
      })
    ) {
      throw new ConflictException('Duplicated User');
    }
    return Patient.save(
      Patient.create({
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
      }),
    );
  }

  @Get()
  async getPatients(@Query() query = {}) {
    let where: Record<any, any> = {};
    if (query['firstName.eq']) {
      where = { ...where, firstName: query['firstName.eq'] };
    }
    if (query['firstName.startWith']) {
      where = {
        ...where,
        firstName: ILike(`${query['firstName.startWith']}%`),
      };
    }
    if (query['lastName.eq']) {
      where = { ...where, lastName: query['lastName.eq'] };
    }
    if (query['lastName.startWith']) {
      where = { ...where, lastName: ILike(`${query['lastName.startWith']}%`) };
    }
    if (query['phone.eq']) {
      where = { ...where, phone: query['phone.eq'] };
    }
    if (query['phone.startWith']) {
      where = { ...where, phone: Like(`${query['phone.startWith']}%`) };
    }

    const limit = +(query['limit'] || 10);
    const page = +(query['page'] || 0) * limit;
    const content = await Patient.find({
      order: { id: -1 },
      skip: page,
      take: limit,
      where,
      relations: { orders: true },
    });
    const count = await Patient.count({
      where,
    });

    return { content, count };
  }

  @Patch(':id')
  async updatePatient(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: EditPatientDTO,
  ) {
    const patient = await Patient.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException('patient is not defined');
    }
    Object.keys(body).map((b) => (patient[b] = body[b]));
    return patient.save();
  }

  @Delete(':id')
  async deletePatient(@Param('id', ParseIntPipe) id: number) {
    const patient = await Patient.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException('patient is not defined');
    }
    await patient.remove();
    return patient;
  }
}
