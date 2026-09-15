import { Injectable, signal } from '@angular/core';

export type OfferDiscountType = 'Percentage' | 'Fixed';
export type OfferStatus = 'Active' | 'Inactive' | 'Expired';

export interface OfferRecord {
  id: string;
  code: string;
  description: string;
  discountType: OfferDiscountType;
  discountValue: number;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  status: OfferStatus;
}

let offerSeq = 100;

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly _offers = signal<OfferRecord[]>([
    { id: 'OFR001', code: 'SUMMER20', description: '20% off on all summer collection', discountType: 'Percentage', discountValue: 20, minOrderValue: 499, usageLimit: 100, usedCount: 50, expiryDate: '2026-07-31', status: 'Active' },
    { id: 'OFR002', code: 'FLAT100', description: 'Flat ₹100 off on orders above ₹999', discountType: 'Fixed', discountValue: 100, minOrderValue: 999, usageLimit: 200, usedCount: 132, expiryDate: '2026-09-30', status: 'Active' },
    { id: 'OFR003', code: 'WELCOME10', description: '10% off for first-time customers', discountType: 'Percentage', discountValue: 10, minOrderValue: 0, usageLimit: 500, usedCount: 500, expiryDate: '2026-06-30', status: 'Expired' },
    { id: 'OFR004', code: 'FEST50', description: 'Flat ₹50 off during festival sale', discountType: 'Fixed', discountValue: 50, minOrderValue: 299, usageLimit: 300, usedCount: 0, expiryDate: '2026-10-15', status: 'Inactive' },
  ]);

  readonly offers = this._offers.asReadonly();

  addOffer(data: Omit<OfferRecord, 'id' | 'usedCount'>): void {
    const record: OfferRecord = { ...data, id: `OFR${offerSeq++}`, usedCount: 0 };
    this._offers.update((list) => [record, ...list]);
  }

  updateOffer(id: string, data: Omit<OfferRecord, 'id' | 'usedCount'>): void {
    this._offers.update((list) => list.map((o) => (o.id === id ? { ...o, ...data } : o)));
  }

  deleteOffer(id: string): void {
    this._offers.update((list) => list.filter((o) => o.id !== id));
  }
}
