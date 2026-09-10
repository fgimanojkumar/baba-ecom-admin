import { Injectable, signal } from '@angular/core';

export type NotificationAudience = 'All' | 'Sellers' | 'Customers';
export type NotificationChannel = 'Email' | 'SMS' | 'Push';
export type NotificationStatus = 'Sent' | 'Scheduled' | 'Draft';

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  channel: NotificationChannel;
  status: NotificationStatus;
  date: string;
}

let notificationSeq = 100;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<NotificationRecord[]>([
    { id: 'NOT001', title: 'Festive Sale is Live!', message: 'Up to 60% off across all categories. Shop now!', audience: 'Customers', channel: 'Push', status: 'Sent', date: '2026-09-01' },
    { id: 'NOT002', title: 'New Seller Policy Update', message: 'Updated commission structure effective from next month.', audience: 'Sellers', channel: 'Email', status: 'Sent', date: '2026-09-04' },
    { id: 'NOT003', title: 'Weekend Flash Deal', message: 'Flat 20% off on electronics this weekend only.', audience: 'All', channel: 'SMS', status: 'Scheduled', date: '2026-09-12' },
    { id: 'NOT004', title: 'Server Maintenance Notice', message: 'Platform will be under maintenance from 1 AM - 3 AM.', audience: 'All', channel: 'Email', status: 'Draft', date: '2026-09-10' },
  ]);

  readonly notifications = this._notifications.asReadonly();

  addNotification(data: Omit<NotificationRecord, 'id'>): void {
    const record: NotificationRecord = { ...data, id: `NOT${notificationSeq++}` };
    this._notifications.update((list) => [record, ...list]);
  }

  updateNotification(id: string, data: Omit<NotificationRecord, 'id'>): void {
    this._notifications.update((list) => list.map((n) => (n.id === id ? { ...n, ...data } : n)));
  }

  markSent(id: string): void {
    this._notifications.update((list) => list.map((n) => (n.id === id ? { ...n, status: 'Sent' as const } : n)));
  }

  deleteNotification(id: string): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }
}
