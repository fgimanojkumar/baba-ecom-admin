import { Injectable, signal } from '@angular/core';

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  uploadedDate: string;
  usedIn: string;
}

let mediaSeq = 100;

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly _items = signal<MediaItem[]>([
    { id: 'MED001', name: 'product-1.jpg', url: 'assets/images/ecommerce/product-1.jpg', uploadedDate: '2026-07-05', usedIn: 'Multani Mitti Face Wash (Product)' },
    { id: 'MED002', name: 'loginBg.jpg', url: 'assets/images/loginBg.jpg', uploadedDate: '2026-06-01', usedIn: 'Login Page Background' },
    { id: 'MED003', name: 'logo.png', url: 'assets/images/logo.png', uploadedDate: '2026-06-01', usedIn: 'Login Page Logo' },
    { id: 'MED004', name: 'avatar.jpg', url: 'assets/images/avatar/avatar.jpg', uploadedDate: '2026-06-10', usedIn: 'Default User Avatar' },
  ]);

  readonly items = this._items.asReadonly();

  addItem(data: Omit<MediaItem, 'id' | 'uploadedDate'>): void {
    const record: MediaItem = { ...data, id: `MED${mediaSeq++}`, uploadedDate: new Date().toISOString().slice(0, 10) };
    this._items.update((list) => [record, ...list]);
  }

  deleteItem(id: string): void {
    this._items.update((list) => list.filter((item) => item.id !== id));
  }
}
