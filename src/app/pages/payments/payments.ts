import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentStatus } from '../../shared/payment.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, FormsModule, PageInfo],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments {
  private readonly paymentService = inject(PaymentService);

  readonly payments = this.paymentService.payments;
  readonly totalRevenue = this.paymentService.totalRevenue;
  readonly totalPayouts = this.paymentService.totalPayouts;
  readonly pendingAmount = this.paymentService.pendingAmount;
  readonly totalRefunds = this.paymentService.totalRefunds;

  readonly activeTab = signal<'transactions' | 'batches'>('transactions');
  readonly searchTerm = signal('');
  readonly statusFilter = signal('');
  readonly statusOptions: PaymentStatus[] = ['Completed', 'Pending', 'Failed'];

  readonly payoutBatches = computed(() => {
    const bySeller = new Map<string, { sellerName: string; totalAmount: number; count: number; lastDate: string; status: PaymentStatus }>();

    for (const payment of this.payments()) {
      if (payment.type !== 'Payout') {
        continue;
      }
      const existing = bySeller.get(payment.sellerName);
      if (existing) {
        existing.totalAmount += payment.amount;
        existing.count += 1;
        existing.lastDate = payment.date > existing.lastDate ? payment.date : existing.lastDate;
        if (payment.status !== 'Completed') {
          existing.status = payment.status;
        }
      } else {
        bySeller.set(payment.sellerName, {
          sellerName: payment.sellerName,
          totalAmount: payment.amount,
          count: 1,
          lastDate: payment.date,
          status: payment.status,
        });
      }
    }

    return Array.from(bySeller.values());
  });

  readonly filteredPayments = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.payments().filter((payment) => {
      const matchesStatus = !status || payment.status === status;
      if (!matchesStatus) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        payment.orderId.toLowerCase().includes(term) ||
        payment.sellerName.toLowerCase().includes(term) ||
        payment.type.toLowerCase().includes(term)
      );
    });
  });

  updateStatus(id: string, status: PaymentStatus): void {
    this.paymentService.updateStatus(id, status);
  }

  exportSellerStatement(sellerName: string): void {
    const header = ['Transaction ID', 'Order ID', 'Type', 'Amount', 'Status', 'Date'];
    const rows = this.payments()
      .filter((p) => p.sellerName === sellerName)
      .map((p) => [p.id, p.orderId, p.type, p.amount, p.status, p.date]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sellerName.replace(/\s+/g, '-').toLowerCase()}-payout-statement.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
