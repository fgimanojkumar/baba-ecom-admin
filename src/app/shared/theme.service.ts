import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'adminHMD.colorTheme';
  readonly theme = signal<Theme>(this.getPreferredTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  toggleTheme(): void {
    this.applyTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private getPreferredTheme(): Theme {
    const saved = this.readStorage();
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    this.writeStorage(theme);
    this.theme.set(theme);
  }

  private readStorage(): string | null {
    try {
      return window.localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }

  private writeStorage(theme: Theme): void {
    try {
      window.localStorage.setItem(this.storageKey, theme);
    } catch {
      // storage unavailable (e.g. private browsing) — ignore
    }
  }
}
