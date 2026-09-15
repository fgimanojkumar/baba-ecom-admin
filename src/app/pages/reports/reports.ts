import { Component, AfterViewInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../shared/payment.service';
import { SellerService } from '../../shared/seller.service';
import { CatalogService } from '../../shared/catalog.service';
import { UserService } from '../users/user.service';
import { MOCK_ORDERS } from '../orders/orders.data';
import { CHART_COLORS } from '../../shared/chart-colors';

declare const Chart: any;

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, PageInfo],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements AfterViewInit {
  private readonly paymentService = inject(PaymentService);
  private readonly sellerService = inject(SellerService);
  private readonly catalogService = inject(CatalogService);
  private readonly userService = inject(UserService);

  readonly totalRevenue = this.paymentService.totalRevenue;
  readonly totalPayouts = this.paymentService.totalPayouts;
  readonly totalSellers = computed(() => this.sellerService.sellers().length);
  readonly totalCustomers = computed(() => this.userService.users().length);

  readonly topSellers = computed(() =>
    [...this.sellerService.sellers()].sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 5)
  );

  readonly topCategories = computed(() =>
    [...this.catalogService.categories()].sort((a, b) => b.productCount - a.productCount).slice(0, 5)
  );

  exportGstReportCsv(): void {
    const header = ['Order ID', 'Customer', 'Date', 'Subtotal', 'GST Rate', 'GST Collected', 'Grand Total'];
    const rows = MOCK_ORDERS.map((order) => {
      const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const gst = Math.round(subtotal * order.taxRate);
      return [order.id, order.customerName, order.date, subtotal, `${order.taxRate * 100}%`, gst, subtotal + gst + order.shipping];
    });
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gst-tax-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  ngAfterViewInit(): void {
    const revenueCtx = document.getElementById('revenueTrendChart') as HTMLCanvasElement;
    if (revenueCtx) {
      new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          datasets: [{
            label: 'Revenue (₹)',
            data: [180000, 210000, 195000, 260000, 305000, 340000, 372000],
            borderColor: CHART_COLORS.primary,
            backgroundColor: CHART_COLORS.primarySoft,
            tension: 0.35,
            fill: true,
          }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    const orderStatusCtx = document.getElementById('orderStatusChart') as HTMLCanvasElement;
    if (orderStatusCtx) {
      new Chart(orderStatusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Delivered', 'Shipped', 'Pending', 'Cancelled'],
          datasets: [{
            data: [62, 18, 14, 6],
            backgroundColor: [CHART_COLORS.success, CHART_COLORS.info, CHART_COLORS.warning, CHART_COLORS.danger],
          }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }
}
