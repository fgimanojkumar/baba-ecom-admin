import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../../shared/lib/pagination/pagination';
import { DeliveryAttempt, Order, OrderStatus, OrderStatusEvent } from './order.model';
import { MOCK_ORDERS } from './orders.data';

type StatusFilter = 'all' | OrderStatus;
type StepState = 'done' | 'current' | 'upcoming';

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'text-bg-warning',
  confirmed: 'text-bg-primary',
  packed: 'text-bg-info',
  shipped: 'text-bg-info',
  'out-for-delivery': 'text-bg-warning',
  delivered: 'text-bg-success',
  cancelled: 'text-bg-danger',
};

const PIPELINE: { key: OrderStatus; label: string; icon: string }[] = [
  { key: 'pending', label: 'Order Placed', icon: 'bi-receipt' },
  { key: 'confirmed', label: 'Confirmed', icon: 'bi-check-circle' },
  { key: 'packed', label: 'Packed', icon: 'bi-box-seam' },
  { key: 'shipped', label: 'Shipped', icon: 'bi-truck' },
  { key: 'out-for-delivery', label: 'Out for Delivery', icon: 'bi-pin-map' },
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
  readonly autoProcessingIds = signal<Set<string>>(new Set());
  readonly deliveryFailureReason = signal('Customer unavailable');

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
    const event: OrderStatusEvent = {
      status,
      occurredAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      location: this.statusLocation(status),
    };
    this.orders.update((list) => list.map((o) =>
      o.id === order.id ? { ...o, status, statusHistory: [...(o.statusHistory ?? []), event] } : o
    ));
    if (this.selectedOrder()?.id === order.id) {
      this.selectedOrder.update((selected) => selected ? { ...selected, status, statusHistory: [...(selected.statusHistory ?? []), event] } : null);
    }
    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.delete(order.id);
      return next;
    });
  }

  isAutoProcessing(orderId: string): boolean {
    return this.autoProcessingIds().has(orderId);
  }

  autoFulfillOrder(order: Order): void {
    if (order.status !== 'pending' || this.isAutoProcessing(order.id)) {
      return;
    }
    this.autoProcessingIds.update((ids) => new Set(ids).add(order.id));
    const stages: OrderStatus[] = ['confirmed', 'packed', 'shipped', 'out-for-delivery', 'delivered'];
    stages.forEach((status, index) => {
      window.setTimeout(() => {
        const currentOrder = this.orders().find((candidate) => candidate.id === order.id);
        if (currentOrder?.status === (index === 0 ? 'pending' : stages[index - 1])) {
          this.updateStatus(currentOrder, status);
        }
        if (index === stages.length - 1) {
          this.autoProcessingIds.update((ids) => {
            const next = new Set(ids);
            next.delete(order.id);
            return next;
          });
        }
      }, (index + 1) * 1200);
    });
  }

  autoFulfillAllPendingOrders(): void {
    this.filteredOrders()
      .filter((order) => order.status === 'pending')
      .forEach((order) => this.autoFulfillOrder(order));
  }

  logDeliveryAttempt(order: Order): void {
    if (order.status !== 'out-for-delivery') {
      return;
    }
    const attempt: DeliveryAttempt = {
      attemptedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      reason: this.deliveryFailureReason(),
    };
    const event: OrderStatusEvent = {
      status: 'out-for-delivery',
      occurredAt: attempt.attemptedAt,
      location: `Delivery attempt failed: ${attempt.reason}. Re-attempt scheduled.`,
    };
    this.orders.update((orders) => orders.map((candidate) =>
      candidate.id === order.id
        ? { ...candidate, deliveryAttempts: [...(candidate.deliveryAttempts ?? []), attempt], statusHistory: [...(candidate.statusHistory ?? []), event] }
        : candidate
    ));
    this.selectedOrder.update((selected) => selected?.id === order.id
      ? { ...selected, deliveryAttempts: [...(selected.deliveryAttempts ?? []), attempt], statusHistory: [...(selected.statusHistory ?? []), event] }
      : selected);
  }

  confirmAllPendingOrders(): void {
    const pendingOrderIds = new Set(
      this.filteredOrders().filter((order) => order.status === 'pending').map((order) => order.id)
    );
    if (!pendingOrderIds.size) {
      return;
    }

    const occurredAt = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    this.orders.update((orders) => orders.map((order) =>
      pendingOrderIds.has(order.id)
        ? {
            ...order,
            status: 'confirmed',
            statusHistory: [...(order.statusHistory ?? []), {
              status: 'confirmed',
              occurredAt,
              location: this.statusLocation('confirmed'),
            }],
          }
        : order
    ));
    this.selectedIds.set(new Set());
  }

  nextStatus(order: Order): OrderStatus | null {
    const currentIndex = PIPELINE.findIndex((step) => step.key === order.status);
    return currentIndex >= 0 && currentIndex < PIPELINE.length - 1
      ? PIPELINE[currentIndex + 1].key
      : null;
  }

  nextActionLabel(order: Order): string {
    const nextStatus = this.nextStatus(order);
    return nextStatus ? `Mark ${PIPELINE.find((step) => step.key === nextStatus)?.label}` : '';
  }

  orderTimeline(order: Order): OrderStatusEvent[] {
    if (order.statusHistory?.length) {
      return order.statusHistory;
    }
    const currentIndex = PIPELINE.findIndex((step) => step.key === order.status);
    return PIPELINE.slice(0, currentIndex + 1).map((step) => ({
      status: step.key,
      occurredAt: step.key === order.status ? 'Current status' : 'Completed',
      location: this.statusLocation(step.key),
    }));
  }

  statusLabel(status: OrderStatus): string {
    return PIPELINE.find((step) => step.key === status)?.label ?? 'Cancelled';
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
    const eligibleOrders = orders.filter((order) => order.status !== 'cancelled');
    const allSelected = eligibleOrders.length > 0 && eligibleOrders.every((order) => this.isSelected(order.id));
    this.selectedIds.set(allSelected ? new Set() : new Set(eligibleOrders.map((order) => order.id)));
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
    if (['pending', 'packed', 'cancelled'].includes(order.status)) {
      return 'Not shipped yet';
    }
    return order.courierPartner ?? 'BlueDart Express';
  }

  trackingId(order: Order): string {
    if (['pending', 'packed', 'cancelled'].includes(order.status)) {
      return '—';
    }
    return order.trackingId ?? `AWB${order.id.replace(/\D/g, '').slice(-8)}`;
  }

  private statusLocation(status: OrderStatus): string {
    const locations: Record<OrderStatus, string> = {
      pending: 'Order management queue',
      confirmed: 'Seller confirmed the order',
      packed: 'Seller fulfillment center',
      shipped: 'Handed to courier partner',
      'out-for-delivery': 'Local delivery hub',
      delivered: 'Delivered to customer',
      cancelled: 'Order management queue',
    };
    return locations[status];
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

  printShippingLabels(): void {
    const selectedOrders = this.orders().filter((order) => this.selectedIds().has(order.id));
    if (!selectedOrders.length) {
      return;
    }

    const labels = selectedOrders.map((order) => `
      <section class="label">
        <div class="carrier">${this.courierPartner(order)}</div>
        <div class="tracking">${this.trackingId(order)}</div>
        <div class="divider"></div>
        <div><strong>Ship to</strong><br>${order.customerName}<br>${order.customerPhone}<br>${order.shippingAddress}</div>
        <div class="order">Order: ${order.id}</div>
      </section>`).join('');

    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      return;
    }
    printWindow.document.write(`
      <html><head><title>Shipping Labels</title><style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #111827; }
        .label { width: 360px; min-height: 220px; display: inline-block; vertical-align: top; margin: 10px; padding: 18px; border: 2px solid #111827; box-sizing: border-box; }
        .carrier { font-size: 13px; font-weight: 700; text-transform: uppercase; }
        .tracking { margin: 12px 0; font-size: 20px; font-weight: 700; letter-spacing: 1px; }
        .divider { border-top: 1px solid #9ca3af; margin: 12px 0; }
        .order { margin-top: 14px; font-size: 12px; }
      </style></head><body>${labels}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  downloadShippingLabel(order: Order): void {
    this.downloadLabels([order], `shipping-label-${order.id.toLowerCase()}.html`);
  }

  downloadShippingLabels(): void {
    const selectedOrders = this.orders().filter((order) => this.selectedIds().has(order.id));
    if (selectedOrders.length) {
      this.downloadLabels(selectedOrders, `shipping-labels-${new Date().toISOString().slice(0, 10)}.html`);
    }
  }

  downloadAllShippingLabels(): void {
    const eligibleOrders = this.filteredOrders().filter((order) => order.status !== 'cancelled');
    if (eligibleOrders.length) {
      this.downloadLabels(eligibleOrders, `all-shipping-labels-${new Date().toISOString().slice(0, 10)}.html`);
    }
  }

  exportOrdersCsv(): void {
    const header = ['Order ID', 'Customer', 'Email', 'Date', 'Items', 'Total', 'Payment Method', 'Status', 'Tracking ID'];
    const rows = this.filteredOrders().map((order) => [
      order.id,
      order.customerName,
      order.customerEmail,
      order.date,
      order.items.length,
      this.grandTotal(order).toFixed(2),
      order.paymentMethod,
      this.statusLabel(order.status),
      this.trackingId(order),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private downloadLabels(orders: Order[], filename: string): void {
    const labels = orders.map((order) => `
      <section class="label">
        <div class="carrier">${this.courierPartner(order)}</div>
        <div class="tracking">${this.trackingId(order)}</div>
        <div class="divider"></div>
        <div><strong>Ship to</strong><br>${order.customerName}<br>${order.customerPhone}<br>${order.shippingAddress}</div>
        <div class="order">Order: ${order.id}</div>
      </section>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Shipping Labels</title><style>
      body { font-family: Arial, sans-serif; padding: 20px; color: #111827; }
      .label { width: 360px; min-height: 220px; display: inline-block; vertical-align: top; margin: 10px; padding: 18px; border: 2px solid #111827; box-sizing: border-box; }
      .carrier { font-size: 13px; font-weight: 700; text-transform: uppercase; }
      .tracking { margin: 12px 0; font-size: 20px; font-weight: 700; letter-spacing: 1px; }
      .divider { border-top: 1px solid #9ca3af; margin: 12px 0; }
      .order { margin-top: 14px; font-size: 12px; }
    </style></head><body>${labels}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
