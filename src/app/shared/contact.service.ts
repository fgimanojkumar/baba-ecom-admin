import { Injectable, signal } from '@angular/core';

export type InquiryStatus = 'New' | 'Replied' | 'Closed';

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  reply: string;
  status: InquiryStatus;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly _inquiries = signal<ContactInquiry[]>([
    { id: 'MSG001', name: 'Manoj Kumar', email: 'manoj@example.com', subject: 'Question about my order #ORD-001250', message: 'Hello, I have a question regarding my recent order. Can you please provide an update on the shipping status? Thank you.', reply: '', status: 'New', date: '2026-07-18' },
    { id: 'MSG002', name: 'Priya Sharma', email: 'priya@example.com', subject: 'Feedback on product quality', message: 'The face wash I ordered was great, just wanted to share some feedback on the packaging.', reply: 'Hi Priya, thank you so much for your feedback! We will pass it along to our packaging team.', status: 'Replied', date: '2026-07-17' },
    { id: 'MSG003', name: 'Rohit Kumar', email: 'rohit.kumar@example.com', subject: 'Refund not received yet', message: 'I returned my order 2 weeks ago and still have not received my refund.', reply: '', status: 'New', date: '2026-08-30' },
    { id: 'MSG004', name: 'Fatima Sheikh', email: 'fatima.sheikh@example.com', subject: 'Bulk order inquiry', message: 'Do you offer discounts for bulk orders of over 50 units?', reply: 'Hi Fatima, yes we do! Please reach out to our sales team for a custom quote.', status: 'Closed', date: '2026-06-12' },
  ]);

  readonly inquiries = this._inquiries.asReadonly();

  reply(id: string, reply: string): void {
    this._inquiries.update((list) => list.map((i) => (i.id === id ? { ...i, reply, status: 'Replied' as InquiryStatus } : i)));
  }

  updateStatus(id: string, status: InquiryStatus): void {
    this._inquiries.update((list) => list.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  deleteInquiry(id: string): void {
    this._inquiries.update((list) => list.filter((i) => i.id !== id));
  }
}
