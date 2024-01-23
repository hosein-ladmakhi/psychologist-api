import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { writeFileSync, writeSync } from 'fs';
import { FileDTO } from 'src/core/dtos/FileDTO';
import { Orders } from 'src/orders/orders.entity';
import * as path from 'path';
import { UserDocumentation } from './user-documentation.entity';

@Controller('user-documentation')
export class UserDocumentationController {
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async uploadDocumentation(
    @UploadedFiles() file: FileDTO[],
    @Body() body: { order: number },
  ) {
    const order = await Orders.findOne({ where: { id: body.order } });
    if (!order) {
      throw new NotFoundException('order is not defined');
    }
    for (let i = 0; i < file.length; i++) {
      const fileName = `${new Date().getTime()}-${
        Math.floor(Math.random() * 100000) + 2000000
      }${path.extname(file[i].originalname)}`;
      writeFileSync(
        path.join(__dirname, '..', '..', 'upload', fileName),
        file[i].buffer,
      );
      await UserDocumentation.save(
        UserDocumentation.create({
          file: fileName,
          order,
        }),
      );
    }
return {}
 }
}
