import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSampleDto } from './dto/create-sample.dto.js';
import { UpdateSampleDto } from './dto/update-sample.dto.js';
import { Sample, SampleStatus } from './entities/sample.entity.js';

export interface SampleFilters {
  commodity?: string;
  status?: string;
  search?: string;
}

@Injectable()
export class SamplesService {
  private samples: Sample[] = this.createInitialSamples();
  private nextIdNumber = 105;

  private createInitialSamples(): Sample[] {
    return [
      {
        id: 'SMPL-101',
        buyerName: 'Hans Schneider',
        companyName: 'Bavaria Spices GmbH',
        email: 'h.schneider@bavariaspices.de',
        phone: '+49 170 882910',
        country: 'Germany',
        city: 'Hamburg',
        postalCode: '20457',
        shippingAddress:
          'Industriestrasse 42, Speicherstadt Warehouse #4, 20457 Hamburg, Germany',
        courierService: 'DHL Express International',
        trackingAwb: 'DHL-9482-1049-DE',
        commodity: 'Indonesian Nutmeg (Biji Pala)',
        grade: 'Grade A (Premium)',
        weightGrams: 500,
        sampleWeight: '500 gram (Standard Evaluation Kit)',
        packagingType: 'Vacuum-Sealed Foil Bag + Outer Rigid Export Box',
        requiresCoa: true,
        dispatchNotes:
          'Buyer requires low aflatoxin COA and volatile oil > 6.5%. Sample approved for air courier dispatch.',
        requestDate: '2026-10-22',
        status: SampleStatus.PENDING,
        createdAt: '2026-10-22T08:30:00.000Z',
      },
      {
        id: 'SMPL-102',
        buyerName: 'Kenji Tanaka',
        companyName: 'Nippon Food Trading Corp',
        email: 'k.tanaka@nipponfood.co.jp',
        phone: '+81 3 5555 0142',
        country: 'Japan',
        city: 'Tokyo',
        postalCode: '104-0045',
        shippingAddress:
          'Chuo-ku Tsukiji 4-14-1, Wholesale Center Bld 3F, Tokyo 104-0045, Japan',
        courierService: 'FedEx International Priority',
        trackingAwb: 'FDX-8831-5520-JP',
        commodity: 'Mace (Fuli / Bunga Pala)',
        grade: 'Grade A (Premium)',
        weightGrams: 250,
        sampleWeight: '250 gram (Micro-Sample Kit)',
        packagingType:
          'Nitrogen-Flushed Aluminum Pouch + Protective Outer Carton',
        requiresCoa: true,
        dispatchNotes:
          'Sent via priority air courier for sensory and color pigment analysis.',
        requestDate: '2026-10-23',
        status: SampleStatus.SHIPPED,
        createdAt: '2026-10-23T09:15:00.000Z',
      },
      {
        id: 'SMPL-103',
        buyerName: 'Pieter van Dijk',
        companyName: 'Rotterdam Commodity House B.V.',
        email: 'pvandijk@rotterdamspice.nl',
        phone: '+31 10 442 8890',
        country: 'Netherlands',
        city: 'Rotterdam',
        postalCode: '3089 JH',
        shippingAddress:
          'Waalhaven Zuidzijde 21, Haven 2210, 3089 JH Rotterdam, Netherlands',
        courierService: 'DHL Express International',
        trackingAwb: 'DHL-4412-9011-NL',
        commodity: 'Zanzibar Cloves (Cengkeh)',
        grade: 'Grade A (Premium)',
        weightGrams: 1000,
        sampleWeight: '1000 gram (1 kg Comparative Box)',
        packagingType: 'Double Poly-Lined Vacuum Kraft Box',
        requiresCoa: true,
        dispatchNotes:
          'Delivered and verified by buyer QA laboratory. Eugenol level verified at 82.4%.',
        requestDate: '2026-10-24',
        status: SampleStatus.DELIVERED,
        createdAt: '2026-10-24T10:00:00.000Z',
      },
      {
        id: 'SMPL-104',
        buyerName: 'Sarah Jenkins',
        companyName: 'Hudson Botanical Imports LLC',
        email: 's.jenkins@hudsonbotanicals.com',
        phone: '+1 212 555 0199',
        country: 'United States',
        city: 'New York',
        postalCode: '10001',
        shippingAddress:
          '450 West 33rd Street, Suite 900, New York, NY 10001, United States',
        courierService: 'DHL Express International',
        trackingAwb: 'DHL-6219-4822-US',
        commodity: 'Cassia Vera Cinnamon (Kayu Manis)',
        grade: 'Grade B (Standard)',
        weightGrams: 500,
        sampleWeight: '500 gram (Standard Evaluation Kit)',
        packagingType: 'Moisture-Proof Sealed Kraft Cylinder',
        requiresCoa: true,
        dispatchNotes:
          'Awaiting US FDA Prior Notice approval before parcel dispatch.',
        requestDate: '2026-10-24',
        status: SampleStatus.PENDING,
        createdAt: '2026-10-24T14:20:00.000Z',
      },
    ];
  }

