import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, PageInfo],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly fb = inject(FormBuilder);

  readonly avatarUrl = signal('../assets/images/avatar/avatar.jpg');
  readonly saved = signal(false);

  readonly form = this.fb.group({
    name: ['Admin Hasan', Validators.required],
    email: ['admin@example.com', [Validators.required, Validators.email]],
    department: ['Product Ops'],
    timezone: ['Asia/Dhaka'],
    bio: ['Focused on clean admin workflows, reusable UI systems, and reliable operations.'],
  });

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.avatarUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }
}
