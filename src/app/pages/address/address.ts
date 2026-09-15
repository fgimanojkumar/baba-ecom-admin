import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageInfo } from '../../shared/lib/page-info/page-info';

export type AddressType = 'Home' | 'Work' | 'Other';

export interface Address {
  id: number;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  type: AddressType;
  isDefault: boolean;
}

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo],
  templateUrl: './address.html',
  styleUrl: './address.scss',
})
export class AddressComponent {
  private readonly fb = inject(FormBuilder);

  readonly addresses = signal<Address[]>([
    { id: 1, name: 'Manoj Kumar', phone: '9876543210', street: '123, ABC Street', city: 'New Delhi', state: 'Delhi', zip: '110001', type: 'Home', isDefault: true },
    { id: 2, name: 'Priya Sharma', phone: '9812345670', street: '45, MG Road', city: 'Bengaluru', state: 'Karnataka', zip: '560001', type: 'Work', isDefault: false },
    { id: 3, name: 'Rahul Traders (Warehouse)', phone: '9876500000', street: 'Plot 7, Industrial Area', city: 'Mumbai', state: 'Maharashtra', zip: '400001', type: 'Other', isDefault: false },
  ]);

  readonly searchTerm = signal('');
  readonly editingId = signal<number | null>(null);

  readonly typeOptions: AddressType[] = ['Home', 'Work', 'Other'];

  readonly filteredAddresses = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.addresses();
    }
    return this.addresses().filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.city.toLowerCase().includes(term) ||
        a.state.toLowerCase().includes(term) ||
        a.zip.includes(term)
    );
  });

  readonly form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zip: ['', Validators.required],
    type: ['Home' as AddressType, Validators.required],
    isDefault: [false],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', phone: '', street: '', city: '', state: '', zip: '', type: 'Home', isDefault: false });
  }

  openEdit(address: Address): void {
    this.editingId.set(address.id);
    this.form.reset({ ...address });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Omit<Address, 'id'>;
    const editingId = this.editingId();

    if (editingId) {
      this.addresses.update((list) => list.map((a) => (a.id === editingId ? { ...a, ...value } : a)));
    } else {
      this.addresses.update((list) => [{ ...value, id: Date.now() }, ...list]);
    }
  }

  makeDefault(id: number): void {
    this.addresses.update((list) => list.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  deleteAddress(id: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addresses.update((list) => list.filter((a) => a.id !== id));
    }
  }
}