  private formatSampleWeight(weightGrams: number): string {
    const labelMap: Record<number, string> = {
      250: '250 gram (Micro-Sample Kit)',
      500: '500 gram (Standard Evaluation Kit)',
      1000: '1000 gram (1 kg Comparative Box)',
      2000: '2000 gram (2 kg Pilot Lot)',
    };
    return labelMap[weightGrams] ?? `${weightGrams} gram`;
  }

  private buildDefaultEmail(buyerName: string, companyName: string): string {
    const localPart = buyerName.trim().toLowerCase().replace(/\s+/g, '.');
    const domainPart = companyName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    return `${localPart}@${domainPart || 'importer'}.com`;
  }

  create(createSampleDto: CreateSampleDto): Sample {
    const normalizedAwb = createSampleDto.trackingAwb?.trim().toLowerCase();
    if (normalizedAwb) {
      const duplicateAwb = this.samples.find(
        (item) => item.trackingAwb.toLowerCase() === normalizedAwb,
      );
      if (duplicateAwb) {
        throw new ConflictException(
          `Nomor resi AWB "${createSampleDto.trackingAwb}" sudah terdaftar pada sampel ${duplicateAwb.id}.`,
        );
      }
    }

    const normalizedCompany = createSampleDto.companyName.trim().toLowerCase();
    const normalizedCommodity = createSampleDto.commodity.trim().toLowerCase();
    const normalizedGrade = createSampleDto.grade.trim().toLowerCase();

    const duplicatePendingRequest = this.samples.find(
      (item) =>
        item.status === SampleStatus.PENDING &&
        item.companyName.toLowerCase() === normalizedCompany &&
        item.commodity.toLowerCase() === normalizedCommodity &&
        item.grade.toLowerCase() === normalizedGrade,
    );

    if (duplicatePendingRequest) {
      throw new ConflictException(
        `Permintaan sampel aktif untuk ${createSampleDto.companyName} (${createSampleDto.commodity} - ${createSampleDto.grade}) sudah ada dengan ID ${duplicatePendingRequest.id}.`,
      );
    }

    const idNumber = this.nextIdNumber++;
    const newId = `SMPL-${idNumber}`;
    const generatedAwb = `DHL-${idNumber}90-ID`;

    const newSample: Sample = {
      id: newId,
      buyerName: createSampleDto.buyerName.trim(),
      companyName: createSampleDto.companyName.trim(),
      email:
        createSampleDto.email?.trim() ||
        this.buildDefaultEmail(
          createSampleDto.buyerName,
          createSampleDto.companyName,
        ),
      phone: createSampleDto.phone?.trim() || '+62 812-3456-7890',
      country: createSampleDto.country.trim(),
      city: createSampleDto.city?.trim() || 'Destination Port Hub',
      postalCode: createSampleDto.postalCode?.trim() || '10001',
      shippingAddress: createSampleDto.shippingAddress.trim(),
      courierService:
        createSampleDto.courierService?.trim() || 'DHL Express International',
      trackingAwb: createSampleDto.trackingAwb?.trim() || generatedAwb,
      commodity: createSampleDto.commodity,
      grade: createSampleDto.grade,
      weightGrams: createSampleDto.weightGrams,
      sampleWeight:
        createSampleDto.sampleWeight?.trim() ||
        this.formatSampleWeight(createSampleDto.weightGrams),
      packagingType:
        createSampleDto.packagingType?.trim() ||
        'Vacuum-Sealed Foil Bag + Outer Rigid Export Box',
      requiresCoa: createSampleDto.requiresCoa ?? true,
      dispatchNotes:
        createSampleDto.dispatchNotes?.trim() ||
        'Permintaan sampel baru dicatat melalui backend NestJS. Menunggu verifikasi tim logistik dan penerbitan COA.',
      requestDate:
        createSampleDto.requestDate || new Date().toISOString().split('T')[0],
      status: createSampleDto.status ?? SampleStatus.PENDING,
      createdAt: new Date().toISOString(),
    };

    this.samples.unshift(newSample);
    return newSample;
  }

