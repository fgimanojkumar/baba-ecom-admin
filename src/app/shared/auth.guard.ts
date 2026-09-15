import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth.service';
import { RoleService } from './role.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.role();

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    if (role && role !== 'admin') {
      router.navigateByUrl('/main/seller-dashboard');
    } else {
      router.navigateByUrl('/main/dashboard');
    }
    return false;
  };
};

export const permissionGuard = (permission: string): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const roleService = inject(RoleService);
    const router = inject(Router);

    if (auth.isLoggedIn() && roleService.hasPermission(auth.currentUser()?.roleLabel, permission)) {
      return true;
    }

    router.navigateByUrl(auth.role() === 'admin' ? '/main/dashboard' : '/main/seller-dashboard');
    return false;
  };
};
