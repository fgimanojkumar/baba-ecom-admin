import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankDetailsService } from '../../shared/bank-details.service';

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

  readonly bankDetails = this.bankDetailsService.bankDetails;
  readonly savedMessage = signal(false);

  readonly form = this.fb.group({
    accountHolderName: [this.bankDetails().accountHolderName, Validators.required],
    accountNumber: [this.bankDetails().accountNumber, Validators.required],
    ifscCode: [this.bankDetails().ifscCode, Validators.required],
    bankName: [this.bankDetails().bankName, Validators.required],
    branchName: [this.bankDetails().branchName],
    upiId: [this.bankDetails().upiId],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.bankDetailsService.updateBankDetails(this.form.getRawValue() as {
      accountHolderName: string; accountNumber: string; ifscCode: string;
      bankName: string; branchName: string; upiId: string;
    });
    this.savedMessage.set(true);
    setTimeout(() => this.savedMessage.set(false), 2500);
  }
}
