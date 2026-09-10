import { Injectable, signal } from '@angular/core';

export type StaticPageStatus = 'Published' | 'Draft';

export interface StaticPageRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: StaticPageStatus;
  updatedDate: string;
}

let pageSeq = 100;

@Injectable({ providedIn: 'root' })
export class StaticPageService {
  private readonly _pages = signal<StaticPageRecord[]>([
    { id: 'PAGE001', title: 'About Us', slug: 'about-us', content: 'Baba Ecom is a multi-vendor marketplace connecting sellers and customers across India.', status: 'Published', updatedDate: '2026-06-01' },
    { id: 'PAGE002', title: 'Terms & Conditions', slug: 'terms-and-conditions', content: 'By using this platform, you agree to our terms of service...', status: 'Published', updatedDate: '2026-05-15' },
    { id: 'PAGE003', title: 'Privacy Policy', slug: 'privacy-policy', content: 'We respect your privacy and are committed to protecting your personal data...', status: 'Published', updatedDate: '2026-05-15' },
    { id: 'PAGE004', title: 'Seller Agreement', slug: 'seller-agreement', content: 'Draft agreement outlining seller responsibilities and commission structure.', status: 'Draft', updatedDate: '2026-09-01' },
  ]);

  readonly pages = this._pages.asReadonly();

  addPage(data: Omit<StaticPageRecord, 'id' | 'updatedDate'>): void {
    const record: StaticPageRecord = { ...data, id: `PAGE${pageSeq++}`, updatedDate: new Date().toISOString().slice(0, 10) };
    this._pages.update((list) => [record, ...list]);
  }

  updatePage(id: string, data: Omit<StaticPageRecord, 'id' | 'updatedDate'>): void {
    this._pages.update((list) => list.map((p) => (p.id === id ? { ...p, ...data, updatedDate: new Date().toISOString().slice(0, 10) } : p)));
  }

  deletePage(id: string): void {
    this._pages.update((list) => list.filter((p) => p.id !== id));
  }
}
