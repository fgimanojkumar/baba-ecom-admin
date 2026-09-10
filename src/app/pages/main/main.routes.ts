import { Routes } from '@angular/router';
import { roleGuard } from '../../shared/auth.guard';

export const MAIN_ROUTES: Routes = [

   {
        path: 'dashboard',
        loadComponent: () =>
            import('../dashboard/dashboard').then(c => c.Dashboard)
    },
    {
        path: 'users',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../users/users').then(c => c.Users)
    },
    {
        path: 'customers',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../customers/customers').then(c => c.Customers)
    },
    {
        path: 'sellers',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../sellers/sellers').then(c => c.Sellers)
    },
    {
        path: 'profile',
        loadComponent: () =>
            import('../profile/profile').then(c => c.Profile)
    },
    {
        path: 'orders',
        loadComponent: () =>
            import('../orders/orders').then(c => c.Orders)
    },
    {
        path: 'category',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../category/category').then(c => c.Category)
    },
    {
        path: 'sub-category',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../sub-category/sub-category').then(c => c.SubCategory)
    },
    {
        path: 'setting',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../setting/setting').then(c => c.Setting)
    },
    {
        path: 'products',
        loadComponent: () =>
            import('../products/products').then(c => c.Products)
    },
    {
        path: 'sliders',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../sliders/sliders').then(c => c.Sliders)
    },
    {
        path: 'returns',
        loadComponent: () =>
            import('../returns/returns').then(c => c.Returns)
    },
    {
        path: 'offers',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../offers/offers').then(c => c.Offers)
    },
    {
        path: 'reviews',
        loadComponent: () =>
            import('../reviews/reviews').then(c => c.Reviews)
    },
    {
        path: 'payments',
        loadComponent: () =>
            import('../payments/payments').then(c => c.Payments)
    },
    {
        path: 'ads',
        loadComponent: () =>
            import('../ads/ads').then(c => c.Ads)
    },
    {
        path: 'bank-details',
        canActivate: [roleGuard(['seller'])],
        loadComponent: () =>
            import('../bank-details/bank-details').then(c => c.BankDetailsPage)
    },
    {
        path: 'notifications',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../notifications/notifications').then(c => c.Notifications)
    },
    {
        path: 'support',
        loadComponent: () =>
            import('../support/support').then(c => c.Support)
    },
    {
        path: 'reports',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../reports/reports').then(c => c.Reports)
    },
    {
        path: 'audit-log',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../audit-log/audit-log').then(c => c.AuditLog)
    },
    {
        path: 'wishlist',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../wishlist/wishlist').then(c => c.Wishlist)
    },
    {
        path: 'contact',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../contact/contact').then(c => c.Contact)
    },
    {
        path: 'address',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../address/address').then(c => c.AddressComponent)
    },
    {
        path: 'state',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../state/state').then(c => c.State)
    },
    {
        path: 'city',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../city/city').then(c => c.City)
    },
    {
        path: 'roles',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../roles/roles').then(c => c.Roles)
    },
    {
        path: 'static-pages',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../static-pages/static-pages').then(c => c.StaticPages)
    },
    {
        path: 'shipping',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../shipping/shipping').then(c => c.Shipping)
    },
    {
        path: 'warehouses',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../warehouses/warehouses').then(c => c.Warehouses)
    },
    {
        path: 'media-library',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
            import('../media-library/media-library').then(c => c.MediaLibrary)
    },
 
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },

    {
        path: '**',
        redirectTo: 'dashboard'
    }

];