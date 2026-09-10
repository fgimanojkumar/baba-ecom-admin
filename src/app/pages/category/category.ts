import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogService, CategoryRecord } from '../../shared/catalog.service';

import { Pagination } from '../../shared/lib/pagination/pagination';
import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-category',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo, Pagination],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class Category {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogService);

  readonly categories = this.catalog.categories;
  readonly searchTerm = signal('');
  readonly editingId = signal<string | null>(null);

  readonly filteredCategories = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.categories();
    }
    return this.categories().filter(
      (cat) => cat.name.toLowerCase().includes(term) || cat.description.toLowerCase().includes(term)
    );
  });

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    status: ['Active' as 'Active' | 'Inactive', Validators.required],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '', status: 'Active' });
  }

  openEdit(category: CategoryRecord): void {
    this.editingId.set(category.id);
    this.form.reset({ name: category.name, description: category.description, status: category.status });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as { name: string; description: string; status: 'Active' | 'Inactive' };
    const editingId = this.editingId();

    if (editingId) {
      this.catalog.updateCategory(editingId, value);
    } else {
      this.catalog.addCategory(value);
    }
  }

  deleteCategory(id: string): void {
    this.catalog.deleteCategory(id);
  }
}
