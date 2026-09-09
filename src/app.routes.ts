import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: 'main',
        loadComponent: () => import('./pages/main/main').then(c => c.Main),
        loadChildren: () => import('./pages/main/main.routes').then(m => m.MAIN_ROUTES)
    },

    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then(c => c.Login),
    },

    {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register').then(c => c.Register),
    },

    {
        path: 'forgot-password',
        loadComponent: () =>
            import('./pages/auth/forgot-password/forgot-password').then(c => c.ForgotPassword)
    },

    {
        path: 'not-found',
        loadComponent: () => import('./pages/not-found/not-found').then(c => c.NotFound),
    },

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: '**',
        redirectTo: 'not-found'
    }

];
