import { Injectable, signal } from '@angular/core';

export type SellerStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended';

export interface SellerRecord {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNumber: string;
  commissionRate: number;
  status: SellerStatus;
  joinedDate: string;
  totalProducts: number;
  totalOrders: number;
  onTimeDispatchRate: number;
  returnRate: number;
  customerRating: number;
}

let sellerSeq = 100;

@Injectable({ providedIn: 'root' })
export class SellerService {
  private readonly _sellers = signal<SellerRecord[]>([
    { id: 'SEL001', businessName: 'Rahul Traders', ownerName: 'Rahul Sharma', email: 'seller@babaecom.com', phone: '9876543210', gstNumber: '27AAAAA0000A1Z5', commissionRate: 10, status: 'Approved', joinedDate: '2026-01-12', totalProducts: 48, totalOrders: 312, onTimeDispatchRate: 96, returnRate: 3, customerRating: 4.6 },
    { id: 'SEL002', businessName: 'Priya Fashion Hub', ownerName: 'Priya Verma', email: 'priya.fashion@example.com', phone: '9876501234', gstNumber: '07BBBBB1111B2Z6', commissionRate: 12, status: 'Approved', joinedDate: '2026-02-20', totalProducts: 120, totalOrders: 845, onTimeDispatchRate: 91, returnRate: 6, customerRating: 4.3 },
    { id: 'SEL003', businessName: 'Modern Electronics', ownerName: 'Amit Singh', email: 'modern.electro@example.com', phone: '9123456780', gstNumber: '29CCCCC2222C3Z7', commissionRate: 8, status: 'Pending', joinedDate: '2026-08-02', totalProducts: 0, totalOrders: 0, onTimeDispatchRate: 0, returnRate: 0, customerRating: 0 },
    { id: 'SEL004', businessName: 'Herbal Roots', ownerName: 'Sneha Iyer', email: 'herbal.roots@example.com', phone: '9988776655', gstNumber: '33DDDDD3333D4Z8', commissionRate: 15, status: 'Suspended', joinedDate: '2025-11-05', totalProducts: 32, totalOrders: 96, onTimeDispatchRate: 68, returnRate: 18, customerRating: 3.1 },
    { id: 'SEL005', businessName: 'Kitchen Craft Co.', ownerName: 'Vikram Rao', email: 'kitchencraft@example.com', phone: '9090909090', gstNumber: '19EEEEE4444E5Z9', commissionRate: 9, status: 'Rejected', joinedDate: '2026-06-18', totalProducts: 0, totalOrders: 0, onTimeDispatchRate: 0, returnRate: 0, customerRating: 0 },
  ]);

  readonly sellers = this._sellers.asReadonly();

  scoreFor(seller: SellerRecord): number {
    if (!seller.totalOrders) {
      return 0;
    }
    const raw = (seller.onTimeDispatchRate * 0.5) + ((100 - seller.returnRate) * 0.3) + (seller.customerRating * 20 * 0.2);
    return Math.round(raw);
  }

  scoreLabel(score: number): 'Excellent' | 'Good' | 'Average' | 'Poor' | 'N/A' {
    if (score === 0) {
      return 'N/A';
    }
    if (score >= 90) {
      return 'Excellent';
    }
    if (score >= 75) {
      return 'Good';
    }
    if (score >= 50) {
      return 'Average';
    }
    return 'Poor';
  }

  addSeller(data: Omit<SellerRecord, 'id' | 'totalProducts' | 'totalOrders' | 'onTimeDispatchRate' | 'returnRate' | 'customerRating'>): void {
    const record: SellerRecord = { ...data, id: `SEL${sellerSeq++}`, totalProducts: 0, totalOrders: 0, onTimeDispatchRate: 0, returnRate: 0, customerRating: 0 };
    this._sellers.update((list) => [record, ...list]);
  }

  updateSeller(id: string, data: Omit<SellerRecord, 'id' | 'totalProducts' | 'totalOrders' | 'onTimeDispatchRate' | 'returnRate' | 'customerRating'>): void {
    this._sellers.update((list) => list.map((seller) => (seller.id === id ? { ...seller, ...data } : seller)));
  }

  updateStatus(id: string, status: SellerStatus): void {
    this._sellers.update((list) => list.map((seller) => (seller.id === id ? { ...seller, status } : seller)));
  }

  deleteSeller(id: string): void {
    this._sellers.update((list) => list.filter((seller) => seller.id !== id));
  }
}
