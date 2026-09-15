import { Injectable, signal } from '@angular/core';

export type AuditAction = 'Create' | 'Update' | 'Delete' | 'Approve' | 'Reject' | 'Login' | 'Status Change';
export type AuditModule = 'Sellers' | 'Products' | 'Orders' | 'Category' | 'Offers' | 'Ads' | 'Users' | 'Settings' | 'Auth';

export interface AuditLogEntry {
  id: string;
  actor: string;
  role: 'admin' | 'seller';
  action: AuditAction;
  module: AuditModule;
  description: string;
  timestamp: string;
}

let logSeq = 100;

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly _entries = signal<AuditLogEntry[]>([
    { id: 'LOG001', actor: 'Manoj Kumar', role: 'admin', action: 'Approve', module: 'Sellers', description: 'Approved seller "Rahul Traders" onboarding request.', timestamp: '2026-09-09 10:15' },
    { id: 'LOG002', actor: 'Manoj Kumar', role: 'admin', action: 'Reject', module: 'Sellers', description: 'Rejected seller "Kitchen Craft Co." KYC due to incomplete documents.', timestamp: '2026-09-09 11:02' },
    { id: 'LOG003', actor: 'Rahul Traders', role: 'seller', action: 'Create', module: 'Products', description: 'Added new product "Multani Mitti Face Wash".', timestamp: '2026-09-09 12:40' },
    { id: 'LOG004', actor: 'Rahul Traders', role: 'seller', action: 'Create', module: 'Ads', description: 'Created ad campaign for "Multani Mitti Face Wash".', timestamp: '2026-09-09 13:05' },
    { id: 'LOG005', actor: 'Manoj Kumar', role: 'admin', action: 'Approve', module: 'Ads', description: 'Approved ad campaign AD001.', timestamp: '2026-09-09 13:20' },
    { id: 'LOG006', actor: 'Manoj Kumar', role: 'admin', action: 'Status Change', module: 'Orders', description: 'Marked order ORD-001252 as shipped.', timestamp: '2026-09-09 15:10' },
    { id: 'LOG007', actor: 'Manoj Kumar', role: 'admin', action: 'Update', module: 'Offers', description: 'Updated coupon "SUMMER20" expiry date.', timestamp: '2026-09-10 09:00' },
    { id: 'LOG008', actor: 'Rahul Traders', role: 'seller', action: 'Login', module: 'Auth', description: 'Logged into the seller workspace.', timestamp: '2026-09-10 09:30' },
    { id: 'LOG009', actor: 'Manoj Kumar', role: 'admin', action: 'Update', module: 'Settings', description: 'Updated default shipping charge to \u20b949.', timestamp: '2026-09-10 10:45' },
    { id: 'LOG010', actor: 'Manoj Kumar', role: 'admin', action: 'Delete', module: 'Category', description: 'Removed unused sub-category "Herbal Face Wash".', timestamp: '2026-09-10 11:05' },
  ]);

  readonly entries = this._entries.asReadonly();

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const record: AuditLogEntry = {
      ...entry,
      id: `LOG${logSeq++}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    this._entries.update((list) => [record, ...list]);
  }
}
