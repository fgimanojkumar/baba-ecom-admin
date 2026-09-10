import { Injectable, computed, signal } from '@angular/core';

export type AdStatus = 'Pending' | 'Active' | 'Paused' | 'Completed' | 'Rejected';
export type AgeGroup = '18-24' | '25-34' | '35-44' | '45-54' | '55+';
export type Gender = 'Male' | 'Female' | 'Other';
export type DeviceType = 'Mobile App' | 'Desktop' | 'Mobile Web';
export type AdPlacement = 'Home Feed' | 'Search Results' | 'Category Page' | 'Product Page';

export interface AdCampaign {
  id: string;
  productName: string;
  sellerName: string;
  budget: number;
  spent: number;
  bidAmount: number;
  startDate: string;
  endDate: string;
  status: AdStatus;
  targetAgeGroups: AgeGroup[];
  targetGenders: Gender[];
  targetLocations: string[];
  targetDevices: DeviceType[];
  targetPlacements: AdPlacement[];
  targetInterests: string[];
  impressions: number;
  clicks: number;
  adOrders: number;
  adRevenue: number;
  normalOrders: number;
  normalRevenue: number;
  viewsByAge: Record<AgeGroup, number>;
  viewsByGender: Record<Gender, number>;
}

let campaignSeq = 100;

@Injectable({ providedIn: 'root' })
export class AdService {
  readonly ageGroups: AgeGroup[] = ['18-24', '25-34', '35-44', '45-54', '55+'];
  readonly genders: Gender[] = ['Male', 'Female', 'Other'];
  readonly devices: DeviceType[] = ['Mobile App', 'Mobile Web', 'Desktop'];
  readonly locations: string[] = ['Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh'];
  readonly placements: AdPlacement[] = ['Home Feed', 'Search Results', 'Category Page', 'Product Page'];
  readonly interests: string[] = ['Electronics', 'Apparel & Fashion', 'Home & Kitchen', 'Beauty & Personal Care', 'Sports & Fitness', 'Books & Stationery'];

  private readonly _campaigns = signal<AdCampaign[]>([
    {
      id: 'AD001', productName: 'Multani Mitti Face Wash', sellerName: 'Rahul Traders',
      budget: 5000, spent: 3120, bidAmount: 4, startDate: '2026-08-15', endDate: '2026-09-15', status: 'Active',
      targetAgeGroups: ['18-24', '25-34'], targetGenders: ['Female', 'Male'],
      targetLocations: ['Maharashtra', 'Delhi'], targetDevices: ['Mobile App', 'Mobile Web'],
      targetPlacements: ['Home Feed', 'Search Results'],
      targetInterests: ['Beauty & Personal Care'],
      impressions: 42500, clicks: 1860, adOrders: 210, adRevenue: 52290, normalOrders: 340, normalRevenue: 84660,
      viewsByAge: { '18-24': 15200, '25-34': 17800, '35-44': 6100, '45-54': 2600, '55+': 800 },
      viewsByGender: { Male: 16800, Female: 24200, Other: 1500 },
    },
    {
      id: 'AD002', productName: 'Smartphone X200', sellerName: 'Modern Electronics',
      budget: 20000, spent: 20000, bidAmount: 12, startDate: '2026-07-20', endDate: '2026-08-20', status: 'Completed',
      targetAgeGroups: ['18-24', '25-34', '35-44'], targetGenders: ['Male', 'Female'],
      targetLocations: ['Karnataka', 'Maharashtra', 'Delhi'], targetDevices: ['Mobile App', 'Desktop'],
      targetPlacements: ['Search Results', 'Product Page'],
      targetInterests: ['Electronics'],
      impressions: 128400, clicks: 6420, adOrders: 480, adRevenue: 719520, normalOrders: 610, normalRevenue: 914390,
      viewsByAge: { '18-24': 41200, '25-34': 52600, '35-44': 24800, '45-54': 7500, '55+': 2300 },
      viewsByGender: { Male: 78400, Female: 46500, Other: 3500 },
    },
    {
      id: 'AD003', productName: 'Cotton Casual T-Shirt', sellerName: 'Priya Fashion Hub',
      budget: 3000, spent: 1450, bidAmount: 3, startDate: '2026-09-01', endDate: '2026-09-30', status: 'Active',
      targetAgeGroups: ['18-24', '25-34'], targetGenders: ['Male', 'Female', 'Other'],
      targetLocations: ['Gujarat', 'Maharashtra'], targetDevices: ['Mobile App', 'Mobile Web', 'Desktop'],
      targetPlacements: ['Home Feed', 'Category Page'],
      targetInterests: ['Apparel & Fashion'],
      impressions: 21300, clicks: 980, adOrders: 96, adRevenue: 8640, normalOrders: 155, normalRevenue: 13950,
      viewsByAge: { '18-24': 9800, '25-34': 8100, '35-44': 2400, '45-54': 800, '55+': 200 },
      viewsByGender: { Male: 9200, Female: 11400, Other: 700 },
    },
    {
      id: 'AD004', productName: 'Non-Stick Cookware Set', sellerName: 'Kitchen Craft Co.',
      budget: 8000, spent: 0, bidAmount: 6, startDate: '2026-09-18', endDate: '2026-10-18', status: 'Pending',
      targetAgeGroups: ['25-34', '35-44', '45-54'], targetGenders: ['Female'],
      targetLocations: ['Uttar Pradesh', 'Delhi'], targetDevices: ['Mobile Web'],
      targetPlacements: ['Category Page', 'Product Page'],
      targetInterests: ['Home & Kitchen'],
      impressions: 0, clicks: 0, adOrders: 0, adRevenue: 0, normalOrders: 210, normalRevenue: 84000,
      viewsByAge: { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 },
      viewsByGender: { Male: 0, Female: 0, Other: 0 },
    },
    {
      id: 'AD005', productName: 'Herbal Shampoo', sellerName: 'Herbal Roots',
      budget: 4000, spent: 4000, bidAmount: 5, startDate: '2026-06-01', endDate: '2026-06-30', status: 'Rejected',
      targetAgeGroups: ['18-24'], targetGenders: ['Female'],
      targetLocations: ['Tamil Nadu'], targetDevices: ['Mobile App'],
      targetPlacements: ['Home Feed'],
      targetInterests: ['Beauty & Personal Care'],
      impressions: 0, clicks: 0, adOrders: 0, adRevenue: 0, normalOrders: 88, normalRevenue: 17600,
      viewsByAge: { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 },
      viewsByGender: { Male: 0, Female: 0, Other: 0 },
    },
  ]);

