import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly _users = new BehaviorSubject<any[]>([]);
  readonly users$ = this._users.asObservable();
  private API_URL = 'your_api_endpoint_here'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) { }

  getUsers() {
    // this.http.get<any[]>(this.API_URL).subscribe(users => this._users.next(users));
  }

  // Add methods to fetch, add, update, and delete users
  addUser(user: any) {
    // return this.http.post(this.API_URL, user);
  }

  updateUser(user: any) {
    // return this.http.put(`${this.API_URL}/${user.id}`, user);
  }
}