import { Component, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define the structure of an address
export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  type: 'Home' | 'Work' | 'Other';
}

@Component({
  selector: 'app-address',
  standalone: true, // Mark as standalone
  imports: [CommonModule, FormsModule], // Import necessary modules
  templateUrl: './address.html',
  styleUrls: ['./address.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Use OnPush change detection
})
export class AddressComponent {
  // Signal to hold the list of addresses
  addresses: WritableSignal<Address[]> = signal([
    { id: 1, street: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345', type: 'Home' },
    { id: 2, street: '456 Oak Ave', city: 'Someville', state: 'TX', zip: '67890', type: 'Work' },
  ]);

  // Signal to manage the address being added or edited
  selectedAddress: WritableSignal<Address | null> = signal(null);

  // Signal to toggle the form visibility
  showForm: WritableSignal<boolean> = signal(false);

  // Method to initiate adding a new address
  onAdd() {
    this.selectedAddress.set({ id: Date.now(), street: '', city: '', state: '', zip: '', type: 'Home' });
    this.showForm.set(true);
  }

  // Method to select an address for editing
  onEdit(address: Address) {
    // Create a copy to avoid direct mutation of the signal's internal state
    this.selectedAddress.set({ ...address });
    this.showForm.set(true);
  }

  // Method to delete an address
  onDelete(addressToDelete: Address) {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addresses.update(list => list.filter(addr => addr.id !== addressToDelete.id));
    }
  }

  // Method to save a new or updated address
  onSave() {
    const addressToSave = this.selectedAddress();
    if (!addressToSave) return;

    // Check if it's a new address (by checking if the id exists in the current list)
    const exists = this.addresses().some(addr => addr.id === addressToSave.id);

    if (exists) {
      // Update existing address
      this.addresses.update(list =>
        list.map(addr => (addr.id === addressToSave.id ? addressToSave : addr))
      );
    } else {
      // Add new address
      this.addresses.update(list => [...list, addressToSave]);
    }

    this.onCancel();
  }

  // Method to cancel the add/edit operation
  onCancel() {
    this.selectedAddress.set(null);
    this.showForm.set(false);
  }
}
