import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { UserService } from './user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  users: any[] = []; // This would come from the service

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  constructor() {
    this.userForm = this.fb.group({
      id: [null],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: [''], // Required only for new users
      date_of_birth: [''],
      gender: ['MALE'],
      state: [''],
      role: ['CUSTOMER', Validators.required],
      status: ['ACTIVE'],
      email_verified: [false],
      phone_verified: [false],
      two_factor_enabled: [false],
      referral_code: [''],
      referred_by: [null],
      reward_points: [0],
      language: ['en'],
    });
  }

  ngOnInit(): void {
    // this.userService.users$.subscribe(users => this.users = users);
  }

  saveUser() {
    if (this.userForm.invalid) {
      return;
    }
    console.log(this.userForm.value);
  }
}
