import { Injectable, computed, signal } from '@angular/core';

export type PaymentType = 'Sale' | 'Payout' | 'Refund';
export type PaymentStatus =
  | 'Pending'
  | 'Authorized'
  | 'Captured'
  | 'Settled'
  | 'Completed'
  | 'Failed'
  | 'Refund Pending'
  | 'Refund Processing'
  | 'Refunded';

export interface PaymentRecord {
  id: string;
  orderId: string;
  returnId?: string;
  sellerName: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  date: string;
  statusHistory?: PaymentStatusEvent[];
}

export interface PaymentStatusEvent {
  status: PaymentStatus;
  occurredAt: string;
}

let paymentSeq = 100;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly _payments = signal<PaymentRecord[]>([
    { id: 'PAY001', orderId: 'ORD1001', sellerName: 'Rahul Traders', amount: 2499, type: 'Sale', status: 'Settled', date: '2026-09-01' },
    { id: 'PAY002', orderId: 'ORD1001', sellerName: 'Rahul Traders', amount: 2249, type: 'Payout', status: 'Settled', date: '2026-09-03' },
    { id: 'PAY003', orderId: 'ORD1005', sellerName: 'Priya Fashion Hub', amount: 899, type: 'Sale', status: 'Captured', date: '2026-09-04' },
    { id: 'PAY004', orderId: 'ORD1006', sellerName: 'Modern Electronics', amount: 15999, type: 'Sale', status: 'Pending', date: '2026-09-06' },
    { id: 'PAY005', orderId: 'ORD-001247', returnId: 'RTN-002', sellerName: 'Herbal Roots', amount: 1999, type: 'Refund', status: 'Refunded', date: '2026-09-07' },
    { id: 'PAY006', orderId: 'ORD1007', sellerName: 'Kitchen Craft Co.', amount: 3200, type: 'Payout', status: 'Failed', date: '2026-09-08' },
    { id: 'PAY007', orderId: 'ORD1012', sellerName: 'Urban Living', amount: 4800, type: 'Sale', status: 'Authorized', date: '2026-09-10' },
  ]);

  readonly payments = this._payments.asReadonly();

  readonly totalRevenue = computed(() =>
    this._payments()
      .filter((p) => p.type === 'Sale' && ['Captured', 'Settled', 'Completed'].includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0)
  );

  readonly totalPayouts = computed(() =>
    this._payments()
      .filter((p) => p.type === 'Payout' && ['Settled', 'Completed'].includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0)
  );

  readonly pendingAmount = computed(() =>
    this._payments()
      .filter((p) => ['Pending', 'Authorized', 'Refund Pending', 'Refund Processing'].includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0)
  );

  readonly totalRefunds = computed(() =>
    this._payments()
      .filter((p) => p.type === 'Refund' && ['Refunded', 'Completed'].includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0)
  );

  updateStatus(id: string, status: PaymentStatus): void {
    const occurredAt = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    this._payments.update((list) => list.map((p) =>
      p.id === id ? { ...p, status, statusHistory: [...(p.statusHistory ?? []), { status, occurredAt }] } : p
    ));
  }

  refundStatus(returnId: string): PaymentStatus | null {
    return this._payments().find((payment) => payment.returnId === returnId)?.status ?? null;
  }

  addPayment(data: Omit<PaymentRecord, 'id'>): PaymentRecord {
    const record: PaymentRecord = {
      ...data,
      id: `PAY${paymentSeq++}`,
      statusHistory: [{ status: data.status, occurredAt: data.date }],
    };
    this._payments.update((list) => [record, ...list]);
    return record;
  }
}
