import { Injectable, computed, signal } from '@angular/core';

export type UserRole = 'admin' | 'seller';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

const STORAGE_KEY = 'adminHMD.currentUser';

// Demo credentials used by the mock authentication flow
const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  'admin@babaecom.com': {
    password: 'admin123',
    user: { name: 'Manoj Kumar', email: 'admin@babaecom.com', role: 'admin' },
  },
  'seller@babaecom.com': {
    password: 'seller123',
    user: { name: 'Rahul Traders', email: 'seller@babaecom.com', role: 'seller' },
  },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<AuthUser | null>(this.getSavedUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly role = computed(() => this._currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  login(email: string, password: string): AuthUser | null {
    const account = DEMO_ACCOUNTS[email.trim().toLowerCase()];
    if (!account || account.password !== password) {
      return null;
    }
    this._currentUser.set(account.user);
    this.saveUser(account.user);
    return account.user;
  }

  logout(): void {
    this._currentUser.set(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable — ignore
    }
  }

  private getSavedUser(): AuthUser | null {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private saveUser(user: AuthUser): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // storage unavailable — ignore
    }
  }
}
