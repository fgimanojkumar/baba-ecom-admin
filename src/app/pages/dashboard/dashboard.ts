import { Component, AfterViewInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../products/product.service';
import { PaymentService } from '../../shared/payment.service';
import { TicketService } from '../../shared/ticket.service';
import { UserService } from '../users/user.service';
import { MOCK_ORDERS } from '../orders/orders.data';
import { CHART_COLORS, CHART_PALETTE } from '../../shared/chart-colors';

declare const Chart: any;

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PageInfo, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements AfterViewInit {
  private readonly productService = inject(ProductService);
  private readonly paymentService = inject(PaymentService);
  private readonly ticketService = inject(TicketService);
  private readonly userService = inject(UserService);

  private readonly products = toSignal(this.productService.products$, { initialValue: [] });

  readonly totalRevenue = this.paymentService.totalRevenue;
  readonly totalOrders = MOCK_ORDERS.length;
  readonly totalCustomers = computed(() => this.userService.users().length);
  readonly openTickets = computed(() => this.ticketService.tickets().filter((t) => t.status === 'Open').length);
  readonly urgentTickets = computed(() => this.ticketService.tickets().filter((t) => t.status === 'Open' && t.priority === 'High').length);

  readonly lowStockProducts = computed(() =>
    this.products()
      .filter((p) => p.inventory().trackInventory && p.inventory().stock <= p.inventory().minStock)
      .map((p) => ({
        name: p.name(),
        sku: p.sku(),
        stock: p.inventory().stock,
        minStock: p.inventory().minStock,
      }))
  );

  exportSummary(): void {
    const header = ['Metric', 'Value'];
    const rows = [
      ['Total Revenue', this.totalRevenue()],
      ['Total Orders', this.totalOrders],
      ['Total Customers', this.totalCustomers()],
      ['Open Tickets', this.openTickets()],
      ['Urgent Tickets', this.urgentTickets()],
    ];
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-summary.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  ngAfterViewInit(): void {

    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Sales',
          data: [120, 200, 150, 300, 250, 400, 33, 232, 244, 232, 224, 555],
          backgroundColor: CHART_COLORS.primary
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });


     const ctx2 = document.getElementById('salesChart2') as HTMLCanvasElement;

    new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Sales',
          data: [120, 200, 150, 300, 250, 400, 33, 232, 244, 232, 224, 555],
          backgroundColor: [...CHART_PALETTE, CHART_COLORS.neutralLight, CHART_COLORS.info]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  }
}