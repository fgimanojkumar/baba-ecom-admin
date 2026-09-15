import { Injectable, signal } from '@angular/core';

export interface RoleRecord {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  systemRole?: boolean;
}

let roleSeq = 100;

@Injectable({ providedIn: 'root' })
export class RoleService {
  readonly availablePermissions: string[] = [
    'Super Admin Dashboard', 'Business Dashboard', 'Users', 'Customers', 'Sellers', 'Orders', 'Category',
    'Sub Category', 'Products', 'Sliders', 'Returns', 'Reviews', 'Payments', 'Offers', 'Notifications',
    'Support', 'Reports', 'Audit Log', 'Ads & Promotions', 'GST & Tax Master', 'GST Compliance',
    'Bank Details', 'Shipping', 'Warehouses', 'Media Library', 'Pincodes', 'State', 'City', 'Address',
    'Wishlist', 'Contact Us', 'Roles & Permissions', 'Static Pages', 'Settings', 'Profile',
  ];

  private readonly _roles = signal<RoleRecord[]>([
    { id: 'ROLE001', name: 'Super Admin', description: 'Full access to every module on the platform.', permissions: [...this.availablePermissions], usersCount: 1, systemRole: true },
    { id: 'ROLE002', name: 'Seller', description: 'Manages own products, orders, ads, payouts, and GST working files.', permissions: ['Business Dashboard', 'Orders', 'Products', 'Returns', 'Reviews', 'Payments', 'Ads & Promotions', 'GST Compliance', 'Bank Details', 'Support', 'Profile'], usersCount: 5, systemRole: true },
    { id: 'ROLE003', name: 'Support Staff', description: 'Handles customer tickets and order inquiries only.', permissions: ['Business Dashboard', 'Support', 'Orders', 'Profile'], usersCount: 2 },
    { id: 'ROLE004', name: 'Catalog Manager', description: 'Manages products, categories, media, and sliders.', permissions: ['Business Dashboard', 'Products', 'Category', 'Sub Category', 'Sliders', 'Media Library', 'Profile'], usersCount: 1 },
    { id: 'ROLE005', name: 'Finance Manager', description: 'Reviews payments, GST, payouts, returns, and reports.', permissions: ['Business Dashboard', 'Payments', 'GST & Tax Master', 'GST Compliance', 'Reports', 'Returns', 'Profile'], usersCount: 0 },
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
    this._roles.update((list) => list.filter((r) => r.id !== id || r.systemRole));
  }

  isSystemRole(id: string): boolean {
    return this._roles().some((role) => role.id === id && role.systemRole);
  }

  hasPermission(roleName: string | null | undefined, permission: string): boolean {
    if (!roleName) {
      return false;
    }
    return this._roles().some((role) => role.name === roleName && role.permissions.includes(permission));
  }
}
