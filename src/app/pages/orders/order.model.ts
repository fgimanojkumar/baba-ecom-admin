export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  name: string;
  sku: string;
  icon: string;
  price: number;
  quantity: number;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  occurredAt: string;
  location: string;
}

export interface DeliveryAttempt {
  attemptedAt: string;
  reason: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress: string;
  billingAddress: string;
  shipping: number;
  taxRate: number;
  items: OrderItem[];
  courierPartner?: string;
  trackingId?: string;
  statusHistory?: OrderStatusEvent[];
  deliveryAttempts?: DeliveryAttempt[];
}
