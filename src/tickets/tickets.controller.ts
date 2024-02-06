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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TokenGuard } from 'src/auth/token.guard';
import { CreateTicketDTO } from './dtos/create-ticket.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Patient } from 'src/users/patient/patient.entity';
import { Tickets } from './tickets.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileDTO } from 'src/core/dtos/FileDTO';
import * as path from 'path';
import { writeFileSync } from 'fs';
import { IsNull } from 'typeorm';

@UseGuards(TokenGuard)
@Controller('tickets')
export class TicketsController {
  @Post()
  @UseInterceptors(FilesInterceptor('attachments'))
  async createTicket(
    @Body() body: CreateTicketDTO,
    @CurrentUser() user: Patient,
    @UploadedFiles() files: FileDTO[],
  ) {
    const attachments: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const fileName = `${new Date().getTime()}-${
        Math.floor(Math.random() * 100000) + 2000000
      }${path.extname(files[i].originalname)}`;
      writeFileSync(
        path.join(__dirname, '..', '..', 'upload', fileName),
        files[i].buffer,
      );

      attachments.push(fileName);
    }
    const data: Partial<Tickets> = {
      attachments,
      patient: user,
      title: body.title,
      content: body.content,
    };
    if (body.parent) {
      data.parent = await Tickets.findOne({ where: { id: body.parent } });
    }
    return Tickets.save(Tickets.create(data as Tickets));
  }

  @Get('own')
  async getOwnTickets(@CurrentUser() user: Patient, @Query() query = {}) {
    let where: Record<any, any> = {
      patient: { id: user.id },
      parent: IsNull(),
    };

    const limit = +(query['limit'] || 10);
    const page = +(query['page'] || 0) * limit;
    const content = await Tickets.find({
      order: { id: -1 },
      skip: page,
      take: limit,
      where,
      relations: {
        childrens: true,
      },
    });
    const count = await Tickets.count({
      where,
    });
    return { content, count };
  }

  @Delete(':id')
  async deleteTicket(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Patient,
  ) {
    const ticket = await Tickets.findOne({
      where: { id, patient: { id: user.id } },
    });
    if (!ticket) {
      throw new NotFoundException('tickets is not defined');
    }
    return ticket.remove();
  }
}
