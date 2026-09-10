import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleRecord, RoleService } from '../../shared/role.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-roles',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class Roles {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);

  readonly roles = this.roleService.roles;
  readonly availablePermissions = this.roleService.availablePermissions;
  readonly searchTerm = signal('');
  readonly editingId = signal<string | null>(null);

  readonly filteredRoles = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.roles();
    }
    return this.roles().filter((r) => r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term));
  });

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    permissions: this.fb.control<string[]>([]),
  });

  togglePermission(permission: string, checked: boolean): void {
    const current = this.form.controls.permissions.value ?? [];
    this.form.controls.permissions.setValue(
      checked ? [...current, permission] : current.filter((p) => p !== permission)
    );
  }

  isPermissionChecked(permission: string): boolean {
    return (this.form.controls.permissions.value ?? []).includes(permission);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '', permissions: [] });
  }

  openEdit(role: RoleRecord): void {
    this.editingId.set(role.id);
    this.form.reset({ name: role.name, description: role.description, permissions: role.permissions });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Omit<RoleRecord, 'id' | 'usersCount'>;
    const editingId = this.editingId();

    if (editingId) {
      this.roleService.updateRole(editingId, value);
    } else {
      this.roleService.addRole(value);
    }
  }

  deleteRole(id: string): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.deleteRole(id);
    }
  }
}
