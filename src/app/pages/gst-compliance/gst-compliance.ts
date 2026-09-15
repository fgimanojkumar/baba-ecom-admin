import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { GstComplianceService } from '../../shared/gst-compliance.service';
import { SellerService } from '../../shared/seller.service';
import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-gst-compliance',
  imports: [CommonModule, FormsModule, PageInfo],
  templateUrl: './gst-compliance.html',
  styleUrl: './gst-compliance.scss',
})
export class GstCompliance {
  private readonly auth = inject(AuthService);
  private readonly sellerService = inject(SellerService);
  readonly compliance = inject(GstComplianceService);

  readonly period = signal('07/2026');
  readonly generatedMessage = signal('');
  readonly seller = computed(() => this.sellerService.sellers().find((item) => item.email === this.auth.currentUser()?.email) ?? this.sellerService.sellers()[0]);
  readonly currentSummary = computed(() => this.compliance.summary(this.period()));
  readonly isNilReturn = computed(() => this.currentSummary().invoiceCount === 0);

  setPeriod(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const [year, month] = value.split('-');
    if (year && month) this.period.set(`${month}/${year}`);
  }

  periodInputValue(): string {
    const [month, year] = this.period().split('/');
    return `${year}-${month}`;
  }

  generateAndDownload(type: 'GSTR-1' | 'GSTR-3B' | 'Sales Register'): void {
    const gstin = this.seller()?.gstNumber ?? 'GSTIN_NOT_AVAILABLE';
    this.compliance.generate(type, this.period());
    if (type === 'GSTR-1') this.compliance.exportGstr1(this.period(), gstin);
    if (type === 'GSTR-3B') this.compliance.exportGstr3b(this.period(), gstin);
    if (type === 'Sales Register') this.compliance.exportSalesRegister(this.period(), gstin);
    this.generatedMessage.set(`${type} working file downloaded for ${this.period()}. Upload or file it on the GST portal after verification.`);
    window.setTimeout(() => this.generatedMessage.set(''), 5000);
  }
}
