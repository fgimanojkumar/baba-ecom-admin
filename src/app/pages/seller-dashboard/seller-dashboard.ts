import { AfterViewInit, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageInfo } from '../../shared/lib/page-info/page-info';
import { SellerAnalyticsService, SellerRange, SellerSaleRecord } from '../../shared/seller-analytics.service';

declare const Chart: any;

@Component({
  selector: 'app-seller-dashboard',
  imports: [CommonModule, FormsModule, PageInfo],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.scss',
})
export class SellerDashboard implements AfterViewInit {
  private readonly analytics = inject(SellerAnalyticsService);
  private readonly chartsReady = signal(false);
  private salesChart: any;
  private profitChart: any;
  private orderMixChart: any;

  readonly range = signal<SellerRange>('last-6-months');
  readonly customFrom = signal('');
  readonly customTo = signal('');
  readonly filteredRecords = computed(() => this.analytics.filter(this.range(), this.customFrom(), this.customTo()));
  readonly summary = computed(() => this.analytics.summary(this.filteredRecords()));
  readonly rangeLabel = computed(() => ({ today: 'Today', yesterday: 'Yesterday', 'last-month': 'Last month', 'last-3-months': 'Last 3 months', 'last-6-months': 'Last 6 months', 'last-year': 'Last 1 year', custom: 'Custom period' }[this.range()]));

  constructor() {
    effect(() => {
      this.filteredRecords();
      if (this.chartsReady()) window.setTimeout(() => this.renderCharts(), 0);
    });
  }

  ngAfterViewInit(): void {
    this.chartsReady.set(true);
    this.renderCharts();
  }

  setRange(range: SellerRange): void {
    this.range.set(range);
  }

  applyCustomRange(): void {
    if (this.customFrom() && this.customTo()) this.range.set('custom');
  }

  exportReport(): void {
    const summary = this.summary();
    const rows = [
      ['Period', this.rangeLabel()], ['Orders', summary.orders], ['Units sold', summary.units], ['Sales', summary.sales],
      ['Profit', summary.profit], ['Loss', summary.loss], ['Returns', summary.returns], ['RTO', summary.rto], ['Shipping', summary.shipping], ['Marketplace fee', summary.marketplaceFee],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a'); link.href = url; link.download = `seller-business-${this.rangeLabel().toLowerCase().replaceAll(' ', '-')}.csv`; link.click(); URL.revokeObjectURL(url);
  }

  private renderCharts(): void {
    const records = this.filteredRecords();
    const labels = this.chartLabels(records);
    const grouped = this.groupRecords(records, labels);
    this.salesChart?.destroy(); this.profitChart?.destroy(); this.orderMixChart?.destroy();
    const salesCanvas = document.getElementById('sellerSalesChart') as HTMLCanvasElement;
    const profitCanvas = document.getElementById('sellerProfitChart') as HTMLCanvasElement;
    const mixCanvas = document.getElementById('sellerOrderMixChart') as HTMLCanvasElement;
    if (!salesCanvas || !profitCanvas || !mixCanvas || typeof Chart === 'undefined') return;
    this.salesChart = new Chart(salesCanvas, { type: 'line', data: { labels, datasets: [{ label: 'Sales', data: grouped.sales, borderColor: '#2864d7', backgroundColor: 'rgba(40,100,215,.12)', fill: true, tension: .35, pointRadius: 2 }, { label: 'Profit', data: grouped.profit, borderColor: '#0d907e', backgroundColor: 'rgba(13,144,126,.08)', fill: true, tension: .35, pointRadius: 2 }] }, options: this.chartOptions() });
    this.profitChart = new Chart(profitCanvas, { type: 'bar', data: { labels, datasets: [{ label: 'Profit', data: grouped.profit, backgroundColor: '#77cdbd', borderRadius: 5 }, { label: 'Loss', data: grouped.loss, backgroundColor: '#f3a7a2', borderRadius: 5 }] }, options: this.chartOptions() });
    const summary = this.summary();
    this.orderMixChart = new Chart(mixCanvas, { type: 'doughnut', data: { labels: ['Delivered sales', 'Returns', 'RTO'], datasets: [{ data: [Math.max(0, summary.orders - summary.returns - summary.rto), summary.returns, summary.rto], backgroundColor: ['#2864d7', '#f5bf54', '#e47770'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } } } });
  }

  private chartOptions(): any { return { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(30,55,90,.08)' } }, x: { grid: { display: false } } } }; }

  private chartLabels(records: SellerSaleRecord[]): string[] { const labels = records.length > 90 ? records.filter((_, index) => index % 15 === 0).map((record) => record.date.slice(0, 7)) : records.filter((_, index) => index % Math.max(1, Math.floor(records.length / 14)) === 0).map((record) => record.date.slice(5)); return labels.length ? labels : ['No sales']; }

  private groupRecords(records: SellerSaleRecord[], labels: string[]): { sales: number[]; profit: number[]; loss: number[] } {
    if (!records.length) return { sales: labels.map(() => 0), profit: labels.map(() => 0), loss: labels.map(() => 0) };
    const step = Math.max(1, Math.ceil(records.length / labels.length));
    return labels.map((_, index) => records.slice(index * step, (index + 1) * step)).reduce((result, bucket) => { const totals = this.analytics.summary(bucket); result.sales.push(Math.round(totals.sales)); result.profit.push(Math.round(totals.profit)); result.loss.push(Math.round(totals.loss)); return result; }, { sales: [] as number[], profit: [] as number[], loss: [] as number[] });
  }
}
