import { Product, ProductDTO, ProductStatus } from '../types';

export class ProductModel {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Product>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromDTO(dto: ProductDTO): ProductModel {
    return new ProductModel({
      id: dto.id,
      name: dto.name,
      description: dto.description || '',
      status: dto.status || 'pending',
      createdAt: dto.created_at ? new Date(dto.created_at) : new Date(),
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : new Date(),
    });
  }

  toDTO(): ProductDTO {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }

  toProduct(): Product {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  updateStatus(status: ProductStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
    this.status = 'completed';
  }
}
