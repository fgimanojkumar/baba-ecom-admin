import { Injectable, signal } from '@angular/core';

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  gstNumber: string;
  address: string;
  defaultShippingCharge: number;
  freeShippingThreshold: number;
  maintenanceMode: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  twoFactorRequired: boolean;
  sessionTimeoutMinutes: number;
  passwordExpiryDays: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _settings = signal<StoreSettings>({
    storeName: 'Baba Ecom',
    supportEmail: 'support@babaecom.com',
    supportPhone: '1800-123-4567',
    currency: 'INR',
    gstNumber: '27AAAAA0000A1Z5',
    address: '221B, Business Park, Mumbai, Maharashtra, India',
    defaultShippingCharge: 49,
    freeShippingThreshold: 499,
    maintenanceMode: false,
    emailAlerts: true,
    smsAlerts: false,
    twoFactorRequired: false,
    sessionTimeoutMinutes: 30,
    passwordExpiryDays: 90,
  });

  readonly settings = this._settings.asReadonly();

  updateSettings(data: StoreSettings): void {
    this._settings.set(data);
  }
}
