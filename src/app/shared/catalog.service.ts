import { Injectable, signal } from '@angular/core';

export type CatalogStatus = 'Active' | 'Inactive';

export interface CategoryRecord {
  id: string;
  name: string;
  description: string;
  status: CatalogStatus;
  productCount: number;
}

export interface SubCategoryRecord {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  status: CatalogStatus;
}

let categorySeq = 100;
let subCategorySeq = 100;

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly _categories = signal<CategoryRecord[]>([
    { id: 'CAT001', name: 'Electronics', description: 'Gadgets and devices', status: 'Active', productCount: 150 },
    { id: 'CAT002', name: 'Apparel', description: 'Clothing and fashion', status: 'Active', productCount: 320 },
    { id: 'CAT003', name: 'Home & Kitchen', description: 'Home essentials and kitchenware', status: 'Active', productCount: 96 },
    { id: 'CAT004', name: 'Beauty & Personal Care', description: 'Skincare, haircare and cosmetics', status: 'Active', productCount: 210 },
  ]);

  private readonly _subCategories = signal<SubCategoryRecord[]>([
    { id: 'SUB001', name: 'Smartphones', categoryId: 'CAT001', description: 'Mobile phones and accessories', status: 'Active' },
    { id: 'SUB002', name: 'Laptops', categoryId: 'CAT001', description: 'Laptops and notebooks', status: 'Active' },
    { id: 'SUB003', name: 'T-Shirts', categoryId: 'CAT002', description: 'Casual and formal t-shirts', status: 'Inactive' },
    { id: 'SUB004', name: 'Herbal Face Wash', categoryId: 'CAT004', description: 'Natural cleansing face washes', status: 'Active' },
  ]);

  readonly categories = this._categories.asReadonly();
  readonly subCategories = this._subCategories.asReadonly();

  categoryName(categoryId: string): string {
    return this._categories().find((cat) => cat.id === categoryId)?.name ?? 'Unknown';
  }

  addCategory(data: Omit<CategoryRecord, 'id' | 'productCount'>): void {
    const record: CategoryRecord = { ...data, id: `CAT${categorySeq++}`, productCount: 0 };
    this._categories.update((list) => [record, ...list]);
  }

  updateCategory(id: string, data: Omit<CategoryRecord, 'id' | 'productCount'>): void {
    this._categories.update((list) => list.map((cat) => (cat.id === id ? { ...cat, ...data } : cat)));
  }

  deleteCategory(id: string): void {
    this._categories.update((list) => list.filter((cat) => cat.id !== id));
    this._subCategories.update((list) => list.filter((sub) => sub.categoryId !== id));
  }

  addSubCategory(data: Omit<SubCategoryRecord, 'id'>): void {
    const record: SubCategoryRecord = { ...data, id: `SUB${subCategorySeq++}` };
    this._subCategories.update((list) => [record, ...list]);
  }

  updateSubCategory(id: string, data: Omit<SubCategoryRecord, 'id'>): void {
    this._subCategories.update((list) => list.map((sub) => (sub.id === id ? { ...sub, ...data } : sub)));
  }

  deleteSubCategory(id: string): void {
    this._subCategories.update((list) => list.filter((sub) => sub.id !== id));
  }
}
