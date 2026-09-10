import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityRecord, LocationService } from '../../shared/location.service';

import { Pagination } from '../../shared/lib/pagination/pagination';
import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-city',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo, Pagination],
  templateUrl: './city.html',
  styleUrl: './city.scss',
})
export class City {
  private readonly fb = inject(FormBuilder);
  private readonly locationService = inject(LocationService);

  readonly states = this.locationService.states;
  readonly cities = this.locationService.cities;
  readonly searchTerm = signal('');
  readonly stateFilter = signal('');
  readonly editingId = signal<string | null>(null);

  readonly filteredCities = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const stateId = this.stateFilter();

    return this.cities().filter((city) => {
      const matchesState = !stateId || city.stateId === stateId;
      if (!matchesState) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        city.name.toLowerCase().includes(term) ||
        city.pincode.toLowerCase().includes(term) ||
        city.status.toLowerCase().includes(term) ||
        this.stateName(city.stateId).toLowerCase().includes(term)
      );
    });
  });

  readonly form = this.fb.group({
    stateId: ['', Validators.required],
    name: ['', Validators.required],
    pincode: [''],
    status: ['Active' as 'Active' | 'Inactive', Validators.required],
  });

  stateName(stateId: string): string {
    return this.locationService.stateName(stateId);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ stateId: '', name: '', pincode: '', status: 'Active' });
  }

  openEdit(city: CityRecord): void {
    this.editingId.set(city.id);
    this.form.reset({ stateId: city.stateId, name: city.name, pincode: city.pincode, status: city.status });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as {
      stateId: string;
      name: string;
      pincode: string;
      status: 'Active' | 'Inactive';
    };
    const editingId = this.editingId();

    if (editingId) {
      this.locationService.updateCity(editingId, value);
    } else {
      this.locationService.addCity(value);
    }
  }

  deleteCity(id: string): void {
    this.locationService.deleteCity(id);
  }
}
