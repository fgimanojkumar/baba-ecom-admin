import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankDetailsService } from '../../shared/bank-details.service';
import { SellerService } from '../../shared/seller.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-bank-details',
  imports: [CommonModule, ReactiveFormsModule, PageInfo],
  templateUrl: './bank-details.html',
  styleUrl: './bank-details.scss',
})
export class BankDetailsPage {
  private readonly fb = inject(FormBuilder);
  private readonly bankDetailsService = inject(BankDetailsService);
  private readonly sellerService = inject(SellerService);

  readonly bankDetails = this.bankDetailsService.bankDetails;
  readonly savedMessage = signal(false);
  readonly gstNumber = signal(this.sellerService.sellers().find((seller) => seller.id === 'SEL001')?.gstNumber ?? '');

  readonly form = this.fb.group({
    accountHolderName: [this.bankDetails().accountHolderName, Validators.required],
    accountNumber: [this.bankDetails().accountNumber, Validators.required],
    ifscCode: [this.bankDetails().ifscCode, Validators.required],
    bankName: [this.bankDetails().bankName, Validators.required],
    branchName: [this.bankDetails().branchName],
    upiId: [this.bankDetails().upiId],
    gstNumber: [this.gstNumber(), [Validators.required, Validators.pattern(/^[0-9A-Z]{15}$/)]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as {
      accountHolderName: string; accountNumber: string; ifscCode: string;
      bankName: string; branchName: string; upiId: string; gstNumber: string;
    };
    const current = this.bankDetails();
    const bankChanged = ['accountHolderName', 'accountNumber', 'ifscCode', 'bankName', 'branchName', 'upiId']
      .some((key) => value[key as keyof typeof value] !== current[key as keyof typeof current]);
    const gstChanged = value.gstNumber !== this.gstNumber();
    if (!bankChanged && !gstChanged) {
      return;
    }
    this.sellerService.submitChangeRequest({
      sellerId: 'SEL001',
      sellerName: 'Rahul Traders',
      type: bankChanged && gstChanged ? 'Bank Details & GST Number' : bankChanged ? 'Bank Details' : 'GST Number',
      bankDetails: bankChanged ? {
        accountHolderName: value.accountHolderName, accountNumber: value.accountNumber, ifscCode: value.ifscCode,
        bankName: value.bankName, branchName: value.branchName, upiId: value.upiId,
      } : undefined,
      gstNumber: gstChanged ? value.gstNumber : undefined,
    });
    this.savedMessage.set(true);
    setTimeout(() => this.savedMessage.set(false), 2500);
  }
}
