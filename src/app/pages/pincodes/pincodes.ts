import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityRecord, LocationService } from '../../shared/location.service';
import { Pagination } from '../../shared/lib/pagination/pagination';
import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-pincodes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Pagination, PageInfo],
  templateUrl: './pincodes.html',
  styleUrl: './pincodes.scss',
})
export class Pincodes {
  private readonly formBuilder = inject(FormBuilder);
  private readonly locationService = inject(LocationService);

  readonly cities = this.locationService.cities;
  readonly states = this.locationService.states;
  readonly searchTerm = signal('');
  readonly stateFilter = signal('');
  readonly editingId = signal<string | null>(null);

  readonly filteredPincodes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const stateId = this.stateFilter();
    return this.cities().filter((city) => {
      const matchesState = !stateId || city.stateId === stateId;
      const matchesTerm = !term || city.pincode.includes(term) || city.name.toLowerCase().includes(term) || this.stateName(city.stateId).toLowerCase().includes(term);
      return matchesState && matchesTerm;
    });
  });

  readonly activePincodes = computed(() => this.cities().filter((city) => city.status === 'Active').length);
  readonly inactivePincodes = computed(() => this.cities().filter((city) => city.status === 'Inactive').length);

  readonly form = this.formBuilder.group({
    stateId: ['', Validators.required],
    name: ['', Validators.required],
    pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    status: ['Active' as 'Active' | 'Inactive', Validators.required],
    deliveryMessage: ['Delivery is temporarily unavailable in this pincode.'],
  });

  stateName(stateId: string): string {
    return this.locationService.stateName(stateId);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ stateId: '', name: '', pincode: '', status: 'Active', deliveryMessage: 'Delivery is temporarily unavailable in this pincode.' });
  }

  openEdit(city: CityRecord): void {
    this.editingId.set(city.id);
    this.form.reset({ stateId: city.stateId, name: city.name, pincode: city.pincode, status: city.status, deliveryMessage: city.deliveryMessage ?? 'Delivery is temporarily unavailable in this pincode.' });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue() as Omit<CityRecord, 'id'>;
    const editingId = this.editingId();
    if (editingId) {
      this.locationService.updateCity(editingId, value);
    } else {
      this.locationService.addCity(value);
    }
  }

  toggleDelivery(city: CityRecord): void {
    this.locationService.updateCity(city.id, { ...city, status: city.status === 'Active' ? 'Inactive' : 'Active' });
  }

  deletePincode(id: string): void {
    this.locationService.deleteCity(id);
  }
}