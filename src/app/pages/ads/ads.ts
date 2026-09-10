import { AfterViewInit, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdCampaign, AdService, AdStatus, AgeGroup, DeviceType, Gender, AdPlacement } from '../../shared/ad.service';
import { AuthService } from '../../shared/auth.service';
import { CHART_COLORS } from '../../shared/chart-colors';

declare const Chart: any;

type ViewTab = 'campaigns' | 'reports';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-ads',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo],
  templateUrl: './ads.html',
  styleUrl: './ads.scss',
})
export class Ads implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly adService = inject(AdService);
  private readonly authService = inject(AuthService);

  private salesChart: any;
  private viewsChart: any;
  private ageChart: any;
  private genderChart: any;
  private campaignAgeChart: any;
  private campaignGenderChart: any;
  private campaignSalesChart: any;
  private campaignFunnelChart: any;
  private campaignBudgetChart: any;

  readonly isAdmin = this.authService.isAdmin;
  readonly activeTab = signal<ViewTab>('campaigns');

  readonly campaigns = this.adService.campaigns;
  readonly searchTerm = signal('');
  readonly statusFilter = signal('');
  readonly editingId = signal<string | null>(null);

  readonly ageGroups = this.adService.ageGroups;
  readonly genders = this.adService.genders;
  readonly devices = this.adService.devices;
  readonly locations = this.adService.locations;
  readonly placements = this.adService.placements;
  readonly interests = this.adService.interests;
  readonly statusOptions: AdStatus[] = ['Pending', 'Active', 'Paused', 'Completed', 'Rejected'];

  readonly selectedCampaign = signal<AdCampaign | null>(null);

  readonly reportStartDate = signal('');
  readonly reportEndDate = signal('');

  readonly reportCampaigns = computed(() => {
    const start = this.reportStartDate();
    const end = this.reportEndDate();
    if (!start && !end) {
      return this.campaigns();
    }
    return this.campaigns().filter((c) => {
      if (start && c.endDate < start) {
        return false;
      }
      if (end && c.startDate > end) {
        return false;
      }
      return true;
    });
  });

  readonly reportTotalSpend = computed(() => this.reportCampaigns().reduce((sum, c) => sum + c.spent, 0));
  readonly reportTotalAdRevenue = computed(() => this.reportCampaigns().reduce((sum, c) => sum + c.adRevenue, 0));
  readonly reportTotalNormalRevenue = computed(() => this.reportCampaigns().reduce((sum, c) => sum + c.normalRevenue, 0));
  readonly reportTotalAdOrders = computed(() => this.reportCampaigns().reduce((sum, c) => sum + c.adOrders, 0));
  readonly reportTotalNormalOrders = computed(() => this.reportCampaigns().reduce((sum, c) => sum + c.normalOrders, 0));
  readonly reportTotalImpressions = computed(() => this.reportCampaigns().reduce((sum, c) => sum + c.impressions, 0));
  readonly reportTotalClicks = computed(() => this.reportCampaigns().reduce((sum, c) => sum + c.clicks, 0));

  readonly reportAverageCtr = computed(() => {
    const impressions = this.reportTotalImpressions();
    return impressions ? Math.round((this.reportTotalClicks() / impressions) * 10000) / 100 : 0;
  });

  readonly reportRoas = computed(() => {
    const spend = this.reportTotalSpend();
    return spend ? Math.round((this.reportTotalAdRevenue() / spend) * 100) / 100 : 0;
  });

  readonly reportAgeTotals = computed<Record<AgeGroup, number>>(() => {
    const totals: Record<AgeGroup, number> = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    for (const campaign of this.reportCampaigns()) {
      for (const group of this.ageGroups) {
        totals[group] += campaign.viewsByAge[group];
      }
    }
    return totals;
  });

  readonly reportGenderTotals = computed<Record<Gender, number>>(() => {
    const totals: Record<Gender, number> = { Male: 0, Female: 0, Other: 0 };
    for (const campaign of this.reportCampaigns()) {
      for (const gender of this.genders) {
        totals[gender] += campaign.viewsByGender[gender];
      }
    }
    return totals;
  });

  readonly filteredCampaigns = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.campaigns().filter((campaign) => {
      const matchesStatus = !status || campaign.status === status;
      if (!matchesStatus) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        campaign.productName.toLowerCase().includes(term) ||
        campaign.sellerName.toLowerCase().includes(term) ||
        campaign.status.toLowerCase().includes(term)
      );
    });
  });

  readonly form = this.fb.group({
    productName: ['', Validators.required],
    sellerName: ['', Validators.required],
    budget: [1000, [Validators.required, Validators.min(100)]],
    bidAmount: [3, [Validators.required, Validators.min(1)]],
    startDate: [new Date().toISOString().slice(0, 10), Validators.required],
    endDate: ['', Validators.required],
    targetAgeGroups: this.fb.control<AgeGroup[]>(['18-24', '25-34']),
    targetGenders: this.fb.control<Gender[]>(['Male', 'Female']),
    targetLocations: this.fb.control<string[]>([]),
    targetDevices: this.fb.control<DeviceType[]>(['Mobile App', 'Mobile Web']),
    targetPlacements: this.fb.control<AdPlacement[]>(['Home Feed', 'Search Results']),
    targetInterests: this.fb.control<string[]>([]),
  });

  setTab(tab: ViewTab): void {
    this.activeTab.set(tab);
    if (tab === 'reports') {
      setTimeout(() => this.renderCharts(), 0);
    }
  }

  toggleAgeGroup(group: AgeGroup, checked: boolean): void {
    const current = this.form.controls.targetAgeGroups.value ?? [];
    this.form.controls.targetAgeGroups.setValue(
      checked ? [...current, group] : current.filter((g) => g !== group)
    );
  }

  toggleGender(gender: Gender, checked: boolean): void {
    const current = this.form.controls.targetGenders.value ?? [];
    this.form.controls.targetGenders.setValue(
      checked ? [...current, gender] : current.filter((g) => g !== gender)
    );
  }

  toggleLocation(location: string, checked: boolean): void {
    const current = this.form.controls.targetLocations.value ?? [];
    this.form.controls.targetLocations.setValue(
      checked ? [...current, location] : current.filter((l) => l !== location)
    );
  }

  toggleDevice(device: DeviceType, checked: boolean): void {
    const current = this.form.controls.targetDevices.value ?? [];
    this.form.controls.targetDevices.setValue(
      checked ? [...current, device] : current.filter((d) => d !== device)
    );
  }

  togglePlacement(placement: AdPlacement, checked: boolean): void {
    const current = this.form.controls.targetPlacements.value ?? [];
    this.form.controls.targetPlacements.setValue(
      checked ? [...current, placement] : current.filter((p) => p !== placement)
    );
  }

  toggleInterest(interest: string, checked: boolean): void {
    const current = this.form.controls.targetInterests.value ?? [];
    this.form.controls.targetInterests.setValue(
      checked ? [...current, interest] : current.filter((i) => i !== interest)
    );
  }

  isAgeChecked(group: AgeGroup): boolean {
    return (this.form.controls.targetAgeGroups.value ?? []).includes(group);
  }

  isGenderChecked(gender: Gender): boolean {
    return (this.form.controls.targetGenders.value ?? []).includes(gender);
  }

  isLocationChecked(location: string): boolean {
    return (this.form.controls.targetLocations.value ?? []).includes(location);
  }

  isDeviceChecked(device: DeviceType): boolean {
    return (this.form.controls.targetDevices.value ?? []).includes(device);
  }

  isPlacementChecked(placement: AdPlacement): boolean {
    return (this.form.controls.targetPlacements.value ?? []).includes(placement);
  }

  isInterestChecked(interest: string): boolean {
    return (this.form.controls.targetInterests.value ?? []).includes(interest);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({
      productName: '', sellerName: '', budget: 1000, bidAmount: 3,
      startDate: new Date().toISOString().slice(0, 10), endDate: '',
      targetAgeGroups: ['18-24', '25-34'], targetGenders: ['Male', 'Female'],
      targetLocations: [], targetDevices: ['Mobile App', 'Mobile Web'],
      targetPlacements: ['Home Feed', 'Search Results'], targetInterests: [],
    });
  }

  openEdit(campaign: AdCampaign): void {
    this.editingId.set(campaign.id);
    this.form.reset({
      productName: campaign.productName, sellerName: campaign.sellerName,
      budget: campaign.budget, bidAmount: campaign.bidAmount,
      startDate: campaign.startDate, endDate: campaign.endDate,
      targetAgeGroups: campaign.targetAgeGroups, targetGenders: campaign.targetGenders,
      targetLocations: campaign.targetLocations, targetDevices: campaign.targetDevices,
      targetPlacements: campaign.targetPlacements, targetInterests: campaign.targetInterests,
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const editingId = this.editingId();

    if (editingId) {
      this.adService.updateCampaign(editingId, value as Parameters<AdService['updateCampaign']>[1]);
    } else {
      this.adService.addCampaign(value as Parameters<AdService['addCampaign']>[0]);
    }
  }

  updateStatus(id: string, status: AdStatus): void {
    this.adService.updateStatus(id, status);
  }

  cloneCampaign(id: string): void {
    this.adService.cloneCampaign(id);
  }

  viewReport(campaign: AdCampaign): void {
    this.selectedCampaign.set(campaign);
    setTimeout(() => this.renderCampaignCharts(), 200);
  }

  ctrFor(campaign: AdCampaign): number {
    return this.adService.ctrFor(campaign);
  }

  conversionRateFor(campaign: AdCampaign): number {
    return this.adService.conversionRateFor(campaign);
  }

  roasFor(campaign: AdCampaign): number {
    return this.adService.roasFor(campaign);
  }

  deleteCampaign(id: string): void {
    if (confirm('Are you sure you want to delete this ad campaign?')) {
      this.adService.deleteCampaign(id);
    }
  }

  setReportRange(start: string, end: string): void {
    this.reportStartDate.set(start);
    this.reportEndDate.set(end);
    setTimeout(() => this.renderCharts(), 0);
  }

  resetReportRange(): void {
    this.reportStartDate.set('');
    this.reportEndDate.set('');
    setTimeout(() => this.renderCharts(), 0);
  }

  exportReportCsv(): void {
    const header = ['Product', 'Seller', 'Impressions', 'Clicks', 'CTR %', 'Conversion %', 'Spend', 'Ad Revenue', 'ROAS', 'Ad Orders', 'Normal Orders'];
    const rows = this.reportCampaigns().map((c) => [
      c.productName, c.sellerName, c.impressions, c.clicks, this.ctrFor(c), this.conversionRateFor(c),
      c.spent, c.adRevenue, this.roasFor(c), c.adOrders, c.normalOrders,
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ad-performance-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  ngAfterViewInit(): void {
    if (this.activeTab() === 'reports') {
      this.renderCharts();
    }

    const reportModal = document.getElementById('adReportModal');
    reportModal?.addEventListener('shown.bs.modal', () => this.renderCampaignCharts());
  }

  private renderCampaignCharts(): void {
    const campaign = this.selectedCampaign();
    if (!campaign) {
      return;
    }

    const ageCtx = document.getElementById('campaignAgeChart') as HTMLCanvasElement;
    if (ageCtx) {
      this.campaignAgeChart?.destroy();
      this.campaignAgeChart = new Chart(ageCtx, {
        type: 'bar',
        data: {
          labels: this.ageGroups,
          datasets: [{ label: 'Viewers', data: this.ageGroups.map((g) => campaign.viewsByAge[g]), backgroundColor: CHART_COLORS.purple }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
      });
    }

    const genderCtx = document.getElementById('campaignGenderChart') as HTMLCanvasElement;
    if (genderCtx) {
      this.campaignGenderChart?.destroy();
      this.campaignGenderChart = new Chart(genderCtx, {
        type: 'doughnut',
        data: {
          labels: this.genders,
          datasets: [{ data: this.genders.map((g) => campaign.viewsByGender[g]), backgroundColor: [CHART_COLORS.info, CHART_COLORS.pink, CHART_COLORS.warning] }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    const salesCtx = document.getElementById('campaignSalesChart') as HTMLCanvasElement;
    if (salesCtx) {
      this.campaignSalesChart?.destroy();
      this.campaignSalesChart = new Chart(salesCtx, {
        type: 'bar',
        data: {
          labels: ['Orders', 'Revenue (₹ in 000s)'],
          datasets: [
            { label: 'Ad Sales', data: [campaign.adOrders, Math.round(campaign.adRevenue / 1000)], backgroundColor: CHART_COLORS.primary },
            { label: 'Normal Sales', data: [campaign.normalOrders, Math.round(campaign.normalRevenue / 1000)], backgroundColor: CHART_COLORS.secondary },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    const funnelCtx = document.getElementById('campaignFunnelChart') as HTMLCanvasElement;
    if (funnelCtx) {
      this.campaignFunnelChart?.destroy();
      this.campaignFunnelChart = new Chart(funnelCtx, {
        type: 'bar',
        data: {
          labels: ['Impressions', 'Clicks', 'Ad Orders'],
          datasets: [{
            label: 'Funnel',
            data: [campaign.impressions, campaign.clicks, campaign.adOrders],
            backgroundColor: [CHART_COLORS.info, CHART_COLORS.success, CHART_COLORS.warning],
          }],
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        },
      });
    }

    const budgetCtx = document.getElementById('campaignBudgetChart') as HTMLCanvasElement;
    if (budgetCtx) {
      this.campaignBudgetChart?.destroy();
      const remaining = Math.max(campaign.budget - campaign.spent, 0);
      this.campaignBudgetChart = new Chart(budgetCtx, {
        type: 'doughnut',
        data: {
          labels: ['Spent', 'Remaining'],
          datasets: [{ data: [campaign.spent, remaining], backgroundColor: [CHART_COLORS.danger, CHART_COLORS.neutralLight] }],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%' },
      });
    }
  }

  private renderCharts(): void {
    const salesCtx = document.getElementById('adSalesChart') as HTMLCanvasElement;
    if (salesCtx) {
      this.salesChart?.destroy();
      this.salesChart = new Chart(salesCtx, {
        type: 'bar',
        data: {
          labels: ['Orders', 'Revenue (₹ in 000s)'],
          datasets: [
            { label: 'Ad Sales', data: [this.reportTotalAdOrders(), Math.round(this.reportTotalAdRevenue() / 1000)], backgroundColor: CHART_COLORS.primary },
            { label: 'Normal Sales', data: [this.reportTotalNormalOrders(), Math.round(this.reportTotalNormalRevenue() / 1000)], backgroundColor: CHART_COLORS.secondary },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    const viewsCtx = document.getElementById('adViewsChart') as HTMLCanvasElement;
    if (viewsCtx) {
      this.viewsChart?.destroy();
      this.viewsChart = new Chart(viewsCtx, {
        type: 'line',
        data: {
          labels: this.reportCampaigns().map((c) => c.productName),
          datasets: [
            { label: 'Impressions', data: this.reportCampaigns().map((c) => c.impressions), borderColor: CHART_COLORS.info, backgroundColor: CHART_COLORS.infoSoft, fill: true, tension: 0.35 },
            { label: 'Clicks', data: this.reportCampaigns().map((c) => c.clicks), borderColor: CHART_COLORS.success, backgroundColor: CHART_COLORS.successSoft, fill: true, tension: 0.35 },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    const ageCtx = document.getElementById('adAgeChart') as HTMLCanvasElement;
    if (ageCtx) {
      this.ageChart?.destroy();
      const ageTotals = this.reportAgeTotals();
      this.ageChart = new Chart(ageCtx, {
        type: 'bar',
        data: {
          labels: this.ageGroups,
          datasets: [{ label: 'Viewers', data: this.ageGroups.map((g) => ageTotals[g]), backgroundColor: CHART_COLORS.purple }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
      });
    }

    const genderCtx = document.getElementById('adGenderChart') as HTMLCanvasElement;
    if (genderCtx) {
      this.genderChart?.destroy();
      const genderTotals = this.reportGenderTotals();
      this.genderChart = new Chart(genderCtx, {
        type: 'doughnut',
        data: {
          labels: this.genders,
          datasets: [{ data: this.genders.map((g) => genderTotals[g]), backgroundColor: [CHART_COLORS.info, CHART_COLORS.pink, CHART_COLORS.warning] }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }
}
