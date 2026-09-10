import { Injectable, signal } from '@angular/core';

export type TicketPriority = 'Low' | 'Medium' | 'High';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface TicketRecord {
  id: string;
  subject: string;
  customerName: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  createdDate: string;
}

let ticketSeq = 100;

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly _tickets = signal<TicketRecord[]>([
    { id: 'TCK001', subject: 'Order not delivered yet', customerName: 'Ananya Gupta', priority: 'High', status: 'Open', assignedTo: 'Support Team A', createdDate: '2026-09-05' },
    { id: 'TCK002', subject: 'Refund not received', customerName: 'Rohit Kumar', priority: 'High', status: 'In Progress', assignedTo: 'Support Team B', createdDate: '2026-09-04' },
    { id: 'TCK003', subject: 'Product received damaged', customerName: 'Fatima Sheikh', priority: 'Medium', status: 'Resolved', assignedTo: 'Support Team A', createdDate: '2026-09-01' },
    { id: 'TCK004', subject: 'Unable to apply coupon code', customerName: 'Suresh Nair', priority: 'Low', status: 'Closed', assignedTo: 'Support Team C', createdDate: '2026-08-29' },
    { id: 'TCK005', subject: 'Seller payout delay query', customerName: 'Rahul Traders (Seller)', priority: 'Medium', status: 'Open', assignedTo: 'Unassigned', createdDate: '2026-09-08' },
  ]);

  readonly tickets = this._tickets.asReadonly();

  addTicket(data: Omit<TicketRecord, 'id'>): void {
    const record: TicketRecord = { ...data, id: `TCK${ticketSeq++}` };
    this._tickets.update((list) => [record, ...list]);
  }

  updateTicket(id: string, data: Omit<TicketRecord, 'id'>): void {
    this._tickets.update((list) => list.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }

  deleteTicket(id: string): void {
    this._tickets.update((list) => list.filter((t) => t.id !== id));
  }
}
