import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../../shared/lib/pagination/pagination';
import { Order, OrderStatus } from './order.model';
import { MOCK_ORDERS } from './orders.data';

type StatusFilter = 'all' | OrderStatus;
type StepState = 'done' | 'current' | 'upcoming';

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'text-bg-warning',
  shipped: 'text-bg-info',
  delivered: 'text-bg-success',
  cancelled: 'text-bg-danger',
};

const PIPELINE: { key: OrderStatus; label: string; icon: string }[] = [
  { key: 'pending', label: 'Order Placed', icon: 'bi-receipt' },
  { key: 'shipped', label: 'Shipped', icon: 'bi-truck' },
  { key: 'delivered', label: 'Delivered', icon: 'bi-house-check' },
];

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, Pagination, PageInfo],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  private readonly orders = signal<Order[]>(MOCK_ORDERS);

  readonly activeStatus = signal<StatusFilter>('all');
  readonly searchTerm = signal('');
  readonly selectedOrder = signal<Order | null>(null);
  readonly selectedIds = signal<Set<string>>(new Set());

  readonly pipelineSteps = PIPELINE;

  readonly metrics = computed(() => {
    const all = this.orders();
    const count = (status: OrderStatus) => all.filter((order) => order.status === status).length;
    const delivered = count('delivered');

    return {
      total: all.length,
      pending: count('pending'),
      shipped: count('shipped'),
      delivered,
      cancelled: count('cancelled'),
      deliveredRate: all.length ? Math.round((delivered / all.length) * 100) : 0,
    };
  });

  readonly filteredOrders = computed(() => {
    const status = this.activeStatus();
    const term = this.searchTerm().trim().toLowerCase();

    return this.orders().filter((order) => {
      const matchesStatus = status === 'all' || order.status === status;
      const matchesTerm =
        !term ||
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  });

  setStatus(status: StatusFilter): void {
    this.activeStatus.set(status);
    this.selectedIds.set(new Set());
  }

  viewOrder(order: Order): void {
    this.selectedOrder.set(order);
  }

  updateStatus(order: Order, status: OrderStatus): void {
    this.orders.update((list) => list.map((o) => (o.id === order.id ? { ...o, status } : o)));
    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.delete(order.id);
      return next;
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelect(id: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleSelectAll(orders: Order[]): void {
    const allSelected = orders.length > 0 && orders.every((order) => this.isSelected(order.id));
    this.selectedIds.set(allSelected ? new Set() : new Set(orders.map((order) => order.id)));
  }

  subtotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  tax(order: Order): number {
    return Math.round(this.subtotal(order) * order.taxRate);
  }

  grandTotal(order: Order): number {
    return this.subtotal(order) + this.tax(order) + order.shipping;
  }

  statusBadgeClass(status: OrderStatus): string {
    return STATUS_BADGE[status];
  }

  stepState(order: Order, stepKey: OrderStatus): StepState {
    const currentIndex = PIPELINE.findIndex((step) => step.key === order.status);
    const stepIndex = PIPELINE.findIndex((step) => step.key === stepKey);

    if (currentIndex < 0 || stepIndex < currentIndex) {
      return 'done';
    }

    return stepIndex === currentIndex ? 'current' : 'upcoming';
  }

  courierPartner(order: Order): string {
    if (order.status === 'pending' || order.status === 'cancelled') {
      return 'Not shipped yet';
    }
    return order.courierPartner ?? 'BlueDart Express';
  }

  trackingId(order: Order): string {
    if (order.status === 'pending' || order.status === 'cancelled') {
      return '—';
    }
    return order.trackingId ?? `AWB${order.id.replace(/\D/g, '').slice(-8)}`;
  }

  printInvoice(order: Order): void {
    const rows = order.items
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.sku}</td>
            <td style="text-align:right">₹${item.price.toFixed(2)}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:right">₹${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`
      )
      .join('');

    const html = `
      <html>
        <head>
          <title>Invoice ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 13px; }
            th { background: #f3f4f6; text-align: left; }
            .totals td { border: none; padding: 4px 8px; }
            .meta { display: flex; justify-content: space-between; margin-top: 16px; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>Invoice</h1>
          <p>Order #${order.id} &middot; ${order.date}</p>
          <div class="meta">
            <div>
              <strong>Billed To</strong><br>
              ${order.customerName}<br>
              ${order.customerEmail}<br>
              ${order.billingAddress}
            </div>
            <div>
              <strong>Ship To</strong><br>
              ${order.shippingAddress}
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Product</th><th>SKU</th><th style="text-align:right">Price</th><th style="text-align:center">Qty</th><th style="text-align:right">Total</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <table class="totals" style="width:280px; margin-left:auto;">
            <tr><td>Subtotal</td><td style="text-align:right">₹${this.subtotal(order).toFixed(2)}</td></tr>
            <tr><td>Shipping</td><td style="text-align:right">₹${order.shipping.toFixed(2)}</td></tr>
            <tr><td>GST (${order.taxRate * 100}%)</td><td style="text-align:right">₹${this.tax(order).toFixed(2)}</td></tr>
            <tr><td><strong>Grand Total</strong></td><td style="text-align:right"><strong>₹${this.grandTotal(order).toFixed(2)}</strong></td></tr>
          </table>
        </body>
      </html>`;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}
