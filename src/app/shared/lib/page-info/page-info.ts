import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';

declare const bootstrap: any;

@Component({
  selector: 'app-page-info',
  standalone: true,
  template: `
    <button type="button" class="page-info-btn" #infoBtn aria-label="Page information">
      <i class="bi bi-info-circle" aria-hidden="true"></i>
    </button>
  `,
  styleUrl: './page-info.scss',
})
export class PageInfo implements AfterViewInit, OnDestroy {
  @Input({ required: true }) text = '';
  @Input() heading = 'About this page';
  @ViewChild('infoBtn') infoBtn!: ElementRef<HTMLButtonElement>;

  private popover: any;
  private readonly documentClickHandler = (event: MouseEvent) => {
    const target = event.target as Node;
    const isInside = this.infoBtn?.nativeElement?.contains(target);

    if (!isInside && this.popover) {
      this.popover.hide();
    }
  };

  ngAfterViewInit(): void {
    if (typeof bootstrap === 'undefined') {
      return;
    }
    this.popover = new bootstrap.Popover(this.infoBtn.nativeElement, {
      title: this.heading,
      content: this.text,
      trigger: 'click',
      placement: 'bottom',
      html: false,
      container: 'body',
      customClass: 'page-info-popover',
    });

    document.addEventListener('click', this.documentClickHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.documentClickHandler);
    this.popover?.dispose();
  }
}
