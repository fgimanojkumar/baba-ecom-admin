import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StaticPageRecord, StaticPageService, StaticPageStatus } from '../../shared/static-page.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-static-pages',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo],
  templateUrl: './static-pages.html',
  styleUrl: './static-pages.scss',
})
export class StaticPages {
  private readonly fb = inject(FormBuilder);
  private readonly staticPageService = inject(StaticPageService);

  readonly pages = this.staticPageService.pages;
  readonly searchTerm = signal('');
  readonly editingId = signal<string | null>(null);

  readonly filteredPages = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.pages();
    }
    return this.pages().filter((p) => p.title.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term));
  });

  readonly form = this.fb.group({
    title: ['', Validators.required],
    slug: ['', Validators.required],
    content: ['', Validators.required],
    status: ['Draft' as StaticPageStatus, Validators.required],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ title: '', slug: '', content: '', status: 'Draft' });
  }

  openEdit(page: StaticPageRecord): void {
    this.editingId.set(page.id);
    this.form.reset({ title: page.title, slug: page.slug, content: page.content, status: page.status });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Omit<StaticPageRecord, 'id' | 'updatedDate'>;
    const editingId = this.editingId();

    if (editingId) {
      this.staticPageService.updatePage(editingId, value);
    } else {
      this.staticPageService.addPage(value);
    }
  }

  deletePage(id: string): void {
    if (confirm('Are you sure you want to delete this page?')) {
      this.staticPageService.deletePage(id);
    }
  }
}
