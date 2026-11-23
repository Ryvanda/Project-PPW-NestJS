import { Module } from '@nestjs/common';
import { SamplesService } from './samples.service.js';
import { SamplesController } from './samples.controller.js';

@Module({
  controllers: [SamplesController],
  providers: [SamplesService],
})
export class SamplesModule {}
