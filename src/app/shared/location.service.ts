import { Injectable, signal } from '@angular/core';

export type LocationStatus = 'Active' | 'Inactive';

export interface StateRecord {
  id: string;
  name: string;
  code: string;
  status: LocationStatus;
}

export interface CityRecord {
  id: string;
  name: string;
  stateId: string;
  pincode: string;
  status: LocationStatus;
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

  readonly states = this._states.asReadonly();
  readonly cities = this._cities.asReadonly();

  stateName(stateId: string): string {
    return this._states().find((state) => state.id === stateId)?.name ?? 'Unknown';
  }

  addState(data: Omit<StateRecord, 'id'>): void {
    const record: StateRecord = { ...data, id: `STA${stateSeq++}` };
    this._states.update((list) => [record, ...list]);
  }

  updateState(id: string, data: Omit<StateRecord, 'id'>): void {
    this._states.update((list) => list.map((state) => (state.id === id ? { ...state, ...data } : state)));
  }

  deleteState(id: string): void {
    this._states.update((list) => list.filter((state) => state.id !== id));
    this._cities.update((list) => list.filter((city) => city.stateId !== id));
  }

  addCity(data: Omit<CityRecord, 'id'>): void {
    const record: CityRecord = { ...data, id: `CIT${citySeq++}` };
    this._cities.update((list) => [record, ...list]);
  }

  updateCity(id: string, data: Omit<CityRecord, 'id'>): void {
    this._cities.update((list) => list.map((city) => (city.id === id ? { ...city, ...data } : city)));
  }

  deleteCity(id: string): void {
    this._cities.update((list) => list.filter((city) => city.id !== id));
  }
}
