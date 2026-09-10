import { Injectable, signal } from '@angular/core';

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiId: string;
  verified: boolean;
}

@Injectable({ providedIn: 'root' })
export class BankDetailsService {
  private readonly _bankDetails = signal<BankDetails>({
    accountHolderName: 'Rahul Sharma',
    accountNumber: 'XXXXXXXX4821',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    branchName: 'Andheri West, Mumbai',
    upiId: 'rahul.traders@okhdfcbank',
    verified: true,
  });

  readonly bankDetails = this._bankDetails.asReadonly();

  updateBankDetails(data: Omit<BankDetails, 'verified'>): void {
    this._bankDetails.update((current) => ({ ...current, ...data, verified: false }));
  }
}
