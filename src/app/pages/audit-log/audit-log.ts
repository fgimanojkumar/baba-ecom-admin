import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditAction, AuditLogService, AuditModule } from '../../shared/audit-log.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-audit-log',
  imports: [CommonModule, FormsModule, PageInfo],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.scss',
})
export class AuditLog {
  private readonly auditLogService = inject(AuditLogService);

  readonly entries = this.auditLogService.entries;
  readonly searchTerm = signal('');
  readonly moduleFilter = signal('');
  readonly actionFilter = signal('');

  readonly modules: AuditModule[] = ['Sellers', 'Products', 'Orders', 'Category', 'Offers', 'Ads', 'Users', 'Settings', 'Auth'];
  readonly actions: AuditAction[] = ['Create', 'Update', 'Delete', 'Approve', 'Reject', 'Login', 'Status Change'];

  readonly filteredEntries = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const module = this.moduleFilter();
    const action = this.actionFilter();

    return this.entries().filter((entry) => {
      if (module && entry.module !== module) {
        return false;
      }
      if (action && entry.action !== action) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        entry.actor.toLowerCase().includes(term) ||
        entry.description.toLowerCase().includes(term)
      );
    });
  });
}
