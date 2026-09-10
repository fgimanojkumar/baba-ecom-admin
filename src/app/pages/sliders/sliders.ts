import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

export interface SliderRecord {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  redirectionLink: string;
  image: string;
  for: 'Mobile' | 'Web';
  status: 'Active' | 'Inactive';
}

let sliderSeq = 100;

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-sliders',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo],
  templateUrl: './sliders.html',
  styleUrl: './sliders.scss',
})
export class Sliders {
  private readonly fb = inject(FormBuilder);

  private readonly sliders = signal<SliderRecord[]>([
    {
      id: 1,
      title: 'Summer Sale',
      description: 'Get up to 50% off on all summer items.',
      subtitle: 'Limited time offer',
      redirectionLink: 'https://example.com/summer-sale',
      image: '../../assets/images/loginBg.jpg',
      for: 'Mobile',
      status: 'Active',
    },
    {
      id: 2,
      title: 'Winter Collection',
      description: 'Explore our new winter collection.',
      subtitle: 'Stay warm and stylish',
      redirectionLink: 'https://example.com/winter-collection',
      image: '../../assets/images/loginBg.jpg',
      for: 'Web',
      status: 'Inactive',
    },
  ]);

  readonly searchTerm = signal('');
  readonly editingId = signal<number | null>(null);

  readonly filteredSliders = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.sliders();
    }
    return this.sliders().filter(
      (slider) => slider.title.toLowerCase().includes(term) || slider.subtitle.toLowerCase().includes(term)
    );
  });

  readonly form = this.fb.group({
    title: ['', Validators.required],
    subtitle: [''],
    image: ['', Validators.required],
    redirectionLink: [''],
    description: [''],
    for: ['Mobile' as 'Mobile' | 'Web', Validators.required],
    status: ['Active' as 'Active' | 'Inactive', Validators.required],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '', subtitle: '', image: '', redirectionLink: '', description: '', for: 'Mobile', status: 'Active',
    });
  }

  editSlider(slider: SliderRecord): void {
    this.editingId.set(slider.id);
    this.form.reset({
      title: slider.title,
      subtitle: slider.subtitle,
      image: slider.image,
      redirectionLink: slider.redirectionLink,
      description: slider.description,
      for: slider.for,
      status: slider.status,
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.form.patchValue({ image: reader.result as string });
    reader.readAsDataURL(file);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Omit<SliderRecord, 'id'>;
    const editingId = this.editingId();

    if (editingId) {
      this.sliders.update((list) => list.map((s) => (s.id === editingId ? { ...s, ...value } : s)));
    } else {
      this.sliders.update((list) => [{ ...value, id: sliderSeq++ }, ...list]);
    }
  }

  deleteSlider(id: number): void {
    this.sliders.update((list) => list.filter((slider) => slider.id !== id));
  }
}
