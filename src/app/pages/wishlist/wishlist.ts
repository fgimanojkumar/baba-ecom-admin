import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WishlistService } from '../../shared/wishlist.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, FormsModule, PageInfo],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist {
  private readonly wishlistService = inject(WishlistService);

  readonly entries = this.wishlistService.entries;
  readonly totalItems = this.wishlistService.totalItems;
  readonly mostWishlisted = this.wishlistService.mostWishlisted;
  readonly searchTerm = signal('');

  readonly filteredEntries = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.entries();
    }
    return this.entries().filter(
      (entry) =>
        entry.productName.toLowerCase().includes(term) ||
        entry.customerName.toLowerCase().includes(term) ||
        entry.customerEmail.toLowerCase().includes(term)
    );
  });

  removeEntry(id: string): void {
    this.wishlistService.removeEntry(id);
  }
}
