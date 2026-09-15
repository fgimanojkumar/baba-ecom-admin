import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  router = inject(Router);
  fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  loginForm: FormGroup;
  readonly errorMessage = signal('');
  readonly demoAccounts = [
    { role: 'Super Admin', email: 'admin@babaecom.com', password: 'admin123' },
    { role: 'Seller', email: 'seller@babaecom.com', password: 'seller123' },
    { role: 'Support Staff', email: 'support@babaecom.com', password: 'support123' },
    { role: 'Catalog Manager', email: 'catalog@babaecom.com', password: 'catalog123' },
    { role: 'Finance Manager', email: 'finance@babaecom.com', password: 'finance123' },
  ];

  constructor() {
    this.loginForm = this.fb.group({
      email: ['admin@babaecom.com', [Validators.required, Validators.email]],
      password: ['admin123', Validators.required]
    });
  }

  loginNow() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    const user = this.auth.login(email, password);

    if (!user) {
      this.errorMessage.set('Invalid email or password. Try the demo credentials shown below.');
      return;
    }

    this.errorMessage.set('');
    this.router.navigateByUrl(user.role === 'admin' ? '/main/dashboard' : '/main/seller-dashboard');
  }

  useDemoAccount(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
    this.loginNow();
  }
}
