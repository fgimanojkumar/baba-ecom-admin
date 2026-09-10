import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketPriority, TicketRecord, TicketService, TicketStatus } from '../../shared/ticket.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-support',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo],
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export class Support {
  private readonly fb = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);

  readonly tickets = this.ticketService.tickets;
  readonly searchTerm = signal('');
  readonly statusFilter = signal('');
  readonly editingId = signal<string | null>(null);
  readonly selectedIds = signal<Set<string>>(new Set());

  readonly statusOptions: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
  readonly priorityOptions: TicketPriority[] = ['Low', 'Medium', 'High'];

  readonly filteredTickets = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.tickets().filter((ticket) => {
      const matchesStatus = !status || ticket.status === status;
      if (!matchesStatus) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        ticket.subject.toLowerCase().includes(term) ||
        ticket.customerName.toLowerCase().includes(term) ||
        ticket.assignedTo.toLowerCase().includes(term)
      );
    });
  });

  readonly openCount = computed(() => this.tickets().filter((t) => t.status === 'Open').length);
  readonly inProgressCount = computed(() => this.tickets().filter((t) => t.status === 'In Progress').length);
  readonly resolvedCount = computed(() => this.tickets().filter((t) => t.status === 'Resolved' || t.status === 'Closed').length);

  readonly form = this.fb.group({
    subject: ['', Validators.required],
    customerName: ['', Validators.required],
    priority: ['Medium' as TicketPriority, Validators.required],
    status: ['Open' as TicketStatus, Validators.required],
    assignedTo: ['Unassigned'],
    createdDate: [new Date().toISOString().slice(0, 10)],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ subject: '', customerName: '', priority: 'Medium', status: 'Open', assignedTo: 'Unassigned', createdDate: new Date().toISOString().slice(0, 10) });
  }

  openEdit(ticket: TicketRecord): void {
    this.editingId.set(ticket.id);
    this.form.reset({ ...ticket });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Omit<TicketRecord, 'id'>;
    const editingId = this.editingId();

    if (editingId) {
      this.ticketService.updateTicket(editingId, value);
    } else {
      this.ticketService.addTicket(value);
    }
  }

  deleteTicket(id: string): void {
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.ticketService.deleteTicket(id);
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
    const list = this.filteredTickets();
    const allSelected = list.length > 0 && list.every((t) => this.isSelected(t.id));
    this.selectedIds.set(allSelected ? new Set() : new Set(list.map((t) => t.id)));
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  bulkClose(): void {
    for (const ticket of this.tickets()) {
      if (this.isSelected(ticket.id)) {
        this.ticketService.updateTicket(ticket.id, { ...ticket, status: 'Closed' });
      }
    }
    this.clearSelection();
  }

  bulkDelete(): void {
    if (!confirm(`Delete ${this.selectedIds().size} selected ticket(s)?`)) {
      return;
    }
    for (const id of this.selectedIds()) {
      this.ticketService.deleteTicket(id);
    }
    this.clearSelection();
  }
}
