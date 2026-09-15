import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogService, SubCategoryRecord } from '../../shared/catalog.service';

import { Pagination } from '../../shared/lib/pagination/pagination';
import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-sub-category',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo, Pagination],
  templateUrl: './sub-category.html',
  styleUrl: './sub-category.scss',
})
export class SubCategory {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogService);

  readonly categories = this.catalog.categories;
  readonly subCategories = this.catalog.subCategories;
  readonly searchTerm = signal('');
  readonly editingId = signal<string | null>(null);

  readonly filteredSubCategories = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.subCategories();
    }
    return this.subCategories().filter(
      (sub) => sub.name.toLowerCase().includes(term) || sub.description.toLowerCase().includes(term)
    );
  });

  readonly form = this.fb.group({
    categoryId: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    status: ['Active' as 'Active' | 'Inactive', Validators.required],
  });

  categoryName(categoryId: string): string {
    return this.catalog.categoryName(categoryId);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ categoryId: '', name: '', description: '', status: 'Active' });
  }

  openEdit(sub: SubCategoryRecord): void {
    this.editingId.set(sub.id);
    this.form.reset({ categoryId: sub.categoryId, name: sub.name, description: sub.description, status: sub.status });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as {
      categoryId: string;
      name: string;
      description: string;
      status: 'Active' | 'Inactive';
    };
    const editingId = this.editingId();

    if (editingId) {
      this.catalog.updateSubCategory(editingId, value);
    } else {
      this.catalog.addSubCategory(value);
    }
  }

  deleteSubCategory(id: string): void {
    this.catalog.deleteSubCategory(id);
  }
}
