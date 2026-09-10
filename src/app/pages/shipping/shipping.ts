import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../shared/location.service';

interface CourierPartner {
  name: string;
  avgDeliveryDays: string;
  codAvailable: boolean;
  status: 'Active' | 'Inactive';
}

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-shipping',
  imports: [CommonModule, FormsModule, PageInfo],
  templateUrl: './shipping.html',
  styleUrl: './shipping.scss',
})
export class Shipping {
  private readonly locationService = inject(LocationService);

  readonly couriers: CourierPartner[] = [
    { name: 'BlueDart Express', avgDeliveryDays: '2-4 days', codAvailable: true, status: 'Active' },
    { name: 'Delhivery', avgDeliveryDays: '3-5 days', codAvailable: true, status: 'Active' },
    { name: 'Ekart Logistics', avgDeliveryDays: '2-5 days', codAvailable: true, status: 'Active' },
    { name: 'DTDC', avgDeliveryDays: '4-6 days', codAvailable: false, status: 'Inactive' },
  ];

  readonly pincodeInput = signal('');
  readonly checkedResult = signal<{ pincode: string; found: boolean; city?: string; state?: string } | null>(null);

  checkServiceability(): void {
    const pincode = this.pincodeInput().trim();
    if (!pincode) {
      return;
    }

    const city = this.locationService.cities().find((c) => c.pincode === pincode);
    if (city) {
      this.checkedResult.set({ pincode, found: true, city: city.name, state: this.locationService.stateName(city.stateId) });
    } else {
      this.checkedResult.set({ pincode, found: false });
    }
  }
}
