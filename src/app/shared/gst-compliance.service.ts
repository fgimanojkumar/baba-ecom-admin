import { Injectable, computed, signal } from '@angular/core';
import { MOCK_ORDERS } from '../pages/orders/orders.data';
import { Order } from '../pages/orders/order.model';

export interface GstPeriodSummary {
  period: string;
  invoiceCount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grossValue: number;
}

export interface GstDownloadRecord {
  id: string;
  period: string;
  returnType: 'GSTR-1' | 'GSTR-3B' | 'Sales Register';
  generatedAt: string;
  status: 'Ready' | 'Filed' | 'Draft';
}

@Injectable({ providedIn: 'root' })
export class GstComplianceService {
  private readonly _downloads = signal<GstDownloadRecord[]>([
    { id: 'GST-001', period: '07/2026', returnType: 'Sales Register', generatedAt: '2026-08-02 10:30', status: 'Ready' },
  ]);

  readonly downloads = this._downloads.asReadonly();
  readonly orders = signal<Order[]>(MOCK_ORDERS);

  summary(period: string): GstPeriodSummary {
    const orders = this.ordersForPeriod(period);
    let taxableValue = 0;
    let totalTax = 0;
    for (const order of orders) {
      const subtotal = this.subtotal(order);
      const tax = Math.round(subtotal * order.taxRate * 100) / 100;
      taxableValue += subtotal;
      totalTax += tax;
    }
    const igst = Math.round(totalTax * 0.4 * 100) / 100;
    const intraStateTax = Math.round((totalTax - igst) * 100) / 100;
    return {
      period,
      invoiceCount: orders.length,
      taxableValue,
      cgst: Math.round(intraStateTax / 2 * 100) / 100,
      sgst: Math.round(intraStateTax / 2 * 100) / 100,
      igst,
      totalTax,
      grossValue: taxableValue + totalTax + orders.reduce((sum, order) => sum + order.shipping, 0),
    };
  }

  ordersForPeriod(period: string): Order[] {
    const [month, year] = period.split('/').map(Number);
    return this.orders().filter((order) => {
      const date = new Date(order.date);
      return date.getMonth() + 1 === month && date.getFullYear() === year && order.status !== 'cancelled';
    });
  }

  generate(returnType: GstDownloadRecord['returnType'], period: string): GstDownloadRecord {
    const record: GstDownloadRecord = {
      id: `GST-${Date.now()}`,
      period,
      returnType,
      generatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Draft',
    };
    this._downloads.update((downloads) => [record, ...downloads]);
    return record;
  }

  exportGstr1(period: string, sellerGstin: string): void {
    const rows = this.ordersForPeriod(period).map((order) => {
      const taxableValue = this.subtotal(order);
      const tax = Math.round(taxableValue * order.taxRate * 100) / 100;
      return [sellerGstin, order.id, order.date, order.customerName, order.customerEmail, taxableValue, `${order.taxRate * 100}%`, tax, taxableValue + tax + order.shipping];
    });
    this.downloadCsv('gstr-1', ['Seller GSTIN', 'Invoice Number', 'Invoice Date', 'Customer', 'Customer Email', 'Taxable Value', 'GST Rate', 'Tax Amount', 'Invoice Value'], rows, period);
  }

  exportGstr3b(period: string, sellerGstin: string): void {
    const summary = this.summary(period);
    const rows = [
      ['GSTIN', sellerGstin], ['Return Period', period], ['Outward taxable supplies', summary.taxableValue],
      ['CGST', summary.cgst], ['SGST/UTGST', summary.sgst], ['IGST', summary.igst], ['Total tax liability', summary.totalTax], ['Invoice count', summary.invoiceCount],
    ];
    this.downloadCsv('gstr-3b-summary', ['Particular', 'Value'], rows, period);
  }

  exportSalesRegister(period: string, sellerGstin: string): void {
    const rows = this.ordersForPeriod(period).flatMap((order) => order.items.map((item) => [sellerGstin, order.id, order.date, item.name, item.sku, item.quantity, item.price, item.price * item.quantity, order.taxRate * 100]));
    this.downloadCsv('sales-register', ['Seller GSTIN', 'Order ID', 'Date', 'Product', 'SKU', 'Quantity', 'Unit Price', 'Taxable Value', 'GST Rate'], rows, period);
  }

  private subtotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private downloadCsv(name: string, header: string[], rows: unknown[][], period: string): void {
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell ?? ''}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}-${period.replace('/', '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
