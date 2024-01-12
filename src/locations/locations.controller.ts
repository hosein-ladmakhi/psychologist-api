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
} from '@nestjs/common';
import { CreateLocationDTO } from './dtos/create-location.dto';
import { Locations } from './locations.entity';
import { EditLocationDTO } from './dtos/edit-location.dto';

@Controller('locations')
export class LocationsController {
  @Post()
  async createLocation(@Body() body: CreateLocationDTO) {
    return Locations.save(
      Locations.create({
        address: body.address,
        city: body.city,
      }),
    );
  }

  @Patch(':id')
  async updateLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: EditLocationDTO,
  ) {
    const location = await Locations.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException('location is not defined');
    }
    Object.keys(body).map((b) => (location[b] = body[b]));
    return location.save();
  }

  @Get()
  async getLocations(@Query() query = {}) {
    let where: Record<any, any> = {};
    const limit = +(query['limit'] || 10);
    const page = +(query['page'] || 0) * limit;
    const content = await Locations.find({
      order: { id: -1 },
      skip: page,
      take: limit,
      where,
    });
    const count = await Locations.count({
      where,
    });

    return { content, count };
  }

  @Delete(':id')
  async deleteLocation(@Param('id', ParseIntPipe) id: number) {
    const location = await Locations.findOne({
      where: { id },
    });
    if (!location) {
      throw new NotFoundException('location is not defined');
    }
    await location.remove();
    return location;
  }
}
