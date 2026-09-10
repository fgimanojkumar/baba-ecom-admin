import { Injectable, signal } from '@angular/core';

export type UserRoleType = 'CUSTOMER' | 'ADMIN' | 'MANAGER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

export interface UserRecord {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  state: string;
  role: UserRoleType;
  status: UserStatus;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  referral_code: string;
  referred_by: string;
  reward_points: number;
  language: string;
  joinedDate: string;
}

let userSeq = 100;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _users = signal<UserRecord[]>([
    { id: 'USR001', first_name: 'Jon', last_name: 'Oliver', username: 'jon.oliver', email: 'jon@example.com', phone: '9876543210', password: '', date_of_birth: '1992-04-12', gender: 'MALE', state: 'Maharashtra', role: 'MANAGER', status: 'ACTIVE', email_verified: true, phone_verified: true, two_factor_enabled: false, referral_code: 'JON123', referred_by: '', reward_points: 240, language: 'en', joinedDate: '2026-04-22' },
    { id: 'USR002', first_name: 'Ananya', last_name: 'Gupta', username: 'ananya.g', email: 'ananya.gupta@example.com', phone: '9988776655', password: '', date_of_birth: '1998-11-02', gender: 'FEMALE', state: 'Delhi', role: 'CUSTOMER', status: 'ACTIVE', email_verified: true, phone_verified: false, two_factor_enabled: false, referral_code: 'ANA556', referred_by: 'JON123', reward_points: 80, language: 'en', joinedDate: '2026-05-10' },
    { id: 'USR003', first_name: 'Rohit', last_name: 'Kumar', username: 'rohit.k', email: 'rohit.kumar@example.com', phone: '9123456789', password: '', date_of_birth: '1995-01-18', gender: 'MALE', state: 'Karnataka', role: 'CUSTOMER', status: 'PENDING', email_verified: false, phone_verified: false, two_factor_enabled: false, referral_code: 'ROH789', referred_by: '', reward_points: 0, language: 'en', joinedDate: '2026-08-30' },
    { id: 'USR004', first_name: 'Fatima', last_name: 'Sheikh', username: 'fatima.s', email: 'fatima.sheikh@example.com', phone: '9090909090', password: '', date_of_birth: '1990-07-25', gender: 'FEMALE', state: 'Gujarat', role: 'ADMIN', status: 'SUSPENDED', email_verified: true, phone_verified: true, two_factor_enabled: true, referral_code: 'FAT321', referred_by: '', reward_points: 500, language: 'en', joinedDate: '2025-11-05' },
  ]);

  readonly users = this._users.asReadonly();

  addUser(data: Omit<UserRecord, 'id' | 'joinedDate'>): void {
    const record: UserRecord = { ...data, id: `USR${userSeq++}`, joinedDate: new Date().toISOString().slice(0, 10) };
    this._users.update((list) => [record, ...list]);
  }

  updateUser(id: string, data: Omit<UserRecord, 'id' | 'joinedDate'>): void {
    this._users.update((list) => list.map((user) => (user.id === id ? { ...user, ...data } : user)));
  }

  deleteUser(id: string): void {
    this._users.update((list) => list.filter((user) => user.id !== id));
  }
}