  findAll(filters: SampleFilters = {}): Sample[] {
    const { commodity, status, search } = filters;

    return this.samples.filter((sample) => {
      const matchesCommodity =
        !commodity ||
        commodity.toUpperCase() === 'ALL' ||
        sample.commodity.toLowerCase().includes(commodity.toLowerCase());

      const matchesStatus =
        !status ||
        status.toUpperCase() === 'ALL' ||
        sample.status.toLowerCase().includes(status.toLowerCase());

      const q = search?.trim().toLowerCase();
      const matchesSearch =
        !q ||
        sample.id.toLowerCase().includes(q) ||
        sample.buyerName.toLowerCase().includes(q) ||
        sample.companyName.toLowerCase().includes(q) ||
        sample.country.toLowerCase().includes(q) ||
        sample.shippingAddress.toLowerCase().includes(q);

      return matchesCommodity && matchesStatus && matchesSearch;
    });
  }

  findOne(id: string): Sample {
    const target = this.samples.find(
      (item) => item.id.toLowerCase() === id.trim().toLowerCase(),
    );
    if (!target) {
      throw new NotFoundException(
        `Permintaan sampel dengan ID "${id}" tidak ditemukan.`,
      );
    }
    return target;
  }

  update(id: string, updateSampleDto: UpdateSampleDto): Sample {
    const existing = this.findOne(id);

    const definedEntries = Object.entries(updateSampleDto).filter(
      ([, value]) => value !== undefined,
    );

    if (definedEntries.length === 0) {
      throw new BadRequestException(
        'Minimal satu field harus disertakan untuk memperbarui data sampel.',
      );
    }

    if (updateSampleDto.trackingAwb) {
      const normalizedAwb = updateSampleDto.trackingAwb.trim().toLowerCase();
      const conflictSample = this.samples.find(
        (item) =>
          item.id !== existing.id &&
          item.trackingAwb.toLowerCase() === normalizedAwb,
      );
      if (conflictSample) {
        throw new ConflictException(
          `Nomor resi AWB "${updateSampleDto.trackingAwb}" sudah digunakan oleh permintaan sampel ${conflictSample.id}.`,
        );
      }
    }

    const patch = Object.fromEntries(definedEntries) as Partial<Sample>;

    const nextWeightGrams =
      updateSampleDto.weightGrams !== undefined
        ? updateSampleDto.weightGrams
        : existing.weightGrams;

    const nextSampleWeight =
      updateSampleDto.sampleWeight !== undefined
        ? updateSampleDto.sampleWeight
        : updateSampleDto.weightGrams !== undefined
          ? this.formatSampleWeight(updateSampleDto.weightGrams)
          : existing.sampleWeight;

    const updatedSample = Object.assign(new Sample(), existing, patch, {
      weightGrams: nextWeightGrams,
      sampleWeight: nextSampleWeight,
    });

    const index = this.samples.findIndex((item) => item.id === existing.id);
    this.samples[index] = updatedSample;

    return updatedSample;
  }

  remove(id: string): { message: string; deleted: Sample } {
    const index = this.samples.findIndex(
      (item) => item.id.toLowerCase() === id.trim().toLowerCase(),
    );
    if (index === -1) {
      throw new NotFoundException(
        `Permintaan sampel dengan ID "${id}" tidak ditemukan.`,
      );
    }

    const [deleted] = this.samples.splice(index, 1);
    return {
      message: `Permintaan sampel ${deleted.id} berhasil dihapus.`,
      deleted,
    };
  }

  reset(): Sample[] {
    this.samples = this.createInitialSamples();
    this.nextIdNumber = 105;
    return this.samples;
  }
}
