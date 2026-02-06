import { apiClient } from './client';
import { ProductDTO, ApiResponse } from '../types';

export const productApi = {
  async getAll(): Promise<ApiResponse<ProductDTO[]>> {
    return apiClient.get<ProductDTO[]>('/api/products');
  },

  async getById(id: string): Promise<ApiResponse<ProductDTO>> {
    return apiClient.get<ProductDTO>(`/api/products/${id}`);
  },

  async create(product: Omit<ProductDTO, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ProductDTO>> {
    return apiClient.post<ProductDTO>('/api/products', product);
  },

  async update(id: string, product: Partial<ProductDTO>): Promise<ApiResponse<ProductDTO>> {
    return apiClient.put<ProductDTO>(`/api/products/${id}`, product);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/products/${id}`);
  },

  async batchCreate(products: Omit<ProductDTO, 'id' | 'created_at' | 'updated_at'>[]): Promise<ApiResponse<ProductDTO[]>> {
    return apiClient.post<ProductDTO[]>('/api/products/batch', { products });
  },
};
