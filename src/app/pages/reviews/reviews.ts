import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, ReviewStatus } from '../../shared/review.service';
import { AuthService } from '../../shared/auth.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-reviews',
  imports: [CommonModule, FormsModule, PageInfo],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class Reviews {
  private readonly reviewService = inject(ReviewService);
  private readonly authService = inject(AuthService);

  readonly isAdmin = this.authService.isAdmin;
  readonly reviews = computed(() => {
    const user = this.authService.currentUser();
    if (!user || this.isAdmin()) {
      return this.reviewService.reviews();
    }
    return this.reviewService.reviews().filter((review) => review.sellerName === user.name);
  });
  readonly searchTerm = signal('');
  readonly statusFilter = signal('');
  readonly selectedIds = signal<Set<string>>(new Set());

  readonly statusOptions: ReviewStatus[] = ['Pending', 'Approved', 'Hidden'];
  readonly stars = [1, 2, 3, 4, 5];

  readonly filteredReviews = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.reviews().filter((review) => {
      const matchesStatus = !status || review.status === status;
      if (!matchesStatus) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        review.productName.toLowerCase().includes(term) ||
        review.customerName.toLowerCase().includes(term) ||
        review.comment.toLowerCase().includes(term)
      );
    });
  });

  readonly averageRating = computed(() => {
    const list = this.reviews();
    if (!list.length) {
      return 0;
    }
    return Math.round((list.reduce((sum, r) => sum + r.rating, 0) / list.length) * 10) / 10;
  });

  readonly pendingCount = computed(() => this.reviews().filter((r) => r.status === 'Pending').length);

  updateStatus(id: string, status: ReviewStatus): void {
    this.reviewService.updateStatus(id, status);
  }

  deleteReview(id: string): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelect(id: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleSelectAll(): void {
    const list = this.filteredReviews();
    const allSelected = list.length > 0 && list.every((r) => this.isSelected(r.id));
    this.selectedIds.set(allSelected ? new Set() : new Set(list.map((r) => r.id)));
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  bulkApprove(): void {
    for (const id of this.selectedIds()) {
      this.reviewService.updateStatus(id, 'Approved');
    }
    this.clearSelection();
  }

  bulkHide(): void {
    for (const id of this.selectedIds()) {
      this.reviewService.updateStatus(id, 'Hidden');
    }
    this.clearSelection();
  }

  bulkDelete(): void {
    if (!confirm(`Delete ${this.selectedIds().size} selected review(s)?`)) {
      return;
    }
    for (const id of this.selectedIds()) {
      this.reviewService.deleteReview(id);
    }
    this.clearSelection();
  }
}
