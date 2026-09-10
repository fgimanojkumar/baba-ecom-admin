import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaService } from '../../shared/media.service';

import { PageInfo } from '../../shared/lib/page-info/page-info';

@Component({
  selector: 'app-media-library',
  imports: [CommonModule, FormsModule, PageInfo],
  templateUrl: './media-library.html',
  styleUrl: './media-library.scss',
})
export class MediaLibrary {
  private readonly mediaService = inject(MediaService);

  readonly items = this.mediaService.items;
  readonly searchTerm = signal('');

  readonly filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.items();
    }
    return this.items().filter((item) => item.name.toLowerCase().includes(term) || item.usedIn.toLowerCase().includes(term));
  });

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        this.mediaService.addItem({ name: file.name, url: reader.result as string, usedIn: 'Unused' });
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  deleteItem(id: string): void {
    if (confirm('Are you sure you want to delete this media file?')) {
      this.mediaService.deleteItem(id);
    }
  }
}
