import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Product } from './product.model';
import { ProductService } from './product.service';
import { Loader } from '../../shared/lib/loader/loader';
import { Toggle } from '../../shared/lib/toggle/toggle';
import { Dropdown } from '../../shared/lib/dropdown/dropdown';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Dropdown, Loader, Toggle],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {

  productForm: FormGroup;
  isAddNewProduct = signal(false);
  isView = signal(true);
  isEditMode = signal(false);
  selectedProduct = signal<Product | null>(null);
  activeTab = signal('general');
  productStatus: any = ["Draft", "Active", "Inactive"]

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);

  products = toSignal(this.productService.products$, { initialValue: [] });

  constructor() {
    this.productForm = this.fb.group({});
    this.initForm();
  }

  initForm(product?: Product | null) {
    const rawProduct = product ? this.getRawProduct(product) : this.getDefaultProductData();

    this.productForm = this.fb.group({
      id: [rawProduct.id],
      barcode: [rawProduct.barcode],
      name: [rawProduct.name, Validators.required],
      slug: [rawProduct.slug],
      shortDescription: [rawProduct.shortDescription],
      description: [rawProduct.description],
      manufacturer: [rawProduct.manufacturer],
      status: [rawProduct.status],
      gender: [rawProduct.gender],
      ageGroup: [rawProduct.ageGroup],

      brand: this.fb.group({
        id: [rawProduct.brand.id],
        name: [rawProduct.brand.name, Validators.required]
      }),
      category: this.fb.group({
        id: [rawProduct.category.id],
        name: [rawProduct.category.name, Validators.required]
      }),
      subCategory: this.fb.group({
        id: [rawProduct.subCategory.id],
        name: [rawProduct.subCategory.name]
      }),

      skinType: [rawProduct.skinType.join(', ')],
      collections: [rawProduct.collections.join(', ')],
      tags: [rawProduct.tags.join(', ')],
      ingredients: [rawProduct.ingredients.join(', ')],
      benefits: [rawProduct.benefits.join(', ')],
      howToUse: [rawProduct.howToUse.join(', ')],
      warnings: [rawProduct.warnings.join(', ')],

      price: this.fb.group({
        mrp: [rawProduct.price.mrp, Validators.required],
        sellingPrice: [{ value: rawProduct.price.sellingPrice, disabled: true }],
        costPrice: [rawProduct.price.costPrice],
        currency: [rawProduct.price.currency],
        discount: this.fb.group({
          type: [rawProduct.price.discount.type],
          value: [rawProduct.price.discount.value]
        }),
        tax: this.fb.group({
          gst: [rawProduct.price.tax.gst]
        })
      }),
      inventory: this.fb.group({
        trackInventory: [rawProduct.inventory.trackInventory],
        stock: [rawProduct.inventory.stock, Validators.required],
        minStock: [rawProduct.inventory.minStock],
        maxOrderQuantity: [rawProduct.inventory.maxOrderQuantity],
        allowBackorder: [rawProduct.inventory.allowBackorder]
      }),
      shipping: this.fb.group({
        weight: [rawProduct.shipping.weight],
        length: [rawProduct.shipping.length],
        width: [rawProduct.shipping.width],
        height: [rawProduct.shipping.height],
        freeShipping: [rawProduct.shipping.freeShipping],
        shippingCharge: [rawProduct.shipping.shippingCharge]
      }),
      returnPolicy: this.fb.group({
        returnable: [rawProduct.returnPolicy.returnable],
        returnDays: [rawProduct.returnPolicy.returnDays]
      }),
      warranty: this.fb.group({
        available: [rawProduct.warranty.available],
        duration: [rawProduct.warranty.duration]
      }),
      seo: this.fb.group({
        title: [rawProduct.seo.title],
        description: [rawProduct.seo.description],
        keywords: [rawProduct.seo.keywords.join(', ')]
      }),
      rating: this.fb.group({
        average: [{ value: rawProduct.rating.average, disabled: true }],
        totalReviews: [{ value: rawProduct.rating.totalReviews, disabled: true }],
        totalRatings: [{ value: rawProduct.rating.totalRatings, disabled: true }]
      }),
      sales: this.fb.group({
        sold: [{ value: rawProduct.sales.sold, disabled: true }],
        wishlistCount: [{ value: rawProduct.sales.wishlistCount, disabled: true }],
        viewCount: [{ value: rawProduct.sales.viewCount, disabled: true }]
      }),
      variants: this.fb.array(rawProduct.variants.map((v: any) => this.newVariant(v))),
      images: this.fb.array(rawProduct.images.map((img: any) => this.newImage(img.url, null, img.isPrimary)))
    });

    this.productForm.get('price')?.valueChanges.subscribe(price => {
      if (price) {
        const mrp = price.mrp || 0;
        const discountValue = price.discount?.value || 0;
        const discountType = price.discount?.type || 'percentage';
        let sellingPrice = mrp;
        if (discountType === 'percentage') {
          sellingPrice = mrp - (mrp * discountValue / 100);
        } else if (discountType === 'fixed') {
          sellingPrice = mrp - discountValue;
        }
        this.productForm.get('price.sellingPrice')?.setValue(sellingPrice, { emitEvent: false });
      }
    });
  }


  skill(ev:any) {
    console.log(ev)
  }

  get variants() {
    return this.productForm.get('variants') as FormArray;
  }

  get images() {
    return this.productForm.get('images') as FormArray;
  }

  newVariant(variant: any = { id: '', size: '', color: null, sku: '', price: 0, stock: 0 }): FormGroup {
    return this.fb.group({
      id: [variant.id],
      size: [variant.size],
      color: [variant.color],
      sku: [variant.sku],
      price: [variant.price],
      stock: [variant.stock]
    });
  }

  addVariant() {
    this.variants.push(this.newVariant());
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }

  newImage(url: string, file: File | null, isPrimary = false): FormGroup {
    return this.fb.group({
      url: [url],
      // Keep the file object for actual upload logic later
      file: [file],
      isPrimary: [isPrimary]
    });
  }

  getDefaultProductData() {
    return {
      id: '', sku: '', barcode: '', name: '', slug: '', shortDescription: '',
      description: '', brand: { id: '', name: '' }, manufacturer: '',
      category: { id: '', name: '' }, subCategory: { id: '', name: '' },
      collections: [], tags: [], gender: 'Unisex', ageGroup: '18+', skinType: [],
      images: [], videos: [],
      price: { mrp: 0, sellingPrice: 0, costPrice: 0, currency: 'INR', discount: { type: 'percentage', value: 0 }, tax: { gst: 0 } },
      inventory: { trackInventory: true, stock: 0, minStock: 0, maxOrderQuantity: 10, allowBackorder: false },
      variants: [],
      specifications: {},
      ingredients: [], benefits: [], howToUse: [], warnings: [],
      shipping: { weight: 0, length: 0, width: 0, height: 0, freeShipping: false, shippingCharge: 0 },
      returnPolicy: { returnable: true, returnDays: 7 },
      warranty: { available: false, duration: null },
      seo: { title: '', description: '', keywords: [] },
      rating: { average: 0, totalReviews: 0, totalRatings: 0 },
      sales: { sold: 0, wishlistCount: 0, viewCount: 0 },
      offers: [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
  }

  openAdd() {
    this.isAddNewProduct.set(true);
    this.isView.set(false);
    this.isEditMode.set(false);
    this.selectedProduct.set(null);
    this.activeTab.set('active');
    this.initForm();
  }

  openEditModal(product: Product) {
    this.isEditMode.set(true);
    this.selectedProduct.set(product);
    this.activeTab.set('active');
    this.initForm(product);
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const rawValue = this.productForm.getRawValue();
    const processedValue = this.productService.processFormValue(rawValue);
    const selectedProd = this.selectedProduct();

    if (this.isEditMode() && selectedProd) {
      this.productService.updateProduct(selectedProd.id(), processedValue);
    } else {
      this.productService.addProduct(processedValue);
    }

    this.resetForm();
  }

  deleteProduct(productId: string) {
    // Ideally, show a confirmation dialog first
    this.productService.deleteProduct(productId);
  }

  resetForm() {
    this.isEditMode.set(false);
    this.selectedProduct.set(null);
    this.initForm();
  }

  getRawProduct(product: Product) {
    const rawProduct: any = {};
    for (const key in product) {
      if (Object.prototype.hasOwnProperty.call(product, key) && typeof (product as any)[key] === 'function') {
        rawProduct[key] = (product as any)[key]();
      }
    }
    return rawProduct;
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      // If no primary image exists, make the first new one primary
      const isFirstImagePrimary = this.images.length === 0;

      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const reader = new FileReader();
        reader.onload = () => {
          const isPrimary = isFirstImagePrimary && i === 0;
          this.images.push(this.newImage(reader.result as string, file, isPrimary));
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.images.removeAt(index);
    // If the removed image was primary, make the first one primary
    if (this.images.length > 0 && !this.images.value.some((img: any) => img.isPrimary)) {
      this.images.at(0).get('isPrimary')?.setValue(true);
    }
  }

  setPrimaryImage(selectedIndex: number): void {
    this.images.controls.forEach((control, index) => {
      control.get('isPrimary')?.setValue(index === selectedIndex);
    });
  }


cancelAllProduct() {
      this.isAddNewProduct.set(false);
    this.isView.set(true);
    this.isEditMode.set(false);
    this.selectedProduct.set(null);
    this.activeTab.set('active');
}


}
