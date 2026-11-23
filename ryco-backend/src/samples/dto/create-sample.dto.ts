import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  SampleStatus,
  VALID_COMMODITIES,
  VALID_GRADES,
} from '../entities/sample.entity.js';

/**
 * DTO for creating a new B2B spice export sample request.
 */
export class CreateSampleDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama PIC / Buyer wajib diisi.' })
  @MinLength(3, { message: 'Nama PIC / Buyer minimal 3 karakter.' })
  buyerName: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama perusahaan importir wajib diisi.' })
  @MinLength(3, { message: 'Nama perusahaan importir minimal 3 karakter.' })
  companyName: string;

  @IsOptional()
  @IsEmail({}, { message: 'Format email bisnis tidak valid.' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Nomor telepon minimal 6 karakter.' })
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: 'Negara tujuan ekspor wajib diisi.' })
  @MinLength(2, { message: 'Nama negara tujuan minimal 2 karakter.' })
  country: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsString()
  @IsNotEmpty({ message: 'Alamat pengiriman kurir wajib diisi.' })
  @MinLength(10, {
    message: 'Alamat lengkap pengiriman kurir minimal 10 karakter.',
  })
  shippingAddress: string;

  @IsOptional()
  @IsString()
  courierService?: string;

  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Nomor resi AWB minimal 5 karakter.' })
  trackingAwb?: string;

  @IsString()
  @IsIn(VALID_COMMODITIES, {
    message: `Komoditas harus salah satu dari: ${VALID_COMMODITIES.join(', ')}`,
  })
  commodity: string;

  @IsString()
  @IsIn(VALID_GRADES, {
    message: `Grade kualitas harus salah satu dari: ${VALID_GRADES.join(', ')}`,
  })
  grade: string;

  @Type(() => Number)
  @IsInt({ message: 'Berat sampel (gram) harus berupa bilangan bulat.' })
  @Min(100, { message: 'Berat sampel minimal 100 gram.' })
  @Max(10000, { message: 'Berat sampel maksimal 10000 gram.' })
  weightGrams: number;

  @IsOptional()
  @IsString()
  sampleWeight?: string;

  @IsOptional()
  @IsString()
  packagingType?: string;

  @IsOptional()
  @IsBoolean({ message: 'requiresCoa harus berupa nilai boolean.' })
  requiresCoa?: boolean;

  @IsOptional()
  @IsString()
  dispatchNotes?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'requestDate harus menggunakan format tanggal ISO (YYYY-MM-DD).' },
  )
  requestDate?: string;

  @IsOptional()
  @IsEnum(SampleStatus, {
    message: `Status harus salah satu dari: ${Object.values(SampleStatus).join(', ')}`,
  })
  status?: SampleStatus;
}
