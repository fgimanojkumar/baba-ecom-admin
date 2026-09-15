export type ReturnStatus = 'pending' | 'approved' | 'issued' | 'in-transit' | 'inspection' | 'completed' | 'rejected';

export interface ReturnEvidence {
  name: string;
  type: 'image' | 'video';
  submittedAt: string;
  previewUrl?: string;
}

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
  refundPaymentId?: string;
  rejectionReason?: string;
  evidence: ReturnEvidence[];
  adminNote?: string;
  pickupDate?: string;
  inspectionNote?: string;
}
