export enum SampleStatus {
  PENDING = 'Pending Review',
  SHIPPED = 'Shipped / Dispatched',
  DELIVERED = 'Delivered',
}

export const VALID_COMMODITIES = [
  'Indonesian Nutmeg (Biji Pala)',
  'Mace (Fuli / Bunga Pala)',
  'Zanzibar Cloves (Cengkeh)',
  'Cassia Vera Cinnamon (Kayu Manis)',
] as const;

export const VALID_GRADES = [
  'Grade A (Premium)',
  'Grade B (Standard)',
  'Grade FAQ (Market Quality)',
] as const;

/**
 * Sample Entity
 * Represents a B2B international spice export sample request managed by the backend.
 */
export class Sample {
  id: string;
  buyerName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  postalCode: string;
  shippingAddress: string;
  courierService: string;
  trackingAwb: string;
  commodity: string;
  grade: string;
  weightGrams: number;
  sampleWeight: string;
  packagingType: string;
  requiresCoa: boolean;
  dispatchNotes: string;
  requestDate: string;
  status: SampleStatus;
  createdAt: string;
}
