import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SampleStatus } from './entities/sample.entity.js';
import { SamplesService } from './samples.service.js';

describe('SamplesService', () => {
  let service: SamplesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SamplesService],
    }).compile();

    service = module.get<SamplesService>(SamplesService);
  });

  it('should return 4 seeded B2B sample requests initially', () => {
    const items = service.findAll();
    expect(items).toHaveLength(4);
    expect(items[0].id).toBe('SMPL-101');
  });

  it('should create a new sample request and assign SMPL-105', () => {
    const created = service.create({
      buyerName: 'Elena Rossi',
      companyName: 'Milano Spezie S.r.l.',
      email: 'e.rossi@milanospezie.it',
      country: 'Italy',
      shippingAddress: 'Via Torino 88, Suite 4B, 20123 Milano, Italy',
      commodity: 'Indonesian Nutmeg (Biji Pala)',
      grade: 'Grade A (Premium)',
      weightGrams: 500,
      requiresCoa: true,
    });

    expect(created.id).toBe('SMPL-105');
    expect(created.status).toBe(SampleStatus.PENDING);
    expect(created.sampleWeight).toBe('500 gram (Standard Evaluation Kit)');
    expect(service.findAll()).toHaveLength(5);
  });

  it('should throw NotFoundException when finding a non-existent sample id', () => {
    expect(() => service.findOne('SMPL-999')).toThrow(NotFoundException);
  });

  it('should throw ConflictException on duplicate trackingAwb', () => {
    expect(() =>
      service.create({
        buyerName: 'Lukas Meyer',
        companyName: 'Frankfurt Spice AG',
        country: 'Germany',
        shippingAddress: 'Mainzer Landstrasse 50, 60325 Frankfurt, Germany',
        commodity: 'Mace (Fuli / Bunga Pala)',
        grade: 'Grade A (Premium)',
        weightGrams: 250,
        trackingAwb: 'DHL-9482-1049-DE',
      }),
    ).toThrow(ConflictException);
  });

  it('should throw ConflictException on duplicate pending request for same company, commodity, and grade', () => {
    expect(() =>
      service.create({
        buyerName: 'Hans Schneider',
        companyName: 'Bavaria Spices GmbH',
        country: 'Germany',
        shippingAddress:
          'Industriestrasse 42, Speicherstadt Warehouse #4, 20457 Hamburg, Germany',
        commodity: 'Indonesian Nutmeg (Biji Pala)',
        grade: 'Grade A (Premium)',
        weightGrams: 500,
      }),
    ).toThrow(ConflictException);
  });

  it('should update status and dispatchNotes for an existing sample', () => {
    const updated = service.update('SMPL-101', {
      status: SampleStatus.SHIPPED,
      dispatchNotes: 'Dispatched via DHL Air Priority with COA attached.',
    });

    expect(updated.status).toBe(SampleStatus.SHIPPED);
    expect(updated.dispatchNotes).toContain('DHL Air Priority');
  });

  it('should throw BadRequestException when update payload is empty', () => {
    expect(() => service.update('SMPL-101', {})).toThrow(BadRequestException);
  });

  it('should delete an existing sample and throw NotFoundException on second delete', () => {
    const result = service.remove('SMPL-101');
    expect(result.deleted.id).toBe('SMPL-101');
    expect(service.findAll()).toHaveLength(3);
    expect(() => service.remove('SMPL-101')).toThrow(NotFoundException);
  });
});
