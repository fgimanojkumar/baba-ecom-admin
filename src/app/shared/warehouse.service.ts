import { Injectable, computed, signal } from '@angular/core';

export type WarehouseStatus = 'Active' | 'Inactive';

export interface WarehouseRecord {
  id: string;
  name: string;
  location: string;
  manager: string;
  capacity: number;
  currentStock: number;
  status: WarehouseStatus;
}

let warehouseSeq = 100;

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly _warehouses = signal<WarehouseRecord[]>([
    { id: 'WH001', name: 'Mumbai Central Warehouse', location: 'Mumbai, Maharashtra', manager: 'Suresh Nair', capacity: 50000, currentStock: 32400, status: 'Active' },
    { id: 'WH002', name: 'Delhi NCR Fulfillment Center', location: 'Gurugram, Delhi NCR', manager: 'Neha Kapoor', capacity: 40000, currentStock: 28850, status: 'Active' },
    { id: 'WH003', name: 'Bengaluru South Hub', location: 'Bengaluru, Karnataka', manager: 'Arjun Reddy', capacity: 30000, currentStock: 12100, status: 'Active' },
    { id: 'WH004', name: 'Ahmedabad Storage Unit', location: 'Ahmedabad, Gujarat', manager: 'Kiran Patel', capacity: 15000, currentStock: 0, status: 'Inactive' },
  ]);

  readonly warehouses = this._warehouses.asReadonly();

  readonly totalCapacity = computed(() => this._warehouses().reduce((sum, w) => sum + w.capacity, 0));
  readonly totalStock = computed(() => this._warehouses().reduce((sum, w) => sum + w.currentStock, 0));

  utilizationPercent(warehouse: WarehouseRecord): number {
    return warehouse.capacity ? Math.round((warehouse.currentStock / warehouse.capacity) * 100) : 0;
  }

  addWarehouse(data: Omit<WarehouseRecord, 'id'>): void {
    const record: WarehouseRecord = { ...data, id: `WH${warehouseSeq++}` };
    this._warehouses.update((list) => [record, ...list]);
  }

  updateWarehouse(id: string, data: Omit<WarehouseRecord, 'id'>): void {
    this._warehouses.update((list) => list.map((w) => (w.id === id ? { ...w, ...data } : w)));
  }

  deleteWarehouse(id: string): void {
    this._warehouses.update((list) => list.filter((w) => w.id !== id));
  }
}
