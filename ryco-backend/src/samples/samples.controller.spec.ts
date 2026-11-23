import { Test, TestingModule } from '@nestjs/testing';
import { SampleStatus } from './entities/sample.entity.js';
import { SamplesController } from './samples.controller.js';
import { SamplesService } from './samples.service.js';

describe('SamplesController', () => {
  let controller: SamplesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SamplesController],
      providers: [SamplesService],
    }).compile();

    controller = module.get<SamplesController>(SamplesController);
  });

  it('should be defined and return initial samples via injected service', () => {
    expect(controller).toBeDefined();
    expect(controller.findAll()).toHaveLength(4);
  });

  it('should support full CRUD flow through controller endpoints', () => {
    const created = controller.create({
      buyerName: 'Claire Dubois',
      companyName: 'Lyon Epices SAS',
      country: 'France',
      shippingAddress: '18 Rue de la Republique, 69002 Lyon, France',
      commodity: 'Zanzibar Cloves (Cengkeh)',
      grade: 'Grade A (Premium)',
      weightGrams: 500,
    });

    expect(created.id).toBe('SMPL-105');
    expect(controller.findOne('SMPL-105').companyName).toBe('Lyon Epices SAS');

    const updated = controller.update('SMPL-105', {
      status: SampleStatus.DELIVERED,
    });
    expect(updated.status).toBe(SampleStatus.DELIVERED);

    const removed = controller.remove('SMPL-105');
    expect(removed.deleted.id).toBe('SMPL-105');
  });
});
