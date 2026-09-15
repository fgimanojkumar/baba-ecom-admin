import { Injectable, signal } from '@angular/core';

export type LocationStatus = 'Active' | 'Inactive';

export interface StateRecord {
  id: string;
  name: string;
  code: string;
  status: LocationStatus;
  deliveryMessage?: string;
}

export interface CityRecord {
  id: string;
  name: string;
  stateId: string;
  pincode: string;
  status: LocationStatus;
  deliveryMessage?: string;
}

let stateSeq = 100;
let citySeq = 100;

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly _states = signal<StateRecord[]>([
    { id: 'STA001', name: 'Maharashtra', code: 'MH', status: 'Active' },
    { id: 'STA002', name: 'Delhi', code: 'DL', status: 'Active' },
    { id: 'STA003', name: 'Karnataka', code: 'KA', status: 'Active' },
    { id: 'STA004', name: 'Gujarat', code: 'GJ', status: 'Active' },
  ]);

  private readonly _cities = signal<CityRecord[]>([
    { id: 'CIT001', name: 'Mumbai', stateId: 'STA001', pincode: '400001', status: 'Active' },
    { id: 'CIT002', name: 'Pune', stateId: 'STA001', pincode: '411001', status: 'Active' },
    { id: 'CIT003', name: 'New Delhi', stateId: 'STA002', pincode: '110001', status: 'Active' },
    { id: 'CIT004', name: 'Bengaluru', stateId: 'STA003', pincode: '560001', status: 'Active' },
  ]);

  private readonly cityByPincode = new Map<string, CityRecord>();
  private readonly serviceabilityCache = new Map<string, { found: boolean; serviceable: boolean; city?: string; state?: string; reason?: string }>();

  readonly states = this._states.asReadonly();
  readonly cities = this._cities.asReadonly();

  constructor() {
    this.rebuildPincodeIndex();
  }

  stateName(stateId: string): string {
    return this._states().find((state) => state.id === stateId)?.name ?? 'Unknown';
  }

  addState(data: Omit<StateRecord, 'id'>): void {
    const record: StateRecord = { ...data, id: `STA${stateSeq++}` };
    this._states.update((list) => [record, ...list]);
    this.serviceabilityCache.clear();
  }

  updateState(id: string, data: Omit<StateRecord, 'id'>): void {
    this._states.update((list) => list.map((state) => (state.id === id ? { ...state, ...data } : state)));
    this.serviceabilityCache.clear();
  }

  deleteState(id: string): void {
    this._states.update((list) => list.filter((state) => state.id !== id));
    this._cities.update((list) => list.filter((city) => city.stateId !== id));
    this.rebuildPincodeIndex();
  }

  addCity(data: Omit<CityRecord, 'id'>): void {
    const record: CityRecord = { ...data, id: `CIT${citySeq++}` };
    this._cities.update((list) => [record, ...list]);
    this.rebuildPincodeIndex();
  }

  updateCity(id: string, data: Omit<CityRecord, 'id'>): void {
    this._cities.update((list) => list.map((city) => (city.id === id ? { ...city, ...data } : city)));
    this.rebuildPincodeIndex();
  }

  deleteCity(id: string): void {
    this._cities.update((list) => list.filter((city) => city.id !== id));
    this.rebuildPincodeIndex();
  }

  checkServiceability(pincode: string): { found: boolean; serviceable: boolean; city?: string; state?: string; reason?: string } {
    const normalizedPincode = pincode.trim();
    const cached = this.serviceabilityCache.get(normalizedPincode);
    if (cached) {
      return cached;
    }
    const city = this.cityByPincode.get(normalizedPincode);
    if (!city) {
      const result = { found: false, serviceable: false, reason: 'Delivery is not available for this pincode yet.' };
      this.serviceabilityCache.set(normalizedPincode, result);
      return result;
    }
    const state = this._states().find((candidate) => candidate.id === city.stateId);
    const serviceable = city.status === 'Active' && state?.status === 'Active';
    const result = {
      found: true,
      serviceable,
      city: city.name,
      state: state?.name ?? 'Unknown',
      reason: serviceable ? undefined : city.deliveryMessage || state?.deliveryMessage || 'Delivery is temporarily unavailable in this area.',
    };
    this.serviceabilityCache.set(normalizedPincode, result);
    return result;
  }

  private rebuildPincodeIndex(): void {
    this.cityByPincode.clear();
    for (const city of this._cities()) {
      if (city.pincode) {
        this.cityByPincode.set(city.pincode, city);
      }
    }
    this.serviceabilityCache.clear();
  }
}
