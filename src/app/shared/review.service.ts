import { Injectable, signal } from '@angular/core';

export type ReviewStatus = 'Pending' | 'Approved' | 'Hidden';

export interface ReviewRecord {
  id: string;
  productName: string;
  sellerName: string;
  customerName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly _reviews = signal<ReviewRecord[]>([
    { id: 'REV001', productName: 'Multani Mitti Face Wash', sellerName: 'Rahul Traders', customerName: 'Ananya Gupta', rating: 5, comment: 'Skin feels so fresh, great product for oily skin!', status: 'Approved', date: '2026-08-28' },
    { id: 'REV002', productName: 'Smartphone X200', sellerName: 'Modern Electronics', customerName: 'Rohit Kumar', rating: 4, comment: 'Good performance, battery could be better.', status: 'Approved', date: '2026-08-30' },
    { id: 'REV003', productName: 'Cotton Casual T-Shirt', sellerName: 'Priya Fashion Hub', customerName: 'Fatima Sheikh', rating: 2, comment: 'Fabric quality was not as expected.', status: 'Pending', date: '2026-09-02' },
    { id: 'REV004', productName: 'Non-Stick Cookware Set', sellerName: 'Kitchen Craft Co.', customerName: 'Suresh Nair', rating: 1, comment: 'Coating peeled off after a week, very disappointed.', status: 'Pending', date: '2026-09-05' },
    { id: 'REV005', productName: 'Herbal Shampoo', sellerName: 'Herbal Roots', customerName: 'Kavya Reddy', rating: 5, comment: 'Best herbal shampoo I have used so far!', status: 'Hidden', date: '2026-09-06' },
    { id: 'REV006', productName: 'Multani Mitti Face Wash', sellerName: 'Rahul Traders', customerName: 'Vikas Malhotra', rating: 3, comment: 'Average product, packaging could be better.', status: 'Pending', date: '2026-09-08' },
  ]);

  readonly reviews = this._reviews.asReadonly();

  updateStatus(id: string, status: ReviewStatus): void {
    this._reviews.update((list) => list.map((review) => (review.id === id ? { ...review, status } : review)));
  }

  deleteReview(id: string): void {
    this._reviews.update((list) => list.filter((review) => review.id !== id));
  }
}
