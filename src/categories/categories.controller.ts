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
import { CreateCategoryDTO } from './dtos/create-category.dto';
import { Categories } from './categories.entity';

@Controller('categories')
export class CategoriesController {
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
      }),
    );
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
