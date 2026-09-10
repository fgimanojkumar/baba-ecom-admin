import { Injectable, signal } from '@angular/core';

export interface RoleRecord {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
}

let roleSeq = 100;

@Injectable({ providedIn: 'root' })
export class RoleService {
  readonly availablePermissions: string[] = [
    'Dashboard', 'Users', 'Customers', 'Sellers', 'Orders', 'Category', 'Sub Category', 'Products',
    'Sliders', 'Returns', 'Reviews', 'Payments', 'Offers', 'Notifications', 'Support', 'Reports',
    'Audit Log', 'Ads & Promotions', 'Settings',
  ];

  private readonly _roles = signal<RoleRecord[]>([
    { id: 'ROLE001', name: 'Super Admin', description: 'Full access to every module on the platform.', permissions: [...this.availablePermissions], usersCount: 1 },
    { id: 'ROLE002', name: 'Seller', description: 'Manages own products, orders, ads, and payouts.', permissions: ['Dashboard', 'Orders', 'Products', 'Returns', 'Reviews', 'Payments', 'Ads & Promotions', 'Support'], usersCount: 5 },
    { id: 'ROLE003', name: 'Support Staff', description: 'Handles customer tickets and inquiries only.', permissions: ['Dashboard', 'Support', 'Orders'], usersCount: 2 },
    { id: 'ROLE004', name: 'Catalog Manager', description: 'Manages products, categories, and sliders.', permissions: ['Dashboard', 'Products', 'Category', 'Sub Category', 'Sliders'], usersCount: 1 },
  ]);

  readonly roles = this._roles.asReadonly();

  addRole(data: Omit<RoleRecord, 'id' | 'usersCount'>): void {
    const record: RoleRecord = { ...data, id: `ROLE${roleSeq++}`, usersCount: 0 };
    this._roles.update((list) => [record, ...list]);
  }

  updateRole(id: string, data: Omit<RoleRecord, 'id' | 'usersCount'>): void {
    this._roles.update((list) => list.map((r) => (r.id === id ? { ...r, ...data } : r)));
  }

  deleteRole(id: string): void {
    this._roles.update((list) => list.filter((r) => r.id !== id));
  }
}
