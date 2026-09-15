import { Injectable, computed, signal } from '@angular/core';

export interface WishlistEntry {
  id: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  dateAdded: string;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly _entries = signal<WishlistEntry[]>([
    { id: 'WL001', productName: 'Herbal Face Wash', customerName: 'Manoj Kumar', customerEmail: 'manoj@example.com', dateAdded: '2026-07-10' },
    { id: 'WL002', productName: 'Organic Green Tea', customerName: 'Priya Sharma', customerEmail: 'priya@example.com', dateAdded: '2026-07-09' },
    { id: 'WL003', productName: 'Herbal Face Wash', customerName: 'Amit Singh', customerEmail: 'amit@example.com', dateAdded: '2026-07-08' },
    { id: 'WL004', productName: 'Smartphone X200', customerName: 'Rohit Kumar', customerEmail: 'rohit.kumar@example.com', dateAdded: '2026-08-02' },
    { id: 'WL005', productName: 'Cotton Casual T-Shirt', customerName: 'Fatima Sheikh', customerEmail: 'fatima.sheikh@example.com', dateAdded: '2026-08-20' },
  ]);

  readonly entries = this._entries.asReadonly();

  readonly totalItems = computed(() => this._entries().length);

  readonly mostWishlisted = computed(() => {
    const counts = new Map<string, number>();
    for (const entry of this._entries()) {
      counts.set(entry.productName, (counts.get(entry.productName) ?? 0) + 1);
    }
    let topName = '—';
    let topCount = 0;
    for (const [name, count] of counts) {
      if (count > topCount) {
        topName = name;
        topCount = count;
      }
    }
    return topName;
  });

  removeEntry(id: string): void {
    this._entries.update((list) => list.filter((entry) => entry.id !== id));
  }
}
