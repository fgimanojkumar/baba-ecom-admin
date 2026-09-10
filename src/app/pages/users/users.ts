import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { UserRecord, UserService } from './user.service';

import { Pagination } from '../../shared/lib/pagination/pagination';
import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PageInfo, Pagination],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  userForm: FormGroup;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  readonly users = this.userService.users;
  readonly searchTerm = signal('');
  readonly editingId = signal<string | null>(null);

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.users();
    }
    return this.users().filter(
      (user) =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.status.toLowerCase().includes(term)
    );
  });

  readonly totalUsers = computed(() => this.users().length);
  readonly activeUsers = computed(() => this.users().filter((u) => u.status === 'ACTIVE').length);
  readonly pendingUsers = computed(() => this.users().filter((u) => u.status === 'PENDING').length);
  readonly suspendedUsers = computed(() => this.users().filter((u) => u.status === 'SUSPENDED').length);

  constructor() {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: [''],
      date_of_birth: [''],
      gender: ['MALE'],
      state: [''],
      role: ['CUSTOMER', Validators.required],
      status: ['ACTIVE'],
      email_verified: [false],
      phone_verified: [false],
      two_factor_enabled: [false],
      referral_code: [''],
      referred_by: [''],
      reward_points: [0],
      language: ['en'],
    });
  }

  openAdd(): void {
    this.editingId.set(null);
    this.userForm.reset({
      first_name: '', last_name: '', username: '', email: '', phone: '', password: '',
      date_of_birth: '', gender: 'MALE', state: '', role: 'CUSTOMER', status: 'ACTIVE',
      email_verified: false, phone_verified: false, two_factor_enabled: false,
      referral_code: '', referred_by: '', reward_points: 0, language: 'en',
    });
  }

  openEdit(user: UserRecord): void {
    this.editingId.set(user.id);
    this.userForm.reset({ ...user });
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const value = this.userForm.getRawValue();
    const editingId = this.editingId();

    if (editingId) {
      this.userService.updateUser(editingId, value);
    } else {
      this.userService.addUser(value);
    }
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id);
    }
  }
}
