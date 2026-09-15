import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageInfo } from '../../shared/lib/page-info/page-info';
import { ProductService } from '../products/product.service';

interface ListingDraft {
  name: string;
  category: string;
  brand: string;
  shortDescription: string;
  description: string;
  tags: string;
  benefits: string;
  seoTitle: string;
  seoDescription: string;
}

@Component({
  selector: 'app-auto-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, PageInfo],
  templateUrl: './auto-listing.html',
  styleUrl: './auto-listing.scss',
})
export class AutoListing {
  private readonly productService = inject(ProductService);

  readonly imagePreview = signal('');
  readonly imageName = signal('');
  readonly isGenerating = signal(false);
  readonly generated = signal(false);
  readonly saved = signal(false);
  readonly error = signal('');
  readonly draft = signal<ListingDraft>({ name: '', category: '', brand: '', shortDescription: '', description: '', tags: '', benefits: '', seoTitle: '', seoDescription: '' });

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.error.set('Please select a valid image file.'); return; }
    this.error.set('');
    this.imageName.set(file.name);
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  update(field: keyof ListingDraft, value: string): void { this.draft.update((current) => ({ ...current, [field]: value })); }

  generateListing(): void {
    this.error.set(''); this.saved.set(false); this.isGenerating.set(true);
    window.setTimeout(() => {
      const seed = this.draft().name.trim() || this.nameFromFile();
      const name = seed || 'Premium Everyday Product';
      const brand = this.draft().brand.trim() || 'Your Brand';
      const category = this.draft().category.trim() || this.categoryFromName(name);
      this.draft.set({
        name, category, brand,
        shortDescription: `Discover ${name} by ${brand}, made for reliable everyday use.`,
        description: `${name} is designed with quality materials and a thoughtful finish. It is easy to use, dependable, and suitable for customers looking for a practical ${category.toLowerCase()} option.`,
        tags: `${name}, ${category}, ${brand}, best seller, premium quality`,
        benefits: 'Premium quality, Easy to use, Reliable performance, Value for money',
        seoTitle: `${name} | ${brand}`,
        seoDescription: `Buy ${name} from ${brand}. Explore quality, features and value in this ${category.toLowerCase()} product.`,
      });
      this.generated.set(true); this.isGenerating.set(false);
    }, 650);
  }

  saveDraft(): void {
    const listing = this.draft();
    if (!listing.name.trim()) { this.error.set('Please enter a product name or generate the listing first.'); return; }
    this.productService.addProduct({
      sku: `AUTO-${Date.now().toString().slice(-6)}`, barcode: '', hsnCode: '', name: listing.name, slug: this.slugify(listing.name),
      shortDescription: listing.shortDescription, description: listing.description,
      brand: { id: '', name: listing.brand }, manufacturer: '', seller: { id: '', name: '' }, category: { id: '', name: listing.category }, subCategory: { id: '', name: '' },
      collections: ['AI Draft'], tags: this.toArray(listing.tags), gender: 'Unisex', ageGroup: 'All Ages', skinType: [],
      images: this.imagePreview() ? [{ id: Date.now(), url: this.imagePreview(), alt: listing.name, isPrimary: true }] : [], videos: [],
      price: { mrp: 0, sellingPrice: 0, costPrice: 0, currency: 'INR', discount: { type: 'percentage', value: 0 }, tax: { gst: 0, source: 'product', inclusive: true } },
      inventory: { trackInventory: true, stock: 0, minStock: 0, maxOrderQuantity: 10, allowBackorder: false }, variants: [], specifications: {}, ingredients: [], benefits: this.toArray(listing.benefits), howToUse: [], warnings: [],
      shipping: { weight: 0, length: 0, width: 0, height: 0, freeShipping: false, shippingCharge: 0 }, returnPolicy: { returnable: true, returnDays: 7 }, warranty: { available: false, duration: null },
      seo: { title: listing.seoTitle, description: listing.seoDescription, keywords: this.toArray(listing.tags) }, rating: { average: 0, totalReviews: 0, totalRatings: 0 }, sales: { sold: 0, wishlistCount: 0, viewCount: 0 }, offers: [], status: 'DRAFT', featured: false, published: false,
    });
    this.saved.set(true);
  }

  reset(): void {
    this.imagePreview.set(''); this.imageName.set(''); this.generated.set(false); this.saved.set(false); this.error.set('');
    this.draft.set({ name: '', category: '', brand: '', shortDescription: '', description: '', tags: '', benefits: '', seoTitle: '', seoDescription: '' });
  }

  private nameFromFile(): string { return this.imageName().replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
  private categoryFromName(name: string): string { const value = name.toLowerCase(); if (value.includes('shirt') || value.includes('dress')) return 'Apparel'; if (value.includes('phone') || value.includes('watch')) return 'Electronics'; if (value.includes('cream') || value.includes('face') || value.includes('soap')) return 'Beauty & Personal Care'; return 'General Merchandise'; }
  private slugify(value: string): string { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  private toArray(value: string): string[] { return value.split(',').map((item) => item.trim()).filter(Boolean); }
}