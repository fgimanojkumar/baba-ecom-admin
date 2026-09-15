import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Calendar } from '../../shared/lib/calendar/calendar';
import { ReturnEvidence, ReturnRequest, ReturnStatus } from './return.model';
import { MOCK_RETURNS } from './returns.data';
import { PaymentService } from '../../shared/payment.service';

const STATUS_BADGE: Record<ReturnStatus, string> = {
  pending: 'text-bg-secondary',
  approved: 'text-bg-info',
  issued: 'text-bg-primary',
  'in-transit': 'text-bg-primary',
  inspection: 'text-bg-warning',
  completed: 'text-bg-success',
  rejected: 'text-bg-danger',
};

let trackingSeq = 1000;
let returnSeq = 7;

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
  readonly uploadEvidence = signal<ReturnEvidence[]>([]);
  readonly uploadError = signal('');
  readonly selectedEvidence = signal<ReturnEvidence | null>(null);

  readonly counts = computed(() => {
    const all = this.returns();
    const count = (status: ReturnStatus) => all.filter((r) => r.status === status).length;
    return {
      pending: count('pending'),
      approved: count('approved'),
      issued: count('issued'),
      inTransit: count('in-transit'),
      inspection: count('inspection'),
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

  refundStatus(request: ReturnRequest): string {
    return this.paymentService.refundStatus(request.id) ?? 'Refund Pending';
  }

  refundBadgeClass(request: ReturnRequest): string {
    return this.refundStatus(request) === 'Refunded' ? 'text-bg-success' : 'text-bg-warning';
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

  onEvidenceSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const allowedFiles = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));

    if (allowedFiles.length !== files.length) {
      this.uploadError.set('Only image and video files can be attached.');
    } else {
      this.uploadError.set('');
    }

    this.uploadEvidence.update((evidence) => [
      ...evidence,
      ...allowedFiles.map((file): ReturnEvidence => ({
        name: file.name,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        submittedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    input.value = '';
  }

  removeUploadEvidence(index: number): void {
    const removed = this.uploadEvidence()[index];
    if (removed?.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    this.uploadEvidence.update((evidence) => evidence.filter((_, evidenceIndex) => evidenceIndex !== index));
  }

  previewEvidence(file: ReturnEvidence): void {
    this.selectedEvidence.set(file);
  }

  submitReturn(form: HTMLFormElement): void {
    if (!form.checkValidity() || this.uploadEvidence().length === 0) {
      form.classList.add('was-validated');
      this.uploadError.set(this.uploadEvidence().length === 0 ? 'Attach at least one image or video for review.' : 'Complete the required return details.');
      return;
    }

    const formData = new FormData(form);
    const request: ReturnRequest = {
      id: `RTN-00${returnSeq++}`,
      orderId: String(formData.get('orderId')).trim(),
      customerName: String(formData.get('customerName')).trim(),
      customerEmail: String(formData.get('customerEmail')).trim(),
      product: String(formData.get('product')).trim(),
      sku: String(formData.get('sku')).trim(),
      reason: String(formData.get('reason')).trim(),
      dateSubmitted: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'pending',
      refundAmount: Number(formData.get('refundAmount')),
      evidence: this.uploadEvidence(),
    };
    this.returns.update((list) => [request, ...list]);
    this.activeStatus.set('pending');
    this.uploadEvidence.set([]);
    this.uploadError.set('');
    form.reset();
  }

  approve(request: ReturnRequest): void {
    this.updateReturn(request.id, { status: 'approved', adminNote: 'Evidence reviewed and return approved.' });
  }

  reject(request: ReturnRequest): void {
    this.updateReturn(request.id, { status: 'rejected', rejectionReason: 'Not eligible per return policy' });
  }

  issueReturn(request: ReturnRequest): void {
    this.updateReturn(request.id, {
      status: 'issued',
      trackingId: `RVP${trackingSeq++}`,
      pickupDate: 'Pickup scheduled within 2 business days',
      adminNote: 'Return issued. Reverse pickup has been scheduled.',
    });
  }

  markInTransit(request: ReturnRequest): void {
    this.updateReturn(request.id, { status: 'in-transit' });
  }

  markReceived(request: ReturnRequest): void {
    this.updateReturn(request.id, { status: 'inspection', adminNote: 'Return received at fulfillment center. Awaiting quality inspection.' });
  }

  passInspection(request: ReturnRequest): void {
    const refund = this.paymentService.addPayment({
      orderId: request.orderId,
      returnId: request.id,
      sellerName: 'N/A',
      amount: request.refundAmount,
      type: 'Refund',
      status: 'Refund Pending',
      date: new Date().toISOString().slice(0, 10),
    });
    this.updateReturn(request.id, {
      status: 'completed',
      refundPaymentId: refund.id,
      inspectionNote: 'Quality inspection passed. Refund initiated to the original payment method.',
    });
  }

  failInspection(request: ReturnRequest): void {
    this.updateReturn(request.id, {
      status: 'rejected',
      rejectionReason: 'Return failed quality inspection. Product condition does not meet the return policy.',
      inspectionNote: 'Quality inspection failed.',
    });
  }

  private updateReturn(id: string, patch: Partial<ReturnRequest>): void {
    this.returns.update((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
}
