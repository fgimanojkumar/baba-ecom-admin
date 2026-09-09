import { signal, WritableSignal } from '@angular/core';

export interface Brand {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface Image {
  id: number;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Video {
  url: string;
  thumbnail: string;
}

export interface Discount {
  type: string;
  value: number;
}

export interface Tax {
  gst: number;
}

export interface Price {
  mrp: number;
  sellingPrice: number;
  costPrice: number;
  currency: string;
  discount: Discount;
  tax: Tax;
}

export interface Inventory {
  trackInventory: boolean;
  stock: number;
  minStock: number;
  maxOrderQuantity: number;
  allowBackorder: boolean;
}

export interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  sku: string;
  price: number;
  stock: number;
}

export interface Specifications {
  [key: string]: any;
}

export interface Shipping {
  weight: number;
  length: number;
  width: number;
  height: number;
  freeShipping: boolean;
  shippingCharge: number;
}

export interface ReturnPolicy {
  returnable: boolean;
  returnDays: number;
}

export interface Warranty {
  available: boolean;
  duration: number | null;
}

export interface Seo {
  title: string;
  description: string;
  keywords: string[];
}

export interface Rating {
  average: number;
  totalReviews: number;
  totalRatings: number;
}

export interface Sales {
  sold: number;
  wishlistCount: number;
  viewCount: number;
}

export interface Offer {
  title: string;
  code: string;
}

export class Product {
  id: WritableSignal<string>;
  sku: WritableSignal<string>;
  barcode: WritableSignal<string>;
  name: WritableSignal<string>;
  slug: WritableSignal<string>;
  shortDescription: WritableSignal<string>;
  description: WritableSignal<string>;
  brand: WritableSignal<Brand>;
  manufacturer: WritableSignal<string>;
  category: WritableSignal<Category>;
  subCategory: WritableSignal<SubCategory>;
  collections: WritableSignal<string[]>;
  tags: WritableSignal<string[]>;
  gender: WritableSignal<string>;
  ageGroup: WritableSignal<string>;
  skinType: WritableSignal<string[]>;
  images: WritableSignal<Image[]>;
  videos: WritableSignal<Video[]>;
  price: WritableSignal<Price>;
  inventory: WritableSignal<Inventory>;
  variants: WritableSignal<Variant[]>;
  specifications: WritableSignal<Specifications>;
  ingredients: WritableSignal<string[]>;
  benefits: WritableSignal<string[]>;
  howToUse: WritableSignal<string[]>;
  warnings: WritableSignal<string[]>;
  shipping: WritableSignal<Shipping>;
  returnPolicy: WritableSignal<ReturnPolicy>;
  warranty: WritableSignal<Warranty>;
  seo: WritableSignal<Seo>;
  rating: WritableSignal<Rating>;
  sales: WritableSignal<Sales>;
  offers: WritableSignal<Offer[]>;
  status: WritableSignal<string>;
  featured: WritableSignal<boolean>;
  published: WritableSignal<boolean>;
  createdAt: WritableSignal<string>;
  updatedAt: WritableSignal<string>;

  constructor(productData: any) {
    this.id = signal(productData.id);
    this.sku = signal(productData.sku);
    this.barcode = signal(productData.barcode);
    this.name = signal(productData.name);
    this.slug = signal(productData.slug);
    this.shortDescription = signal(productData.shortDescription);
    this.description = signal(productData.description);
    this.brand = signal(productData.brand);
    this.manufacturer = signal(productData.manufacturer);
    this.category = signal(productData.category);
    this.subCategory = signal(productData.subCategory);
    this.collections = signal(productData.collections);
    this.tags = signal(productData.tags);
    this.gender = signal(productData.gender);
    this.ageGroup = signal(productData.ageGroup);
    this.skinType = signal(productData.skinType);
    this.images = signal(productData.images);
    this.videos = signal(productData.videos);
    this.price = signal(productData.price);
    this.inventory = signal(productData.inventory);
    this.variants = signal(productData.variants);
    this.specifications = signal(productData.specifications);
    this.ingredients = signal(productData.ingredients);
    this.benefits = signal(productData.benefits);
    this.howToUse = signal(productData.howToUse);
    this.warnings = signal(productData.warnings);
    this.shipping = signal(productData.shipping);
    this.returnPolicy = signal(productData.returnPolicy);
    this.warranty = signal(productData.warranty);
    this.seo = signal(productData.seo);
    this.rating = signal(productData.rating);
    this.sales = signal(productData.sales);
    this.offers = signal(productData.offers);
    this.status = signal(productData.status);
    this.featured = signal(productData.featured);
    this.published = signal(productData.published);
    this.createdAt = signal(productData.createdAt);
    this.updatedAt = signal(productData.updatedAt);
  }
}
