import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationAudience, NotificationChannel, NotificationRecord, NotificationService } from '../../shared/notification.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageInfo],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);

  readonly notifications = this.notificationService.notifications;
  readonly searchTerm = signal('');
  readonly editingId = signal<string | null>(null);

  readonly audienceOptions: NotificationAudience[] = ['All', 'Sellers', 'Customers'];
  readonly channelOptions: NotificationChannel[] = ['Email', 'SMS', 'Push'];

  readonly filteredNotifications = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.notifications();
    }
    return this.notifications().filter(
      (n) => n.title.toLowerCase().includes(term) || n.audience.toLowerCase().includes(term) || n.channel.toLowerCase().includes(term)
    );
  });

  readonly form = this.fb.group({
    title: ['', Validators.required],
    message: ['', Validators.required],
    audience: ['All' as NotificationAudience, Validators.required],
    channel: ['Email' as NotificationChannel, Validators.required],
    status: ['Draft' as 'Draft' | 'Scheduled' | 'Sent', Validators.required],
    date: [new Date().toISOString().slice(0, 10)],
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ title: '', message: '', audience: 'All', channel: 'Email', status: 'Draft', date: new Date().toISOString().slice(0, 10) });
  }

  openEdit(notification: NotificationRecord): void {
    this.editingId.set(notification.id);
    this.form.reset({ ...notification });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as Omit<NotificationRecord, 'id'>;
    const editingId = this.editingId();

    if (editingId) {
      this.notificationService.updateNotification(editingId, value);
    } else {
      this.notificationService.addNotification(value);
    }
  }

  markSent(id: string): void {
    this.notificationService.markSent(id);
  }

  deleteNotification(id: string): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notificationService.deleteNotification(id);
    }
  }
}
