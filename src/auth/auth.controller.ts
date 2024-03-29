import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreatePatientDTO } from "src/users/patient/dtos/create-patient.dto";
import { Patient } from "src/users/patient/patient.entity";
import {
  DegtreeOfEducation,
  Gender,
  Therapist
} from "src/users/therapist/therapist.entity";
import * as bcrypt from "bcryptjs";
import { LoginDTO } from "./dtos/login.dto";
import { CurrentUser } from "./current-user.decorator";
import { TokenGuard } from "./token.guard";
import { UpdatePasswordDTO } from "./dtos/update-password.dto";
import { Admin } from "src/users/admin/admin.entity";

@Controller("auth")
export class AuthController {
  @Inject(JwtService) private readonly jwtService: JwtService;

  @UseGuards(TokenGuard)
  @Patch("/patient/password")
  async changePatientPassword(
    @Body() body: UpdatePasswordDTO,
    @CurrentUser() user: Patient
  ) {
    const updatedUser = await Patient.findOne({ where: { id: user.id } });
    const isSamePassword = await bcrypt.compare(
      body.currentPassword,
      updatedUser.password
    );
    if (updatedUser.password && !isSamePassword) {
      return { message: "Invalid Password", success: false };
    }
    updatedUser.password = await bcrypt.hash(body.password, 8);
    await updatedUser.save();
    return { success: true };
  }


  @UseGuards(TokenGuard)
  @Patch("change-password/:type/:id")
  async changeUserPassword(@Param("type") type: string, @Param("id", ParseIntPipe) id: number, @Body() body: UpdatePasswordDTO) {
    if (type === "admin") {
      try {
        const user = await Admin.findOne({ where: { id } });
        if (!user) {
          throw new NotFoundException("admin is not defined");
        }
        const sameConfirmPassword = await bcrypt.compare(body.currentPassword, user.password);
        if (!sameConfirmPassword) {
          throw new NotFoundException("admin not defined with this password");
        }
        console.log(body);
        user.password = await bcrypt.hash(body.password, 8);
        await user.save();
        return { message: true };
      } catch (error) {
        console.log(error);
        return { message: false };
      }
    } else if (type === "therapist") {
      try {
        const user = await Therapist.findOne({ where: { id } });
        if (!user) {
          throw new NotFoundException("therapist is not defined");
        }
        const sameConfirmPassword = await bcrypt.compare(body.currentPassword, user.password);
        if (!sameConfirmPassword) {
          throw new NotFoundException("therapist not defined with this password");
        }
        user.password = await bcrypt.hash(body.password, 8);
        await user.save();
        return { message: true };
      } catch (error) {
        return { message: false };
      }
    } else if (type === "patient") {
      try {
        const user = await Patient.findOne({ where: { id } });
        if (!user) {
          throw new NotFoundException("patient is not defined");
        }
        const sameConfirmPassword = await bcrypt.compare(body.currentPassword, user.password);
        if (!sameConfirmPassword) {
          throw new NotFoundException("patient not defined with this password");
        }
        user.password = await bcrypt.hash(body.password, 8);
        await user.save();
        return { message: true };
      } catch (error) {
        return { message: false };
      }
    }

    throw new BadRequestException("Type must be 'Patient' or 'Therapist' or 'Admin'");
  }

  @Post("login/:type")
  async login(@Param("type") type: string, @Body() body: LoginDTO) {
    switch (type) {
      case "therapist": {
        const therapist = await Therapist.findOne({
          where: { phone: body.phone }
        });
        if (!therapist) {
          throw new NotFoundException("therapist is not found");
        }
        const hashedPassword = await bcrypt.compare(
          body.password,
          therapist.password
        );
        if (!hashedPassword) {
          throw new NotFoundException("therapist is not found");
        }
        return {
          token: this.jwtService.sign({
            userId: therapist.id,
            role: "therapist"
          }),
          user: therapist
        };
      }
      case "admin": {
        const admin = await Admin.findOne({
          where: { phone: body.phone }
        });
        if (!admin || !admin.isActive) {
          throw new NotFoundException("admin is not found");
        }
        const hashedPassword = await bcrypt.compare(
          body.password,
          admin.password
        );
        if (!hashedPassword) {
          throw new NotFoundException("admin is not found");
        }
        return {
          token: this.jwtService.sign({ userId: admin.id, role: "admin" }),
          user: admin
        };
      }
      case "patient": {
        const patient = await Patient.findOne({
          where: { phone: body.phone }
        });
        if (!patient) {
          throw new NotFoundException("patient is not found");
        }
        const hashedPassword = await bcrypt.compare(
          body.password,
          patient.password
        );
        if (!hashedPassword) {
          throw new NotFoundException("patient is not found");
        }
        return {
          token: this.jwtService.sign({ userId: patient.id, role: "patient" }),
          user: patient
        };
      }
    }
  }

  @Post("signup/:type")
  async signup(@Param("type") type: string, @Body() body: any) {
    switch (type) {
      case "therapist": {
        const dto = plainToInstance(CreatePatientDTO, body);
        const error = await validate(dto);
        if (error.length) throw new BadRequestException(error);
        if (
          await Therapist.findOne({
            where: [
              { firstName: dto.firstName, lastName: dto.lastName },
              {
                phone: dto.phone
              }
            ]
          })
        ) {
          throw new ConflictException("Duplicated Therapist");
        }
        const hashedPassword = await bcrypt.hash(body.password, 8);
        const therapist = await Therapist.save(
          Therapist.create({
            phone: dto.phone,
            firstName: dto.firstName,
            lastName: dto.lastName,
            password: hashedPassword,
            phone2: dto.phone,
            bio: "",
            address: "",
            degreeOfEducation: DegtreeOfEducation.associate,
            gender: Gender.unknown,
            image: ""
          })
        );

        return {
          token: this.jwtService.sign({
            userId: therapist.id,
            role: "therapist"
          })
        };
      }
      case "admin": {
        // plainToInstance(CreateTherapistDTO, body);
        break;
      }
      case "patient": {
        const dto = plainToInstance(CreatePatientDTO, body);
        const error = await validate(dto);
        if (error.length) throw new BadRequestException(error);
        if (
          await Patient.findOne({
            where: [
              { firstName: body.firstName, lastName: body.lastName },
              { phone: body.phone }
            ]
          })
        ) {
          throw new ConflictException("Duplicated User");
        }
        const hashedPassword = await bcrypt.hash(body.password, 8);
        const newPatient = await Patient.save(
          Patient.create({
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            password: hashedPassword
          })
        );
        return {
          token: this.jwtService.sign({
            userId: newPatient.id,
            role: "patient"
          })
        };
      }
    }
  }

  @UseGuards(TokenGuard)
  @Get("profile")
  getProfile(@CurrentUser() user) {
    return user;
  }
}
