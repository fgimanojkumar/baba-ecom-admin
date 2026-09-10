export type ReturnStatus = 'pending' | 'approved' | 'in-transit' | 'completed' | 'rejected';

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  product: string;
  sku: string;
  reason: string;
  dateSubmitted: string;
  status: ReturnStatus;
  refundAmount: number;
  trackingId?: string;
  rejectionReason?: string;
}
