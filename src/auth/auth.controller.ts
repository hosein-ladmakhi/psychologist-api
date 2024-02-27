import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePatientDTO } from 'src/users/patient/dtos/create-patient.dto';
import { Patient } from 'src/users/patient/patient.entity';
import {
  DegtreeOfEducation,
  Gender,
  Therapist,
} from 'src/users/therapist/therapist.entity';
import * as bcrypt from 'bcryptjs';
import { LoginDTO } from './dtos/login.dto';
import { CurrentUser } from './current-user.decorator';
import { TokenGuard } from './token.guard';
import { UpdatePasswordDTO } from './dtos/update-password.dto';

@Controller('auth')
export class AuthController {
  @Inject(JwtService) private readonly jwtService: JwtService;

  @UseGuards(TokenGuard)
  @Patch('/patient/password')
  async changePatientPassword(
    @Body() body: UpdatePasswordDTO,
    @CurrentUser() user: Patient,
  ) {
    const updatedUser = await Patient.findOne({ where: { id: user.id } });
    const isSamePassword = await bcrypt.compare(
      body.currentPassword,
      updatedUser.password,
    );
    if (updatedUser.password && !isSamePassword) {
      return { message: 'Invalid Password', success: false };
    }
    updatedUser.password = await bcrypt.hash(body.password, 8);
    await updatedUser.save();
    return { success: true };
  }

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
          token: this.jwtService.sign({
            userId: therapist.id,
            role: 'therapist',
          }),
          user: therapist,
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
          token: this.jwtService.sign({ userId: patient.id, role: 'patient' }),
          user: patient,
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
          token: this.jwtService.sign({
            userId: therapist.id,
            role: 'therapist',
          }),
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
          token: this.jwtService.sign({
            userId: newPatient.id,
            role: 'patient',
          }),
        };
      }
    }
  }

  @UseGuards(TokenGuard)
  @Get('profile')
  getProfile(@CurrentUser() user) {
    return user;
  }
}
