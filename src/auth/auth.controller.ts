import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Inject,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Categories } from 'src/categories/categories.entity';
import { CreatePatientDTO } from 'src/users/patient/dtos/create-patient.dto';
import { Patient } from 'src/users/patient/patient.entity';
import { CreateTherapistDTO } from 'src/users/therapist/dtos/create-therapist.dto';
import {
  DegtreeOfEducation,
  Gender,
  Therapist,
} from 'src/users/therapist/therapist.entity';
import { In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginDTO } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  @Inject(JwtService) private readonly jwtService: JwtService;

  @Post('login/:type')
  async login(@Param('type') type: string, @Body() body: LoginDTO) {
    switch (type) {
      case 'therapist': {
        const therapist = await Therapist.findOne({
          where: { phone: body.phone },
        });
        if (!therapist) {
          throw new NotFoundException('therapist is not found');
        }
        const hashedPassword = await bcrypt.compare(
          body.password,
          therapist.password,
        );
        if (!hashedPassword) {
          throw new NotFoundException('therapist is not found');
        }
        return {
          token: this.jwtService.sign({ id: therapist.id, role: 'therapist' }),
        };
      }
      case 'admin': {
        // plainToInstance(CreateTherapistDTO, body);
        break;
      }
      case 'patient': {
        const patient = await Patient.findOne({
          where: { phone: body.phone },
        });
        if (!patient) {
          throw new NotFoundException('patient is not found');
        }
        const hashedPassword = await bcrypt.compare(
          body.password,
          patient.password,
        );
        if (!hashedPassword) {
          throw new NotFoundException('patient is not found');
        }
        return {
          token: this.jwtService.sign({ id: patient.id, role: 'patient' }),
        };
      }
    }
  }

  @Post('signup/:type')
  async signup(@Param('type') type: string, @Body() body: any) {
    switch (type) {
      case 'therapist': {
        const dto = plainToInstance(CreatePatientDTO, body);
        const error = await validate(dto);
        if (error.length) throw new BadRequestException(error);
        if (
          await Therapist.findOne({
            where: [
              { firstName: dto.firstName, lastName: dto.lastName },
              {
                phone: dto.phone,
              },
            ],
          })
        ) {
          throw new ConflictException('Duplicated Therapist');
        }
        const hashedPassword = await bcrypt.hash(body.password, 8);
        const therapist = await Therapist.save(
          Therapist.create({
            phone: dto.phone,
            firstName: dto.firstName,
            lastName: dto.lastName,
            password: hashedPassword,
            phone2: dto.phone,
            bio: '',
            address: '',
            degreeOfEducation: DegtreeOfEducation.associate,
            gender: Gender.unknown,
            image: '',
          }),
        );

        return {
          token: this.jwtService.sign({ id: therapist.id, role: 'therapist' }),
        };
      }
      case 'admin': {
        // plainToInstance(CreateTherapistDTO, body);
        break;
      }
      case 'patient': {
        const dto = plainToInstance(CreatePatientDTO, body);
        const error = await validate(dto);
        if (error.length) throw new BadRequestException(error);
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
        const hashedPassword = await bcrypt.hash(body.password, 8);
        const newPatient = await Patient.save(
          Patient.create({
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            password: hashedPassword,
          }),
        );
        return {
          token: this.jwtService.sign({ id: newPatient.id, role: 'patient' }),
        };
      }
    }
  }
}
