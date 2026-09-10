import { ReturnRequest } from './return.model';

export const MOCK_RETURNS: ReturnRequest[] = [
  {
    id: 'RTN-005', orderId: 'ORD-001250', customerName: 'Ravi Verma', customerEmail: 'ravi@example.com',
    product: 'Cotton T-Shirt', sku: 'CT-118', reason: 'Wrong size', dateSubmitted: 'July 16, 2026',
    status: 'pending', refundAmount: 599,
  },
  {
    id: 'RTN-006', orderId: 'ORD-001257', customerName: 'Sanya Kapoor', customerEmail: 'sanya@example.com',
    product: 'Sunscreen SPF 50', sku: 'SS-330', reason: 'Item damaged in transit', dateSubmitted: 'July 16, 2026',
    status: 'pending', refundAmount: 480,
  },
  {
    id: 'RTN-004', orderId: 'ORD-001249', customerName: 'Sunita Devi', customerEmail: 'sunita@example.com',
    product: 'Leather Handbag', sku: 'LH-220', reason: 'Not as described', dateSubmitted: 'July 15, 2026',
    status: 'approved', refundAmount: 1450,
  },
  {
    id: 'RTN-003', orderId: 'ORD-001248', customerName: 'Amit Singh', customerEmail: 'amit@example.com',
    product: 'Charcoal Face Mask', sku: 'CF-410', reason: 'Changed my mind', dateSubmitted: 'July 14, 2026',
    status: 'in-transit', refundAmount: 350, trackingId: 'AWB123456789',
  },
  {
    id: 'RTN-002', orderId: 'ORD-001247', customerName: 'Manoj Kumar', customerEmail: 'manoj@example.com',
    product: 'Wireless Earbuds', sku: 'WE-901', reason: 'Defective product', dateSubmitted: 'July 12, 2026',
    status: 'completed', refundAmount: 1999, trackingId: 'AWB998877665',
  },
  {
    id: 'RTN-001', orderId: 'ORD-001246', customerName: 'Geeta Singh', customerEmail: 'geeta@example.com',
    product: 'Herbal Shampoo', sku: 'HS-221', reason: 'No longer needed', dateSubmitted: 'July 10, 2026',
    status: 'rejected', refundAmount: 380, rejectionReason: 'Return period expired',
  },
];
