import { Product, ProductStatus } from '../types';
import { ProductModel } from '../models/Product';
import { generateId } from '../utils/idGenerator';
import { validateProductName, validateProductNames } from '../utils/validation';
import { getProductDescriptions } from './geminiService';

export class ProductService {
  static createProduct(name: string): Product {
    if (!validateProductName(name)) {
      throw new Error('Tên sản phẩm không hợp lệ');
    }

    return {
      id: generateId(),
      name: name.trim(),
      description: '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static createProductsFromNames(names: string[]): Product[] {
    const validNames = validateProductNames(names);
    return validNames.map(name => this.createProduct(name));
  }

  static updateProductStatus(
    products: Product[],
    productId: string,
    status: ProductStatus
  ): Product[] {
    return products.map(p =>
      p.id === productId
        ? { ...p, status, updatedAt: new Date() }
        : p
    );
  }

  static updateProductDescription(
    products: Product[],
    productId: string,
    description: string
  ): Product[] {
    return products.map(p =>
      p.id === productId
        ? { ...p, description, status: 'completed' as ProductStatus, updatedAt: new Date() }
        : p
    );
  }

  static markProductsAsProcessing(
    products: Product[],
    productIds: string[]
  ): Product[] {
    return products.map(p =>
      productIds.includes(p.id)
        ? { ...p, status: 'processing' as ProductStatus, updatedAt: new Date() }
        : p
    );
  }

  static markProductsAsError(
    products: Product[],
    productIds: string[]
  ): Product[] {
    return products.map(p =>
      productIds.includes(p.id)
        ? { ...p, status: 'error' as ProductStatus, updatedAt: new Date() }
        : p
    );
  }

  static normalizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  static async processBatch(
    products: Product[],
    batch: Product[],
    onProgress?: (updatedProducts: Product[]) => void
  ): Promise<Product[]> {
    const batchNames = batch.map(p => p.name);
    let updatedProducts = [...products];

    try {
      const results = await getProductDescriptions(batchNames);
      
      console.log('AI Results:', results.map(r => r.name));
      console.log('Batch Names:', batchNames);

      batch.forEach((item, index) => {
        const idx = updatedProducts.findIndex(p => p.id === item.id);
        if (idx === -1) return;

        // Try to match by name first (normalized)
        let aiResult = results.find(r => {
          const normalizedAiName = this.normalizeName(r.name);
          const normalizedItemName = this.normalizeName(item.name);
          return normalizedAiName === normalizedItemName;
        });

        // Fallback: match by index if count matches and no name match found
        if (!aiResult && results.length === batch.length) {
          aiResult = results[index];
          console.warn(`Using index-based matching for "${item.name}" -> "${aiResult.name}"`);
        }

        if (aiResult) {
          updatedProducts[idx] = {
            ...updatedProducts[idx],
            description: aiResult.description,
            status: 'completed',
            updatedAt: new Date(),
          };
        } else {
          console.error(`No match found for product: "${item.name}"`);
          updatedProducts[idx] = {
            ...updatedProducts[idx],
            status: 'error',
            updatedAt: new Date(),
          };
        }
      });

      if (onProgress) {
        onProgress(updatedProducts);
      }

      return updatedProducts;
    } catch (error) {
      console.error('Error processing batch:', error);
      batch.forEach(item => {
        const idx = updatedProducts.findIndex(p => p.id === item.id);
        if (idx !== -1) {
          updatedProducts[idx] = {
            ...updatedProducts[idx],
            status: 'error',
            updatedAt: new Date(),
          };
        }
      });

      if (onProgress) {
        onProgress(updatedProducts);
      }

      throw error;
    }
  }

  static getPendingProducts(products: Product[]): Product[] {
    return products.filter(p => p.status === 'pending' || p.status === 'error');
  }

  static getCompletedProducts(products: Product[]): Product[] {
    return products.filter(p => p.status === 'completed');
  }

  static removeProduct(products: Product[], productId: string): Product[] {
    return products.filter(p => p.id !== productId);
  }

  static clearAll(products: Product[]): Product[] {
    return [];
  }
}
