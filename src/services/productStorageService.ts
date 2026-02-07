import { Product, ProductStatus } from '../types';
import { generateId } from '../utils/idGenerator';
import { validateProductName, validateProductNames } from '../utils/validation';

const STORAGE_KEY = 'mgm-products';

interface StoredProduct {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

function toStored(p: Product): StoredProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    createdAt: (p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt || Date.now())).toISOString(),
    updatedAt: (p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt || Date.now())).toISOString(),
  };
}

function fromStored(p: StoredProduct): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

function getAllSync(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredProduct[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(fromStored);
  } catch {
    return [];
  }
}

export class ProductStorageService {
  static async getAll(): Promise<Product[]> {
    return getAllSync();
  }

  static saveAll(products: Product[]): void {
    const stored = products.map(toStored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  static async create(name: string, _source: string = 'manual'): Promise<Product> {
    if (!validateProductName(name)) {
      throw new Error('Tên sản phẩm không hợp lệ');
    }

    const product: Product = {
      id: generateId(),
      name: name.trim(),
      description: '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const all = getAllSync();
    all.push(product);
    this.saveAll(all);
    return product;
  }

  static async batchCreate(names: string[], _source: string = 'excel'): Promise<Product[]> {
    const validNames = validateProductNames(names);
    if (validNames.length === 0) return [];

    const products: Product[] = validNames.map(name => ({
      id: generateId(),
      name: name.trim(),
      description: '',
      status: 'pending' as ProductStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const all = getAllSync();
    all.push(...products);
    this.saveAll(all);
    return products;
  }

  static async update(id: string, updates: Partial<Product>): Promise<Product> {
    const all = getAllSync();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    const current = all[idx];
    const updated: Product = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: new Date(),
    };
    if (updates.description !== undefined) updated.status = 'completed';

    all[idx] = updated;
    this.saveAll(all);
    return updated;
  }

  static async delete(id: string): Promise<void> {
    const all = getAllSync().filter(p => p.id !== id);
    this.saveAll(all);
  }

  static async updateStatus(id: string, status: ProductStatus): Promise<Product> {
    return this.update(id, { status });
  }

  static async updateDescription(id: string, description: string): Promise<Product> {
    return this.update(id, { description, status: 'completed' });
  }

  static clear(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}
