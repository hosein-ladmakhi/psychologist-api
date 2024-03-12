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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as jimp from 'jimp';
import { FileDTO } from 'src/core/dtos/FileDTO';
import * as path from 'path';
import { CreateTherapistDTO } from './dtos/create-therapist.dto';
import { Therapist } from './therapist.entity';
import { ILike, In, Like } from 'typeorm';
import { Categories } from 'src/categories/categories.entity';
import { EditTherapistDTO } from './dtos/edit-therapist.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TokenGuard } from 'src/auth/token.guard';

@Controller('therapist')
export class TherapistController {
  @UseGuards(TokenGuard)
  @Post('/profile')
  @UseInterceptors(FileInterceptor('image'))
  uploadProfileImage(@UploadedFile() file: FileDTO) {
    const filePath = `/upload/${new Date().getTime()}-${Math.floor(
      Math.random() * 100000000,
    )}.png`;
    return jimp
      .read(file.buffer)
      .then((image) => {
        image
          .resize(320, 320)
          .quality(80)
          .write(path.join(__dirname, '..', '..', '..', filePath));
      })
      .then(() => {
        return { filePath };
      })
      .catch(() => {
        return '';
      });
  }

  @UseGuards(TokenGuard)
  @Post()
  async createNewTherapist(@Body() dto: CreateTherapistDTO) {
    if (
      await Therapist.findOne({
        where: [
          { firstName: dto.firstName, lastName: dto.lastName },
          {
            phone: dto.phone,
          },
          {
            phone2: dto.phone2,
          },
        ],
      })
    ) {
      throw new ConflictException('Duplicated Therapist');
    }

    const workingFields = await Categories.find({
      where: { id: In(dto.workingFields) },
    });

    return Therapist.save(
      Therapist.create({
        address: dto.address,
        bio: dto.bio,
        degreeOfEducation: dto.degreeOfEducation,
        phone: dto.phone,
        phone2: dto.phone2,
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        image: dto.image,
        workingFields,
      }),
    );
  }

  @Get()
  async getTherapists(@Query() query = {}) {
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
    if (query['firstName.contains']) {
      where = {
        ...where,
        firstName: ILike(`%${query['firstName.startWith']}%`),
      };
    }
    if (query['lastName.eq']) {
      where = { ...where, lastName: query['lastName.eq'] };
    }
    if (query['lastName.startWith']) {
      where = { ...where, lastName: ILike(`${query['lastName.startWith']}%`) };
    }
    if (query['lastName.contains']) {
      where = { ...where, lastName: ILike(`%${query['lastName.startWith']}%`) };
    }
    if (query['phone.eq']) {
      where = { ...where, phone: query['phone.eq'] };
    }
    if (query['phone.startWith']) {
      where = { ...where, phone: Like(`${query['phone.startWith']}%`) };
    }

    const limit = +(query['limit'] || 10);
    const page = +(query['page'] || 0) * limit;
    const content = await Therapist.find({
      order: { id: -1 },
      skip: page,
      take: limit,
      where,
      relations: {
        workingFields: true,
      },
    });
    const count = await Therapist.count({
      where,
    });

    return { content, count };
  }

  @UseGuards(TokenGuard)
  @Patch('own')
  updateOwnProfile(
    @CurrentUser() user: Therapist,
    @Body() body: EditTherapistDTO,
  ) {
    return this.updateTherapist(user.id, body);
  }

  @UseGuards(TokenGuard)
  @Delete(':id')
  async deleteTherapist(@Param('id', ParseIntPipe) id: number) {
    const therapist = await Therapist.findOne({ where: { id } });
    if (!therapist) {
      throw new NotFoundException('therapist is not defined');
    }
    await therapist.remove();
    return therapist;
  }

  @Patch(':id')
  @UseGuards(TokenGuard)
  async updateTherapist(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: EditTherapistDTO,
  ) {
    const therapist = await Therapist.findOne({ where: { id } });
    if (!therapist) {
      throw new NotFoundException('therapist is not defined');
    }
    Object.keys(body).map((b) => (therapist[b] = body[b]));
    if (body.workingFields) {
      therapist.workingFields = await Categories.find({
        where: { id: In(body.workingFields) },
      });
    }
    return therapist.save();
  }

  @Get(':id')
  getTherapistById(@Param('id', ParseIntPipe) id: number) {
    console.log('salam');
    return Therapist.findOne({
      where: { id },
      relations: {
        workingFields: true,
        patientsOrders: { patient: true },
        schedules: { location: true, daysOff: true },
      },
    });
  }
}
