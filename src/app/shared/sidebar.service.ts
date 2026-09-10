import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly storageKey = 'adminHMD.sidebarMini';
  private readonly desktopMedia = '(min-width: 992px)';

  private readonly isMini = signal(false);
  private readonly isOpen = signal(false);

  readonly expanded = computed(() => (this.isDesktop() ? !this.isMini() : this.isOpen()));

  constructor() {
    this.isMini.set(this.isDesktop() && this.getSavedMiniState());
    this.applyBodyClasses();

    const mediaQuery = window.matchMedia(this.desktopMedia);
    const onBreakpointChange = () => this.handleBreakpointChange();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onBreakpointChange);
    } else {
      mediaQuery.addListener(onBreakpointChange);
    }
  }

  toggle(): void {
    if (this.isDesktop()) {
      this.isMini.update((value) => !value);
      this.saveMiniState(this.isMini());
    } else {
      this.isOpen.update((value) => !value);
    }

    this.applyBodyClasses();
  }

  close(): void {
    if (!this.isDesktop() && this.isOpen()) {
      this.isOpen.set(false);
      this.applyBodyClasses();
    }
  }

  private handleBreakpointChange(): void {
    if (this.isDesktop()) {
      this.isOpen.set(false);
      this.isMini.set(this.getSavedMiniState());
    } else {
      this.isMini.set(false);
    }

    this.applyBodyClasses();
  }

  private isDesktop(): boolean {
    return window.matchMedia?.(this.desktopMedia).matches ?? true;
  }

  private applyBodyClasses(): void {
    document.body.classList.toggle('sidebar-mini', this.isMini());
    document.body.classList.toggle('sidebar-open', this.isOpen());
  }

  private getSavedMiniState(): boolean {
    try {
      return window.localStorage.getItem(this.storageKey) === 'true';
    } catch {
      return false;
    }
  }

  private saveMiniState(isMini: boolean): void {
    try {
      window.localStorage.setItem(this.storageKey, String(isMini));
    } catch {
      // storage unavailable (e.g. private browsing) — ignore
    }
  }
}
