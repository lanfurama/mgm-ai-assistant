import { productApi } from '../api/productApi';
import { Product, ProductDTO, ProductStatus } from '../types';
import { validateProductName, validateProductNames } from '../utils/validation';

const mapDTOToProduct = (dto: ProductDTO): Product => {
  return {
    id: dto.id || '',
    name: dto.name,
    description: dto.description || '',
    status: dto.status || 'pending',
    createdAt: dto.created_at ? new Date(dto.created_at) : new Date(),
    updatedAt: dto.updated_at ? new Date(dto.updated_at) : new Date(),
  };
};

export class ProductApiService {
  static async getAll(): Promise<Product[]> {
    const response = await productApi.getAll();
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch products');
    }
    return response.data.map(mapDTOToProduct);
  }

  static async getById(id: string): Promise<Product> {
    const response = await productApi.getById(id);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch product');
    }
    return mapDTOToProduct(response.data);
  }

  static async create(name: string, source: string = 'manual'): Promise<Product> {
    if (!validateProductName(name)) {
      throw new Error('Tên sản phẩm không hợp lệ');
    }

    const response = await productApi.create({
      name: name.trim(),
      description: '',
      status: 'pending',
      source,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create product');
    }

    return mapDTOToProduct(response.data);
  }

  static async batchCreate(names: string[], source: string = 'excel'): Promise<Product[]> {
    const validNames = validateProductNames(names);
    
    if (validNames.length === 0) {
      return [];
    }

    const products = validNames.map(name => ({
      name: name.trim(),
      description: '',
      status: 'pending' as ProductStatus,
      source,
    }));

    const response = await productApi.batchCreate(products);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create products');
    }

    return response.data.map(mapDTOToProduct);
  }

  static async update(id: string, updates: Partial<Product>): Promise<Product> {
    const dto: any = {};
    
    if (updates.name !== undefined) dto.name = updates.name;
    if (updates.description !== undefined) dto.description = updates.description;
    if (updates.status !== undefined) dto.status = updates.status;

    const response = await productApi.update(id, dto);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update product');
    }

    return mapDTOToProduct(response.data);
  }

  static async delete(id: string): Promise<void> {
    const response = await productApi.delete(id);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete product');
    }
  }

  static async updateStatus(id: string, status: ProductStatus): Promise<Product> {
    return this.update(id, { status });
  }

  static async updateDescription(id: string, description: string): Promise<Product> {
    return this.update(id, { description, status: 'completed' });
  }
}
