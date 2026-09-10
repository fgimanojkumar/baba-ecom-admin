import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThemeService } from '../../shared/theme.service';
import { SidebarService } from '../../shared/sidebar.service';
import { AuthService, UserRole } from '../../shared/auth.service';
import { CatalogService } from '../../shared/catalog.service';
import { SellerService } from '../../shared/seller.service';
import { TicketService } from '../../shared/ticket.service';
import { ProductService } from '../products/product.service';
import { UserService } from '../users/user.service';
import { MOCK_ORDERS } from '../orders/orders.data';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: UserRole[];
}

interface SearchResult {
  type: string;
  icon: string;
  label: string;
  sublabel: string;
  route: string;
}

@Component({
  selector: 'app-main',
  imports: [
    RouterOutlet,
    RouterLink,
    FormsModule
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  private readonly themeService = inject(ThemeService);
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);
  private readonly sellerService = inject(SellerService);
  private readonly ticketService = inject(TicketService);
  private readonly productService = inject(ProductService);
  private readonly userService = inject(UserService);

  readonly theme = this.themeService.theme;
  readonly sidebarExpanded = this.sidebarService.expanded;
  readonly currentUser = this.authService.currentUser;

  private readonly allNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/main/dashboard', icon: 'bi-speedometer2' },
    { label: 'Reports', route: '/main/reports', icon: 'bi-graph-up-arrow', roles: ['admin'] },
    { label: 'Audit Log', route: '/main/audit-log', icon: 'bi-journal-text', roles: ['admin'] },
    { label: 'Users', route: '/main/users', icon: 'bi-people', roles: ['admin'] },
    { label: 'Customers', route: '/main/customers', icon: 'bi-person-lines-fill', roles: ['admin'] },
    { label: 'Sellers', route: '/main/sellers', icon: 'bi-shop', roles: ['admin'] },
    { label: 'Orders', route: '/main/orders', icon: 'bi-box-seam' },
    { label: 'Category', route: '/main/category', icon: 'bi-flower1', roles: ['admin'] },
    { label: 'Sub Category', route: '/main/sub-category', icon: 'bi-flower2', roles: ['admin'] },
    { label: 'Products', route: '/main/products', icon: 'bi-boxes' },
    { label: 'Sliders', route: '/main/sliders', icon: 'bi-card-image', roles: ['admin'] },
    { label: 'Returns', route: '/main/returns', icon: 'bi-arrow-return-left' },
    { label: 'Wishlist', route: '/main/wishlist', icon: 'bi-heart', roles: ['admin'] },
    { label: 'Reviews', route: '/main/reviews', icon: 'bi-star-half' },
    { label: 'Payments', route: '/main/payments', icon: 'bi-wallet2' },
    { label: 'Ads & Promotions', route: '/main/ads', icon: 'bi-megaphone' },
    { label: 'Bank Details', route: '/main/bank-details', icon: 'bi-bank', roles: ['seller'] },
    { label: 'Offers', route: '/main/offers', icon: 'bi-gift', roles: ['admin'] },
    { label: 'Notifications', route: '/main/notifications', icon: 'bi-bell', roles: ['admin'] },
    { label: 'Support', route: '/main/support', icon: 'bi-headset' },
    { label: 'Contact Us', route: '/main/contact', icon: 'bi-chat-right-text', roles: ['admin'] },
    { label: 'Address', route: '/main/address', icon: 'bi-building-add', roles: ['admin'] },
    { label: 'State', route: '/main/state', icon: 'bi-map', roles: ['admin'] },
    { label: 'City', route: '/main/city', icon: 'bi-buildings', roles: ['admin'] },
    { label: 'Warehouses', route: '/main/warehouses', icon: 'bi-building', roles: ['admin'] },
    { label: 'Media Library', route: '/main/media-library', icon: 'bi-images', roles: ['admin'] },
    { label: 'Shipping', route: '/main/shipping', icon: 'bi-truck', roles: ['admin'] },
    { label: 'Roles & Permissions', route: '/main/roles', icon: 'bi-shield-lock', roles: ['admin'] },
    { label: 'Static Pages', route: '/main/static-pages', icon: 'bi-file-earmark-richtext', roles: ['admin'] },
    { label: 'Profile', route: '/main/profile', icon: 'bi-person-badge' },
    { label: 'Settings', route: '/main/setting', icon: 'bi-gear', roles: ['admin'] },
  ];

  readonly navItems = computed(() => {
    const role = this.authService.role();
    return this.allNavItems.filter((item) => !item.roles || (role && item.roles.includes(role)));
  });

  // --- Global search ---
  private readonly products = toSignal(this.productService.products$, { initialValue: [] });

  private readonly searchIndex = computed<SearchResult[]>(() => {
    const items: SearchResult[] = [];

    for (const product of this.products()) {
      items.push({ type: 'Product', icon: 'bi-box-seam', label: product.name(), sublabel: `SKU: ${product.sku()}`, route: '/main/products' });
    }
    for (const order of MOCK_ORDERS) {
      items.push({ type: 'Order', icon: 'bi-bag-check', label: order.id, sublabel: `${order.customerName} · ${order.status}`, route: '/main/orders' });
    }
    for (const seller of this.sellerService.sellers()) {
      items.push({ type: 'Seller', icon: 'bi-shop', label: seller.businessName, sublabel: seller.ownerName, route: '/main/sellers' });
    }
    for (const user of this.userService.users()) {
      items.push({ type: 'User', icon: 'bi-person', label: `${user.first_name} ${user.last_name}`, sublabel: user.email, route: '/main/users' });
    }
    for (const category of this.catalogService.categories()) {
      items.push({ type: 'Category', icon: 'bi-flower1', label: category.name, sublabel: `${category.productCount} products`, route: '/main/category' });
    }
    for (const ticket of this.ticketService.tickets()) {
      items.push({ type: 'Ticket', icon: 'bi-headset', label: ticket.subject, sublabel: `${ticket.customerName} · ${ticket.status}`, route: '/main/support' });
    }

    return items;
  });

  readonly searchTerm = signal('');
  readonly activeResultIndex = signal(-1);
  readonly mobileSearchOpen = signal(false);

  readonly searchResults = computed<SearchResult[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return [];
    }
    return this.searchIndex()
      .filter((item) => item.label.toLowerCase().includes(term) || item.sublabel.toLowerCase().includes(term))
      .slice(0, 8);
  });

  readonly showSearchDropdown = computed(() => this.searchTerm().trim().length > 0);

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.activeResultIndex.set(-1);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const results = this.searchResults();
    if (!results.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeResultIndex.set((this.activeResultIndex() + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeResultIndex.set((this.activeResultIndex() - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const index = this.activeResultIndex() >= 0 ? this.activeResultIndex() : 0;
      this.selectSearchResult(results[index]);
    } else if (event.key === 'Escape') {
      this.clearSearch();
    }
  }

  selectSearchResult(result: SearchResult): void {
    this.router.navigateByUrl(result.route);
    this.clearSearch();
    this.mobileSearchOpen.set(false);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.activeResultIndex.set(-1);
  }

  toggleMobileSearch(): void {
    this.mobileSearchOpen.update((v) => !v);
    if (!this.mobileSearchOpen()) {
      this.clearSearch();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  closeSidebar(): void {
    this.sidebarService.close();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
