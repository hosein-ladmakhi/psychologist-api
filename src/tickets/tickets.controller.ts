import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
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
import { TicketStatus, Tickets } from './tickets.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileDTO } from 'src/core/dtos/FileDTO';
import * as path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { ILike, IsNull } from 'typeorm';
import * as AdmZip from 'adm-zip';

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

  @Get('page')
  async getTicketsPage(@Query() query: any = {}) {
    let where: Record<any, any> = { parent: IsNull() };
    const limit = +(query['limit'] || 10);
    const page = +(query['page'] || 0) * limit;
    if (query['title']) where['title'] = ILike(`${query['title']}%`);
    if (query['status']) where['status'] = query['status'];
    const content = await Tickets.find({
      order: { id: -1 },
      skip: page,
      take: limit,
      where,
      relations: {
        patient: true,
        parent: true,
        childrens: true,
      },
    });
    const count = await Tickets.count({
      where,
    });

    return { content, count };
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
        childrens: { parent: true },
      },
    });
    const count = await Tickets.count({
      where,
    });
    return { content, count };
  }

  @Delete('own/:id')
  async deleteOwnTicket(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Patient,
  ) {
    const ticket = await Tickets.findOne({
      where: { id, patient: { id: user.id } },
      relations: { childrens: true },
    });
    if (!ticket) {
      throw new NotFoundException('tickets is not defined');
    }
    await Tickets.remove(ticket.childrens);
    return ticket.remove();
  }

  @Post('answer/:id')
  async answerTicket(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const ticket = await Tickets.findOne({
      where: { id },
      relations: { childrens: true },
    });
    if (!ticket) {
      throw new NotFoundException('tickets is not defined');
    }
    ticket.answer = body.answer;
    ticket.answerAt = new Date();
    ticket.status = TicketStatus.Close;
    ticket.closeAt = new Date();
    await ticket.save();
    return ticket;
  }

  @Get('download/attachment/:id')
  async downloadAttachment(@Param('id', ParseIntPipe) id: number) {
    const ticket = await Tickets.findOne({
      where: { id },
      relations: { childrens: true },
    });
    if (!ticket) {
      throw new NotFoundException('tickets is not defined');
    }
    const zipFile = new AdmZip();
    for (let i = 0; i < ticket.attachments.length; i++) {
      const fileName = ticket.attachments[i];
      zipFile.addLocalFile(
        path.join(__dirname, '..', '..', 'upload', fileName),
      );
    }
    return zipFile.toBuffer();
  }

  @Delete(':id')
  async deleteTicket(@Param('id', ParseIntPipe) id: number) {
    const ticket = await Tickets.findOne({
      where: { id },
      relations: { childrens: true },
    });
    if (!ticket) {
      throw new NotFoundException('tickets is not defined');
    }
    await Tickets.remove(ticket.childrens);
    return ticket.remove();
  }

  @Patch(':id')
  async updateTicket(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const ticket = await Tickets.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('ticket is not found');
    }
    Object.keys(body).map((b) => (ticket[b] = body[b]));
    return ticket.save();
  }
}
