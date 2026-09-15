import { Injectable, computed, signal } from '@angular/core';

export type TaxRuleStatus = 'Active' | 'Inactive';
export type TaxPriceMode = 'Inclusive' | 'Exclusive';

export interface TaxRule {
  id: string;
  hsnCode: string;
  description: string;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  priceMode: TaxPriceMode;
  effectiveFrom: string;
  status: TaxRuleStatus;
}

let taxRuleSequence = 9;

@Injectable({ providedIn: 'root' })
export class TaxService {
  private readonly _rules = signal<TaxRule[]>([
    { id: 'TAX001', hsnCode: '3401', description: 'Soap, organic face wash and cleansing preparations', gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, priceMode: 'Inclusive', effectiveFrom: '2026-01-01', status: 'Active' },
    { id: 'TAX002', hsnCode: '8517', description: 'Mobile phones and communication devices', gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, priceMode: 'Inclusive', effectiveFrom: '2026-01-01', status: 'Active' },
    { id: 'TAX003', hsnCode: '6109', description: 'T-shirts, vests and knitted apparel', gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 5, priceMode: 'Inclusive', effectiveFrom: '2026-01-01', status: 'Active' },
    { id: 'TAX004', hsnCode: '7323', description: 'Iron and steel household and kitchen articles', gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, priceMode: 'Exclusive', effectiveFrom: '2026-01-01', status: 'Active' },
    { id: 'TAX005', hsnCode: '3304', description: 'Beauty, skincare and cosmetic preparations', gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, priceMode: 'Inclusive', effectiveFrom: '2026-01-01', status: 'Active' },
    { id: 'TAX006', hsnCode: '4901', description: 'Printed books and educational publications', gstRate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0, priceMode: 'Inclusive', effectiveFrom: '2026-01-01', status: 'Active' },
    { id: 'TAX007', hsnCode: '9403', description: 'Furniture and furnishing articles', gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, priceMode: 'Exclusive', effectiveFrom: '2025-04-01', status: 'Inactive' },
    { id: 'TAX008', hsnCode: '0902', description: 'Tea, whether or not flavoured', gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 5, priceMode: 'Inclusive', effectiveFrom: '2026-01-01', status: 'Active' },
  ]);

  readonly rules = this._rules.asReadonly();
  readonly activeRules = computed(() => this._rules().filter((rule) => rule.status === 'Active'));
  readonly totalGstRates = computed(() => new Set(this._rules().map((rule) => rule.gstRate)).size);

  addRule(data: Omit<TaxRule, 'id'>): void {
    this._rules.update((rules) => [{ ...data, id: `TAX${String(taxRuleSequence++).padStart(3, '0')}` }, ...rules]);
  }

  updateRule(id: string, data: Omit<TaxRule, 'id'>): void {
    this._rules.update((rules) => rules.map((rule) => rule.id === id ? { ...data, id } : rule));
  }

  deleteRule(id: string): void {
    this._rules.update((rules) => rules.filter((rule) => rule.id !== id));
  }

  findByHsn(hsnCode: string): TaxRule | undefined {
    return this.activeRules().find((rule) => hsnCode.startsWith(rule.hsnCode));
  }

  calculateTax(amount: number, gstRate: number, priceMode: TaxPriceMode): { taxableAmount: number; gstAmount: number } {
    const taxableAmount = priceMode === 'Inclusive' ? amount / (1 + gstRate / 100) : amount;
    return { taxableAmount, gstAmount: taxableAmount * gstRate / 100 };
  }
}
