import { Injectable, computed, signal } from '@angular/core';

export type PaymentType = 'Sale' | 'Payout' | 'Refund';
export type PaymentStatus = 'Completed' | 'Pending' | 'Failed';

export interface PaymentRecord {
  id: string;
  orderId: string;
  sellerName: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  date: string;
}

let paymentSeq = 100;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly _payments = signal<PaymentRecord[]>([
    { id: 'PAY001', orderId: 'ORD1001', sellerName: 'Rahul Traders', amount: 2499, type: 'Sale', status: 'Completed', date: '2026-09-01' },
    { id: 'PAY002', orderId: 'ORD1001', sellerName: 'Rahul Traders', amount: 2249, type: 'Payout', status: 'Completed', date: '2026-09-03' },
    { id: 'PAY003', orderId: 'ORD1005', sellerName: 'Priya Fashion Hub', amount: 899, type: 'Sale', status: 'Completed', date: '2026-09-04' },
    { id: 'PAY004', orderId: 'ORD1006', sellerName: 'Modern Electronics', amount: 15999, type: 'Sale', status: 'Pending', date: '2026-09-06' },
    { id: 'PAY005', orderId: 'ORD1003', sellerName: 'Herbal Roots', amount: 599, type: 'Refund', status: 'Completed', date: '2026-09-07' },
    { id: 'PAY006', orderId: 'ORD1007', sellerName: 'Kitchen Craft Co.', amount: 3200, type: 'Payout', status: 'Failed', date: '2026-09-08' },
  ]);

  readonly payments = this._payments.asReadonly();

  readonly totalRevenue = computed(() =>
    this._payments()
      .filter((p) => p.type === 'Sale' && p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0)
  );

  readonly totalPayouts = computed(() =>
    this._payments()
      .filter((p) => p.type === 'Payout' && p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0)
  );

  readonly pendingAmount = computed(() =>
    this._payments()
      .filter((p) => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0)
  );

  readonly totalRefunds = computed(() =>
    this._payments()
      .filter((p) => p.type === 'Refund' && p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0)
  );

  updateStatus(id: string, status: PaymentStatus): void {
    this._payments.update((list) => list.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  addPayment(data: Omit<PaymentRecord, 'id'>): void {
    const record: PaymentRecord = { ...data, id: `PAY${paymentSeq++}` };
    this._payments.update((list) => [record, ...list]);
  }
}
