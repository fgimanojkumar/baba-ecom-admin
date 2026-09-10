import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService, StoreSettings } from '../../shared/settings.service';
import { CatalogService } from '../../shared/catalog.service';
import { LocationService } from '../../shared/location.service';
import { SellerService } from '../../shared/seller.service';
import { CustomerService } from '../../shared/customer.service';
import { PaymentService } from '../../shared/payment.service';
import { ReviewService } from '../../shared/review.service';
import { OfferService } from '../../shared/offer.service';
import { TicketService } from '../../shared/ticket.service';
import { MOCK_ORDERS } from '../orders/orders.data';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-setting',
  imports: [ReactiveFormsModule, PageInfo],
  templateUrl: './setting.html',
  styleUrl: './setting.scss',
})
export class Setting {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly catalogService = inject(CatalogService);
  private readonly locationService = inject(LocationService);
  private readonly sellerService = inject(SellerService);
  private readonly customerService = inject(CustomerService);
  private readonly paymentService = inject(PaymentService);
  private readonly reviewService = inject(ReviewService);
  private readonly offerService = inject(OfferService);
  private readonly ticketService = inject(TicketService);

  readonly savedMessage = signal(false);

  readonly form = this.fb.group({
    storeName: [this.settingsService.settings().storeName, Validators.required],
    supportEmail: [this.settingsService.settings().supportEmail, [Validators.required, Validators.email]],
    supportPhone: [this.settingsService.settings().supportPhone, Validators.required],
    currency: [this.settingsService.settings().currency, Validators.required],
    gstNumber: [this.settingsService.settings().gstNumber],
    address: [this.settingsService.settings().address],
    defaultShippingCharge: [this.settingsService.settings().defaultShippingCharge, [Validators.min(0)]],
    freeShippingThreshold: [this.settingsService.settings().freeShippingThreshold, [Validators.min(0)]],
    maintenanceMode: [this.settingsService.settings().maintenanceMode],
    emailAlerts: [this.settingsService.settings().emailAlerts],
    smsAlerts: [this.settingsService.settings().smsAlerts],
    twoFactorRequired: [this.settingsService.settings().twoFactorRequired],
    sessionTimeoutMinutes: [this.settingsService.settings().sessionTimeoutMinutes, [Validators.min(5)]],
    passwordExpiryDays: [this.settingsService.settings().passwordExpiryDays, [Validators.min(0)]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.settingsService.updateSettings(this.form.getRawValue() as StoreSettings);
    this.savedMessage.set(true);
    setTimeout(() => this.savedMessage.set(false), 2500);
  }

  exportAllData(): void {
    const backup = {
      exportedAt: new Date().toISOString(),
      settings: this.settingsService.settings(),
      categories: this.catalogService.categories(),
      subCategories: this.catalogService.subCategories(),
      states: this.locationService.states(),
      cities: this.locationService.cities(),
      sellers: this.sellerService.sellers(),
      customers: this.customerService.customers(),
      orders: MOCK_ORDERS,
      payments: this.paymentService.payments(),
      reviews: this.reviewService.reviews(),
      offers: this.offerService.offers(),
      tickets: this.ticketService.tickets(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `baba-ecom-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  resetDemoData(): void {
    if (confirm('This will reload the app and reset all data back to the seeded demo values. Continue?')) {
      window.location.reload();
    }
  }
}
