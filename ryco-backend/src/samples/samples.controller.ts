import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSampleDto } from './dto/create-sample.dto.js';
import { UpdateSampleDto } from './dto/update-sample.dto.js';
import { SamplesService } from './samples.service.js';

@Controller('samples')
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSampleDto: CreateSampleDto) {
    return this.samplesService.create(createSampleDto);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  reset() {
    return this.samplesService.reset();
  }

  @Get()
  findAll(
    @Query('commodity') commodity?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.samplesService.findAll({ commodity, status, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.samplesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSampleDto: UpdateSampleDto) {
    return this.samplesService.update(id, updateSampleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.samplesService.remove(id);
  }
}
