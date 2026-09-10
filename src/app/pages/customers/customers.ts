import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerRecord, CustomerService } from '../../shared/customer.service';

import { Pagination } from '../../shared/lib/pagination/pagination';
import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-customers',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo, Pagination],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);

  readonly customers = this.customerService.customers;
  readonly searchTerm = signal('');
  readonly editingId = signal<string | null>(null);
  readonly selectedIds = signal<Set<string>>(new Set());

  readonly totalCustomers = computed(() => this.customers().length);
  readonly activeCustomers = computed(() => this.customers().filter((c) => c.status === 'Active').length);
  readonly totalLifetimeValue = computed(() => this.customers().reduce((sum, c) => sum + c.totalSpent, 0));

  readonly filteredCustomers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.customers();
    }
    return this.customers().filter(
      (c) => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.phone.includes(term)
    );
  });

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    joinedDate: [new Date().toISOString().slice(0, 10)],
    status: ['Active' as 'Active' | 'Inactive'],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', email: '', phone: '', joinedDate: new Date().toISOString().slice(0, 10), status: 'Active' });
  }

  openEdit(customer: CustomerRecord): void {
    this.editingId.set(customer.id);
    this.form.reset({ name: customer.name, email: customer.email, phone: customer.phone, joinedDate: customer.joinedDate, status: customer.status });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Omit<CustomerRecord, 'id' | 'totalOrders' | 'totalSpent'>;
    const editingId = this.editingId();

    if (editingId) {
      this.customerService.updateCustomer(editingId, value);
    } else {
      this.customerService.addCustomer(value);
    }
  }

  deleteCustomer(id: string): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id);
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

  toggleSelectAll(list: CustomerRecord[]): void {
    const allSelected = list.length > 0 && list.every((c) => this.isSelected(c.id));
    this.selectedIds.set(allSelected ? new Set() : new Set(list.map((c) => c.id)));
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  bulkDelete(): void {
    if (!confirm(`Delete ${this.selectedIds().size} selected customer(s)?`)) {
      return;
    }
    for (const id of this.selectedIds()) {
      this.customerService.deleteCustomer(id);
    }
    this.clearSelection();
  }

  bulkExportCsv(): void {
    const header = ['Name', 'Email', 'Phone', 'Joined', 'Orders', 'Total Spent', 'Status'];
    const rows = this.customers()
      .filter((c) => this.isSelected(c.id))
      .map((c) => [c.name, c.email, c.phone, c.joinedDate, c.totalOrders, c.totalSpent, c.status]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers-selected.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
