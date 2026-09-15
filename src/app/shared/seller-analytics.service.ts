import { Injectable, computed, signal } from '@angular/core';

export type SellerRange = 'today' | 'yesterday' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-year' | 'custom';

export interface SellerSaleRecord {
  date: string;
  orders: number;
  units: number;
  sales: number;
  cost: number;
  shipping: number;
  marketplaceFee: number;
  returns: number;
  rto: number;
}

export interface SellerAnalyticsSummary {
  orders: number;
  units: number;
  sales: number;
  profit: number;
  loss: number;
  returns: number;
  rto: number;
  shipping: number;
  marketplaceFee: number;
  profitMargin: number;
}

@Injectable({ providedIn: 'root' })
export class SellerAnalyticsService {
  private readonly _records = signal<SellerSaleRecord[]>(this.seedRecords());
  readonly records = this._records.asReadonly();

  summary(records: SellerSaleRecord[]): SellerAnalyticsSummary {
    const totals = records.reduce((sum, record) => ({
      orders: sum.orders + record.orders,
      units: sum.units + record.units,
      sales: sum.sales + record.sales,
      cost: sum.cost + record.cost,
      shipping: sum.shipping + record.shipping,
      marketplaceFee: sum.marketplaceFee + record.marketplaceFee,
      returns: sum.returns + record.returns,
      rto: sum.rto + record.rto,
    }), { orders: 0, units: 0, sales: 0, cost: 0, shipping: 0, marketplaceFee: 0, returns: 0, rto: 0 });
    const profit = Math.max(0, totals.sales - totals.cost - totals.shipping - totals.marketplaceFee);
    const loss = Math.max(0, totals.cost + totals.shipping + totals.marketplaceFee - totals.sales);
    return { ...totals, profit, loss, profitMargin: totals.sales ? (profit / totals.sales) * 100 : 0 };
  }

  filter(range: SellerRange, customFrom?: string, customTo?: string): SellerSaleRecord[] {
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    let start = new Date(end);
    if (range === 'today') start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    if (range === 'yesterday') { start.setDate(start.getDate() - 1); end.setDate(end.getDate() - 1); }
    if (range === 'last-month') { start = new Date(end.getFullYear(), end.getMonth() - 1, 1); end.setDate(0); }
    if (range === 'last-3-months') start = new Date(end.getFullYear(), end.getMonth() - 2, 1);
    if (range === 'last-6-months') start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
    if (range === 'last-year') start = new Date(end.getFullYear() - 1, end.getMonth(), end.getDate());
    if (range === 'custom' && customFrom && customTo) { start = new Date(`${customFrom}T00:00:00`); return this.records().filter((record) => record.date >= customFrom && record.date <= customTo); }
    const from = start.toISOString().slice(0, 10);
    const to = end.toISOString().slice(0, 10);
    return this.records().filter((record) => record.date >= from && record.date <= to);
  }

  private seedRecords(): SellerSaleRecord[] {
    const records: SellerSaleRecord[] = [];
    const today = new Date();
    for (let offset = 0; offset < 370; offset++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      const day = date.getDate();
      const month = date.getMonth();
      const orders = 6 + ((day * 3 + month * 5) % 17);
      const units = orders + ((day + month) % 12);
      const sales = orders * (520 + ((day * 41 + month * 23) % 480));
      const cost = Math.round(sales * (0.48 + ((day % 5) * 0.018)));
      const shipping = orders * (24 + (day % 4) * 5);
      const marketplaceFee = Math.round(sales * 0.12);
      records.push({ date: date.toISOString().slice(0, 10), orders, units, sales, cost, shipping, marketplaceFee, returns: (day + month) % 3, rto: (day + month * 2) % 2 });
    }
    return records.reverse();
  }
}