  readonly campaigns = this._campaigns.asReadonly();

  readonly totalSpend = computed(() => this._campaigns().reduce((sum, c) => sum + c.spent, 0));
  readonly totalAdRevenue = computed(() => this._campaigns().reduce((sum, c) => sum + c.adRevenue, 0));
  readonly totalNormalRevenue = computed(() => this._campaigns().reduce((sum, c) => sum + c.normalRevenue, 0));
  readonly totalAdOrders = computed(() => this._campaigns().reduce((sum, c) => sum + c.adOrders, 0));
  readonly totalNormalOrders = computed(() => this._campaigns().reduce((sum, c) => sum + c.normalOrders, 0));
  readonly totalImpressions = computed(() => this._campaigns().reduce((sum, c) => sum + c.impressions, 0));
  readonly totalClicks = computed(() => this._campaigns().reduce((sum, c) => sum + c.clicks, 0));

  readonly averageCtr = computed(() => {
    const impressions = this.totalImpressions();
    return impressions ? Math.round((this.totalClicks() / impressions) * 10000) / 100 : 0;
  });

  readonly roas = computed(() => {
    const spend = this.totalSpend();
    return spend ? Math.round((this.totalAdRevenue() / spend) * 100) / 100 : 0;
  });

  readonly ageGroupTotals = computed<Record<AgeGroup, number>>(() => {
    const totals: Record<AgeGroup, number> = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    for (const campaign of this._campaigns()) {
      for (const group of this.ageGroups) {
        totals[group] += campaign.viewsByAge[group];
      }
    }
    return totals;
  });

  readonly genderTotals = computed<Record<Gender, number>>(() => {
    const totals: Record<Gender, number> = { Male: 0, Female: 0, Other: 0 };
    for (const campaign of this._campaigns()) {
      for (const gender of this.genders) {
        totals[gender] += campaign.viewsByGender[gender];
      }
    }
    return totals;
  });

  addCampaign(data: Omit<AdCampaign, 'id' | 'spent' | 'impressions' | 'clicks' | 'adOrders' | 'adRevenue' | 'normalOrders' | 'normalRevenue' | 'viewsByAge' | 'viewsByGender' | 'status'>): void {
    const record: AdCampaign = {
      ...data,
      id: `AD${campaignSeq++}`,
      status: 'Pending',
      spent: 0,
      impressions: 0,
      clicks: 0,
      adOrders: 0,
      adRevenue: 0,
      normalOrders: 0,
      normalRevenue: 0,
      viewsByAge: { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 },
      viewsByGender: { Male: 0, Female: 0, Other: 0 },
    };
    this._campaigns.update((list) => [record, ...list]);
  }

  updateCampaign(id: string, data: Partial<Pick<AdCampaign, 'productName' | 'budget' | 'bidAmount' | 'startDate' | 'endDate' | 'targetAgeGroups' | 'targetGenders' | 'targetLocations' | 'targetDevices' | 'targetPlacements' | 'targetInterests'>>): void {
    this._campaigns.update((list) => list.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }

  updateStatus(id: string, status: AdStatus): void {
    this._campaigns.update((list) => list.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  cloneCampaign(id: string): void {
    const source = this._campaigns().find((c) => c.id === id);
    if (!source) {
      return;
    }
    const clone: AdCampaign = {
      ...source,
      id: `AD${campaignSeq++}`,
      productName: `${source.productName} (Copy)`,
      status: 'Pending',
      spent: 0,
      impressions: 0,
      clicks: 0,
      adOrders: 0,
      adRevenue: 0,
      viewsByAge: { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 },
      viewsByGender: { Male: 0, Female: 0, Other: 0 },
    };
    this._campaigns.update((list) => [clone, ...list]);
  }

  deleteCampaign(id: string): void {
    this._campaigns.update((list) => list.filter((c) => c.id !== id));
  }

  ctrFor(campaign: AdCampaign): number {
    return campaign.impressions ? Math.round((campaign.clicks / campaign.impressions) * 10000) / 100 : 0;
  }

  conversionRateFor(campaign: AdCampaign): number {
    return campaign.clicks ? Math.round((campaign.adOrders / campaign.clicks) * 10000) / 100 : 0;
  }

  roasFor(campaign: AdCampaign): number {
    return campaign.spent ? Math.round((campaign.adRevenue / campaign.spent) * 100) / 100 : 0;
  }
}
