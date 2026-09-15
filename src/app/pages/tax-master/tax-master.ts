import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageInfo } from '../../shared/lib/page-info/page-info';
import { TaxPriceMode, TaxRule, TaxRuleStatus, TaxService } from '../../shared/tax.service';

@Component({
  selector: 'app-tax-master',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo],
  templateUrl: './tax-master.html',
  styleUrl: './tax-master.scss',
})
export class TaxMaster {
  private readonly fb = inject(FormBuilder);
  readonly taxService = inject(TaxService);

  readonly rules = this.taxService.rules;
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'All' | TaxRuleStatus>('All');
  readonly activeTab = signal<'rules' | 'settings'>('rules');
  readonly editingId = signal<string | null>(null);
  readonly previewAmount = signal(1180);
  readonly previewMode = signal<TaxPriceMode>('Inclusive');

  readonly filteredRules = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    return this.rules().filter((rule) => {
      const matchesTerm = !term || [rule.hsnCode, rule.description, `${rule.gstRate}%`].some((value) => value.toLowerCase().includes(term));
      return matchesTerm && (status === 'All' || rule.status === status);
    });
  });

  readonly activeCount = computed(() => this.rules().filter((rule) => rule.status === 'Active').length);
  readonly inactiveCount = computed(() => this.rules().filter((rule) => rule.status === 'Inactive').length);
  readonly zeroRatedCount = computed(() => this.rules().filter((rule) => rule.gstRate === 0).length);
  readonly preview = computed(() => this.taxService.calculateTax(this.previewAmount(), 18, this.previewMode()));

  readonly form = this.fb.group({
    hsnCode: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]],
    description: ['', Validators.required],
    gstRate: [18, [Validators.required, Validators.min(0), Validators.max(28)]],
    priceMode: ['Inclusive' as TaxPriceMode, Validators.required],
    effectiveFrom: ['2026-01-01', Validators.required],
    status: ['Active' as TaxRuleStatus, Validators.required],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ hsnCode: '', description: '', gstRate: 18, priceMode: 'Inclusive', effectiveFrom: new Date().toISOString().slice(0, 10), status: 'Active' });
  }

  openEdit(rule: TaxRule): void {
    this.editingId.set(rule.id);
    this.form.reset({ hsnCode: rule.hsnCode, description: rule.description, gstRate: rule.gstRate, priceMode: rule.priceMode, effectiveFrom: rule.effectiveFrom, status: rule.status });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const gstRate = Number(value.gstRate) || 0;
    const rule: Omit<TaxRule, 'id'> = {
      hsnCode: value.hsnCode!, description: value.description!, gstRate,
      cgstRate: gstRate / 2, sgstRate: gstRate / 2, igstRate: gstRate,
      priceMode: value.priceMode as TaxPriceMode, effectiveFrom: value.effectiveFrom!, status: value.status as TaxRuleStatus,
    };
    const id = this.editingId();
    id ? this.taxService.updateRule(id, rule) : this.taxService.addRule(rule);
  }

  deleteRule(id: string): void {
    if (confirm('Delete this tax rule? Products already using this rule will keep their saved tax snapshot.')) {
      this.taxService.deleteRule(id);
    }
  }

  exportRules(): void {
    const header = ['HSN Code', 'Description', 'GST Rate', 'CGST', 'SGST', 'IGST', 'Price Mode', 'Effective From', 'Status'];
    const rows = this.rules().map((rule) => [rule.hsnCode, rule.description, `${rule.gstRate}%`, `${rule.cgstRate}%`, `${rule.sgstRate}%`, `${rule.igstRate}%`, rule.priceMode, rule.effectiveFrom, rule.status]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tax-master-rules.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
