import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OfferDiscountType, OfferRecord, OfferService, OfferStatus } from '../../shared/offer.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-offers',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo],
  templateUrl: './offers.html',
  styleUrl: './offers.scss',
})
export class Offers {
  private readonly fb = inject(FormBuilder);
  private readonly offerService = inject(OfferService);

  readonly offers = this.offerService.offers;
  readonly searchTerm = signal('');
  readonly editingId = signal<string | null>(null);

  readonly discountTypes: OfferDiscountType[] = ['Percentage', 'Fixed'];
  readonly statusOptions: OfferStatus[] = ['Active', 'Inactive', 'Expired'];

  readonly filteredOffers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.offers();
    }
    return this.offers().filter(
      (offer) => offer.code.toLowerCase().includes(term) || offer.description.toLowerCase().includes(term)
    );
  });

  readonly form = this.fb.group({
    code: ['', Validators.required],
    description: [''],
    discountType: ['Percentage' as OfferDiscountType, Validators.required],
    discountValue: [10, [Validators.required, Validators.min(0)]],
    minOrderValue: [0, [Validators.min(0)]],
    usageLimit: [100, [Validators.min(1)]],
    expiryDate: ['', Validators.required],
    status: ['Active' as OfferStatus, Validators.required],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ code: '', description: '', discountType: 'Percentage', discountValue: 10, minOrderValue: 0, usageLimit: 100, expiryDate: '', status: 'Active' });
  }

  openEdit(offer: OfferRecord): void {
    this.editingId.set(offer.id);
    this.form.reset({
      code: offer.code, description: offer.description, discountType: offer.discountType,
      discountValue: offer.discountValue, minOrderValue: offer.minOrderValue,
      usageLimit: offer.usageLimit, expiryDate: offer.expiryDate, status: offer.status,
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Omit<OfferRecord, 'id' | 'usedCount'>;
    const editingId = this.editingId();

    if (editingId) {
      this.offerService.updateOffer(editingId, value);
    } else {
      this.offerService.addOffer(value);
    }
  }

  deleteOffer(id: string): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.offerService.deleteOffer(id);
    }
  }
}
