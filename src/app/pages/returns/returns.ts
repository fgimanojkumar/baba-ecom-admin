import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Calendar } from '../../shared/lib/calendar/calendar';
import { ReturnRequest, ReturnStatus } from './return.model';
import { MOCK_RETURNS } from './returns.data';
import { PaymentService } from '../../shared/payment.service';

const STATUS_BADGE: Record<ReturnStatus, string> = {
  pending: 'text-bg-secondary',
  approved: 'text-bg-info',
  'in-transit': 'text-bg-primary',
  completed: 'text-bg-success',
  rejected: 'text-bg-danger',
};

let trackingSeq = 1000;

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-returns',
  imports: [CommonModule, FormsModule, Calendar, PageInfo],
  templateUrl: './returns.html',
  styleUrl: './returns.scss',
})
export class Returns {
  private readonly returns = signal<ReturnRequest[]>(MOCK_RETURNS);
  private readonly paymentService = inject(PaymentService);

  readonly activeStatus = signal<ReturnStatus>('pending');
  readonly searchTerm = signal('');
  readonly startDate = signal<Date | null>(null);
  readonly endDate = signal<Date | null>(null);
  readonly selectedReturn = signal<ReturnRequest | null>(null);

  readonly counts = computed(() => {
    const all = this.returns();
    const count = (status: ReturnStatus) => all.filter((r) => r.status === status).length;
    return {
      pending: count('pending'),
      approved: count('approved'),
      inTransit: count('in-transit'),
      completed: count('completed'),
      rejected: count('rejected'),
    };
  });

  readonly filteredReturns = computed(() => {
    const status = this.activeStatus();
    const term = this.searchTerm().trim().toLowerCase();
    const start = this.startDate();
    const end = this.endDate();

    return this.returns().filter((request) => {
      if (request.status !== status) {
        return false;
      }

      const matchesTerm =
        !term ||
        request.id.toLowerCase().includes(term) ||
        request.orderId.toLowerCase().includes(term) ||
        request.customerName.toLowerCase().includes(term);

      if (!matchesTerm) {
        return false;
      }

      const submitted = new Date(request.dateSubmitted);
      if (start && submitted < start) {
        return false;
      }
      if (end && submitted > end) {
        return false;
      }

      return true;
    });
  });

  statusBadgeClass(status: ReturnStatus): string {
    return STATUS_BADGE[status];
  }

  setStatus(status: ReturnStatus): void {
    this.activeStatus.set(status);
  }

  onStartDateChange(value: Date | null): void {
    this.startDate.set(value);
  }

  onEndDateChange(value: Date | null): void {
    this.endDate.set(value);
  }

  viewReturn(request: ReturnRequest): void {
    this.selectedReturn.set(request);
  }

  approve(request: ReturnRequest): void {
    this.updateReturn(request.id, { status: 'approved' });
  }

  reject(request: ReturnRequest): void {
    this.updateReturn(request.id, { status: 'rejected', rejectionReason: 'Not eligible per return policy' });
  }

  markInTransit(request: ReturnRequest): void {
    this.updateReturn(request.id, { status: 'in-transit', trackingId: `AWB${trackingSeq++}` });
  }

  markReceived(request: ReturnRequest): void {
    this.updateReturn(request.id, { status: 'completed' });
    this.paymentService.addPayment({
      orderId: request.orderId,
      sellerName: 'N/A',
      amount: request.refundAmount,
      type: 'Refund',
      status: 'Completed',
      date: new Date().toISOString().slice(0, 10),
    });
  }

  private updateReturn(id: string, patch: Partial<ReturnRequest>): void {
    this.returns.update((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
}
