import { Injectable, signal } from '@angular/core';

export type CustomerStatus = 'Active' | 'Inactive';

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
  status: CustomerStatus;
}

let customerSeq = 100;

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly _customers = signal<CustomerRecord[]>([
    { id: 'CUS001', name: 'Manoj Kumar', email: 'manoj@example.com', phone: '9876543210', joinedDate: '2026-01-15', totalOrders: 12, totalSpent: 28450, status: 'Active' },
    { id: 'CUS002', name: 'Priya Sharma', email: 'priya@example.com', phone: '9812345670', joinedDate: '2026-02-20', totalOrders: 5, totalSpent: 9820, status: 'Active' },
    { id: 'CUS003', name: 'Ananya Gupta', email: 'ananya.gupta@example.com', phone: '9988776655', joinedDate: '2026-05-10', totalOrders: 3, totalSpent: 4200, status: 'Active' },
    { id: 'CUS004', name: 'Rohit Kumar', email: 'rohit.kumar@example.com', phone: '9123456789', joinedDate: '2026-08-01', totalOrders: 1, totalSpent: 899, status: 'Active' },
    { id: 'CUS005', name: 'Fatima Sheikh', email: 'fatima.sheikh@example.com', phone: '9090909090', joinedDate: '2025-11-05', totalOrders: 0, totalSpent: 0, status: 'Inactive' },
  ]);

  readonly customers = this._customers.asReadonly();

  addCustomer(data: Omit<CustomerRecord, 'id' | 'totalOrders' | 'totalSpent'>): void {
    const record: CustomerRecord = { ...data, id: `CUS${customerSeq++}`, totalOrders: 0, totalSpent: 0 };
    this._customers.update((list) => [record, ...list]);
  }

  updateCustomer(id: string, data: Omit<CustomerRecord, 'id' | 'totalOrders' | 'totalSpent'>): void {
    this._customers.update((list) => list.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }

  deleteCustomer(id: string): void {
    this._customers.update((list) => list.filter((c) => c.id !== id));
  }
}
