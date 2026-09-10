export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  name: string;
  sku: string;
  icon: string;
  price: number;
  quantity: number;
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
}
