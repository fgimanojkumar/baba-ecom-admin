import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { WarehouseRecord, WarehouseService } from '../../shared/warehouse.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-warehouses',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo],
  templateUrl: './warehouses.html',
  styleUrl: './warehouses.scss',
})
export class Warehouses {
  private readonly fb = inject(FormBuilder);
  private readonly warehouseService = inject(WarehouseService);

  readonly warehouses = this.warehouseService.warehouses;
  readonly totalCapacity = this.warehouseService.totalCapacity;
  readonly totalStock = this.warehouseService.totalStock;
  readonly searchTerm = signal('');
  readonly editingId = signal<string | null>(null);

  readonly filteredWarehouses = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.warehouses();
    }
    return this.warehouses().filter((w) => w.name.toLowerCase().includes(term) || w.location.toLowerCase().includes(term));
  });

  readonly form = this.fb.group({
    name: ['', Validators.required],
    location: ['', Validators.required],
    manager: ['', Validators.required],
    capacity: [10000, [Validators.required, Validators.min(0)]],
    currentStock: [0, [Validators.min(0)]],
    status: ['Active' as 'Active' | 'Inactive'],
  });

  utilizationPercent(warehouse: WarehouseRecord): number {
    return this.warehouseService.utilizationPercent(warehouse);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', location: '', manager: '', capacity: 10000, currentStock: 0, status: 'Active' });
  }

  openEdit(warehouse: WarehouseRecord): void {
    this.editingId.set(warehouse.id);
    this.form.reset({
      name: warehouse.name, location: warehouse.location, manager: warehouse.manager,
      capacity: warehouse.capacity, currentStock: warehouse.currentStock, status: warehouse.status,
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Omit<WarehouseRecord, 'id'>;
    const editingId = this.editingId();

    if (editingId) {
      this.warehouseService.updateWarehouse(editingId, value);
    } else {
      this.warehouseService.addWarehouse(value);
    }
  }

  deleteWarehouse(id: string): void {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      this.warehouseService.deleteWarehouse(id);
    }
  }
}
