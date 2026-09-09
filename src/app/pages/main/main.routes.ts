import { Routes } from '@angular/router';

export const MAIN_ROUTES: Routes = [

   {
        path: 'dashboard',
        loadComponent: () =>
            import('../dashboard/dashboard').then(c => c.Dashboard)
    },
    {
        path: 'users',
        loadComponent: () =>
            import('../users/users').then(c => c.Users)
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
        loadComponent: () =>
            import('../category/category').then(c => c.Category)
    },
    {
        path: 'sub-category',
        loadComponent: () =>
            import('../sub-category/sub-category').then(c => c.SubCategory)
    },
    {
        path: 'setting',
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
        loadComponent: () =>
            import('../offers/offers').then(c => c.Offers)
    },
    {
        path: 'wishlist',
        loadComponent: () =>
            import('../wishlist/wishlist').then(c => c.Wishlist)
    },
    {
        path: 'contact',
        loadComponent: () =>
            import('../contact/contact').then(c => c.Contact)
    },
    {
        path: 'address',
        loadComponent: () =>
            import('../address/address').then(c => c.AddressComponent)
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