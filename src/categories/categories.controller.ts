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
import { CreateCategoryDTO } from './dtos/create-category.dto';
import { Categories } from './categories.entity';
import { TokenGuard } from 'src/auth/token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDTO } from 'src/core/dtos/FileDTO';
import { writeFileSync } from 'fs';
import * as path from 'path';

@Controller('categories')
export class CategoriesController {
  @Post('upload-icon')
  @UseInterceptors(FileInterceptor('icon'))
  uploadIcon(@UploadedFile() file: FileDTO) {
    const fileName = `${new Date().getTime()}-${
      Math.floor(Math.random() * 100000) + 2000000
    }${path.extname(file.originalname)}`;

    writeFileSync(
      path.join(__dirname, '..', '..', 'upload', fileName),
      file.buffer,
    );

    return { fileName };
  }

  @Post()
  async createCategory(@Body() dto: CreateCategoryDTO) {
    if (
      await Categories.findOne({
        where: [{ faName: dto.faName }, { enName: dto.enName }],
      })
    ) {
      throw new ConflictException('Duplicate Category');
    }

    return Categories.save(
      Categories.create({
        faName: dto.faName,
        enName: dto.enName,
        icon: dto.icon,
      }),
    );
  }

  @Get('/therapists')
  getCategoriesTherapist(@Query() query: any) {
    let where = {};
    let therapistWhere = {};
    if (query.firstName) {
      therapistWhere = { ...therapistWhere, firstName: query.firstName };
    }
    if (query.lastName) {
      therapistWhere = { ...therapistWhere, lastName: query.lastName };
    }
    if (query.degreeOfEducation) {
      therapistWhere = {
        ...therapistWhere,
        degreeOfEducation: query.degreeOfEducation,
      };
    }
    if (query.gender) {
      therapistWhere = { ...therapistWhere, gender: query.gender };
    }

    if (Object.keys(therapistWhere).length > 0) {
      where = { ...where, therapists: therapistWhere };
    }
    return Categories.find({
      order: { id: -1 },
      relations: { therapists: { patientsOrders: true, workingFields: true } },
      where,
    }).then((res) => res.filter((e) => e.therapists.length > 0));
  }

  @Get()
  async getPatients(@Query() query = {}) {
    let where: Record<any, any> = {};
    if (query['firstName.eq']) {
      where = { ...where, firstName: query['firstName.eq'] };
    }
    if (query['enName.eq']) {
      where = {
        ...where,
        enName: query['enName.eq'],
      };
    }

    if (query['faName.eq']) {
      where = {
        ...where,
        faName: query['faName.eq'],
      };
    }

    const limit = +(query['limit'] || 10);
    const page = +(query['page'] || 0) * limit;
    const content = await Categories.find({
      order: { id: -1 },
      skip: page,
      take: limit,
      where,
      relations: { therapists: { workingFields: true } },
    });
    const count = await Categories.count({
      where,
    });

    return { content, count };
  }

  @Patch(':id')
  async editCategory(
    @Body() dto: CreateCategoryDTO,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const category = await Categories.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('category is not defined');
    }
    Object.keys(dto).map((b) => (category[b] = dto[b]));
    return category.save();
  }

  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    const category = await Categories.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('category is not defined');
    }
    await category.remove();
    return category;
  }
}
