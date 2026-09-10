import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationService, StateRecord } from '../../shared/location.service';

import { Pagination } from '../../shared/lib/pagination/pagination';
import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-state',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo, Pagination],
  templateUrl: './state.html',
  styleUrl: './state.scss',
})
export class State {
  private readonly fb = inject(FormBuilder);
  private readonly locationService = inject(LocationService);

  readonly states = this.locationService.states;
  readonly searchTerm = signal('');
  readonly editingId = signal<string | null>(null);

  readonly filteredStates = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.states();
    }
    return this.states().filter(
      (state) =>
        state.name.toLowerCase().includes(term) ||
        state.code.toLowerCase().includes(term) ||
        state.status.toLowerCase().includes(term)
    );
  });

  readonly form = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    status: ['Active' as 'Active' | 'Inactive', Validators.required],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', code: '', status: 'Active' });
  }

  openEdit(state: StateRecord): void {
    this.editingId.set(state.id);
    this.form.reset({ name: state.name, code: state.code, status: state.status });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as { name: string; code: string; status: 'Active' | 'Inactive' };
    const editingId = this.editingId();

    if (editingId) {
      this.locationService.updateState(editingId, value);
    } else {
      this.locationService.addState(value);
    }
  }

  deleteState(id: string): void {
    this.locationService.deleteState(id);
  }
}
