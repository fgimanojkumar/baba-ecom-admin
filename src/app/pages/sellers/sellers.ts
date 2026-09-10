import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SellerRecord, SellerService, SellerStatus } from '../../shared/seller.service';

import { Pagination } from '../../shared/lib/pagination/pagination';
import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-sellers',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo, Pagination],
  templateUrl: './sellers.html',
  styleUrl: './sellers.scss',
})
export class Sellers {
  private readonly fb = inject(FormBuilder);
  private readonly sellerService = inject(SellerService);

  readonly sellers = this.sellerService.sellers;
  readonly searchTerm = signal('');
  readonly statusFilter = signal('');
  readonly editingId = signal<string | null>(null);
  readonly selectedIds = signal<Set<string>>(new Set());

  readonly statusOptions: SellerStatus[] = ['Pending', 'Approved', 'Rejected', 'Suspended'];

  readonly filteredSellers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.sellers().filter((seller) => {
      const matchesStatus = !status || seller.status === status;
      if (!matchesStatus) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        seller.businessName.toLowerCase().includes(term) ||
        seller.ownerName.toLowerCase().includes(term) ||
        seller.email.toLowerCase().includes(term) ||
        seller.status.toLowerCase().includes(term)
      );
    });
  });

  readonly totalSellers = computed(() => this.sellers().length);
  readonly approvedSellers = computed(() => this.sellers().filter((s) => s.status === 'Approved').length);
  readonly pendingSellers = computed(() => this.sellers().filter((s) => s.status === 'Pending').length);
  readonly suspendedSellers = computed(() => this.sellers().filter((s) => s.status === 'Suspended').length);

  scoreFor(seller: SellerRecord): number {
    return this.sellerService.scoreFor(seller);
  }

  scoreLabel(score: number): string {
    return this.sellerService.scoreLabel(score);
  }

  readonly form = this.fb.group({
    businessName: ['', Validators.required],
    ownerName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    gstNumber: [''],
    commissionRate: [10, [Validators.required, Validators.min(0)]],
    status: ['Pending' as SellerStatus, Validators.required],
    joinedDate: [new Date().toISOString().slice(0, 10)],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({
      businessName: '', ownerName: '', email: '', phone: '', gstNumber: '',
      commissionRate: 10, status: 'Pending', joinedDate: new Date().toISOString().slice(0, 10),
    });
  }

  openEdit(seller: SellerRecord): void {
    this.editingId.set(seller.id);
    this.form.reset({
      businessName: seller.businessName, ownerName: seller.ownerName, email: seller.email,
      phone: seller.phone, gstNumber: seller.gstNumber, commissionRate: seller.commissionRate,
      status: seller.status, joinedDate: seller.joinedDate,
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Omit<SellerRecord, 'id' | 'totalProducts' | 'totalOrders' | 'onTimeDispatchRate' | 'returnRate' | 'customerRating'>;
    const editingId = this.editingId();

    if (editingId) {
      this.sellerService.updateSeller(editingId, value);
    } else {
      this.sellerService.addSeller(value);
    }
  }

  updateStatus(id: string, status: SellerStatus): void {
    this.sellerService.updateStatus(id, status);
  }

  deleteSeller(id: string): void {
    if (confirm('Are you sure you want to delete this seller?')) {
      this.sellerService.deleteSeller(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelect(id: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleSelectAll(list: SellerRecord[]): void {
    const allSelected = list.length > 0 && list.every((s) => this.isSelected(s.id));
    this.selectedIds.set(allSelected ? new Set() : new Set(list.map((s) => s.id)));
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  bulkApprove(): void {
    for (const id of this.selectedIds()) {
      this.sellerService.updateStatus(id, 'Approved');
    }
    this.clearSelection();
  }

  bulkDelete(): void {
    if (!confirm(`Delete ${this.selectedIds().size} selected seller(s)?`)) {
      return;
    }
    for (const id of this.selectedIds()) {
      this.sellerService.deleteSeller(id);
    }
    this.clearSelection();
  }

  bulkExportCsv(): void {
    const header = ['Business Name', 'Owner', 'Email', 'Phone', 'Commission %', 'Status'];
    const rows = this.sellers()
      .filter((s) => this.isSelected(s.id))
      .map((s) => [s.businessName, s.ownerName, s.email, s.phone, s.commissionRate, s.status]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sellers-selected.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
