import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactInquiry, ContactService, InquiryStatus } from '../../shared/contact.service';

type StatusFilter = 'all' | InquiryStatus;

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, PageInfo],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly contactService = inject(ContactService);

  readonly inquiries = this.contactService.inquiries;
  readonly activeStatus = signal<StatusFilter>('all');
  readonly searchTerm = signal('');
  readonly selectedInquiry = signal<ContactInquiry | null>(null);
  readonly replyText = signal('');

  readonly counts = computed(() => {
    const all = this.inquiries();
    return {
      all: all.length,
      new: all.filter((i) => i.status === 'New').length,
      replied: all.filter((i) => i.status === 'Replied').length,
      closed: all.filter((i) => i.status === 'Closed').length,
    };
  });

  readonly filteredInquiries = computed(() => {
    const status = this.activeStatus();
    const term = this.searchTerm().trim().toLowerCase();

    return this.inquiries().filter((inquiry) => {
      const matchesStatus = status === 'all' || inquiry.status === status;
      if (!matchesStatus) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        inquiry.name.toLowerCase().includes(term) ||
        inquiry.email.toLowerCase().includes(term) ||
        inquiry.subject.toLowerCase().includes(term)
      );
    });
  });

  setStatus(status: StatusFilter): void {
    this.activeStatus.set(status);
  }

  viewInquiry(inquiry: ContactInquiry): void {
    this.selectedInquiry.set(inquiry);
    this.replyText.set(inquiry.reply);
  }

  sendReply(): void {
    const inquiry = this.selectedInquiry();
    if (!inquiry || !this.replyText().trim()) {
      return;
    }
    this.contactService.reply(inquiry.id, this.replyText());
  }

  markClosed(id: string): void {
    this.contactService.updateStatus(id, 'Closed');
  }

  deleteInquiry(id: string): void {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      this.contactService.deleteInquiry(id);
    }
  }
}
