import { Injectable, signal } from '@angular/core';
import { Product } from './product.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Dummy data, in a real app this would come from an API
  private initialProductData = {
    "id": "PRD001",
    "sku": "AMC-FW-001",
    "barcode": "8901234567890",
    "name": "Multani Mitti Face Wash",
    "slug": "multani-mitti-face-wash",
    "shortDescription": "Natural multani mitti face wash for oily and acne-prone skin.",
    "description": "This face wash is made with Multani Mitti, Aloe Vera, Neem Extract and Rose Water. It deeply cleanses pores, removes excess oil and gives a fresh glowing skin.",
    "brand": { "id": "BR001", "name": "AmritCube" },
    "manufacturer": "AmritCube Pvt Ltd",
    "category": { "id": "CAT001", "name": "Face Wash" },
    "subCategory": { "id": "SUB001", "name": "Herbal Face Wash" },
    "collections": [ "Best Seller", "New Arrival", "Organic" ],
    "tags": [ "Face Wash", "Natural", "Multani Mitti", "Organic", "Skin Care" ],
    "gender": "Unisex",
    "ageGroup": "18+",
    "skinType": [ "Oily", "Combination", "Normal" ],
    "images": [ { "id": 1, "url": "assets/images/ecommerce/product-1.jpg", "alt": "Front View", "isPrimary": true }, { "id": 2, "url": "https://example.com/images/back.jpg", "alt": "Back View", "isPrimary": false } ],
    "videos": [ { "url": "https://example.com/video.mp4", "thumbnail": "https://example.com/video-thumb.jpg" } ],
    "price": { "mrp": 299, "sellingPrice": 249, "costPrice": 150, "currency": "INR", "discount": { "type": "percentage", "value": 17 }, "tax": { "gst": 18 } },
    "inventory": { "trackInventory": true, "stock": 500, "minStock": 20, "maxOrderQuantity": 10, "allowBackorder": false },
    "variants": [ { "id": "VAR001", "size": "100ml", "color": null, "sku": "AMC-FW-100", "price": 249, "stock": 200 }, { "id": "VAR002", "size": "200ml", "color": null, "sku": "AMC-FW-200", "price": 449, "stock": 300 } ],
    "specifications": { "Form": "Gel", "Fragrance": "Rose", "ShelfLife": "24 Months", "CountryOfOrigin": "India", "NetQuantity": "100 ml", "Organic": true },
    "ingredients": [ "Multani Mitti", "Aloe Vera", "Neem Extract", "Rose Water", "Vitamin E" ],
    "benefits": [ "Removes Oil", "Deep Cleansing", "Acne Control", "Glowing Skin" ],
    "howToUse": [ "Wet your face.", "Take small amount.", "Massage gently.", "Rinse with water." ],
    "warnings": [ "For external use only.", "Avoid contact with eyes.", "Keep away from children." ],
    "shipping": { "weight": 0.18, "length": 15, "width": 6, "height": 4, "freeShipping": true, "shippingCharge": 0 },
    "returnPolicy": { "returnable": true, "returnDays": 7 },
    "warranty": { "available": false, "duration": null },
    "seo": { "title": "Multani Mitti Face Wash | AmritCube", "description": "Buy Natural Multani Mitti Face Wash for healthy glowing skin.", "keywords": [ "Multani Mitti Face Wash", "Natural Face Wash", "Organic Face Wash" ] },
    "rating": { "average": 4.7, "totalReviews": 356, "totalRatings": 482 },
    "sales": { "sold": 1580, "wishlistCount": 420, "viewCount": 28500 },
    "offers": [ { "title": "Buy 2 Get 10% Off", "code": "SAVE10" } ],
    "status": "ACTIVE",
    "createdAt": "2026-07-05T10:00:00Z",
    "updatedAt": "2026-07-05T10:00:00Z"
  };

  private readonly _products = new BehaviorSubject<Product[]>([new Product(this.initialProductData)]);
  readonly products$ = this._products.asObservable();

  getProducts(): Product[] {
    return this._products.getValue();
  }

  addProduct(productData: any) {
    const newProduct = new Product({
      ...productData,
      id: `PRD${Date.now()}`, // Simple unique ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const currentProducts = this.getProducts();
    this._products.next([...currentProducts, newProduct]);
  }

  updateProduct(productId: string, productData: any) {
    const currentProducts = this.getProducts();
    const productIndex = currentProducts.findIndex(p => p.id() === productId);
    if (productIndex > -1) {
      const productToUpdate = currentProducts[productIndex];
      
      // Update all signals on the existing product instance
      for (const key in productData) {
        if (Object.prototype.hasOwnProperty.call(productToUpdate, key) && typeof (productToUpdate as any)[key]?.set === 'function') {
          (productToUpdate as any)[key].set(productData[key]);
        }
      }
      productToUpdate.updatedAt.set(new Date().toISOString());

      // Emit the updated array
      this._products.next([...currentProducts]);
    }
  }

  deleteProduct(productId: string) {
    const currentProducts = this.getProducts();
    const updatedProducts = currentProducts.filter(p => p.id() !== productId);
    this._products.next(updatedProducts);
  }

  // Helper to convert comma-separated strings from form to arrays
  processFormValue(formValue: any): any {
    const stringToArray = (str: string) => str.split(',').map(item => item.trim()).filter(Boolean);

    return {
      ...formValue,
      collections: stringToArray(formValue.collections),
      tags: stringToArray(formValue.tags),
      skinType: stringToArray(formValue.skinType),
      ingredients: stringToArray(formValue.ingredients),
      benefits: stringToArray(formValue.benefits),
      howToUse: stringToArray(formValue.howToUse),
      warnings: stringToArray(formValue.warnings),
      seo: {
        ...formValue.seo,
        keywords: stringToArray(formValue.seo.keywords)
      },
    };
  }
}