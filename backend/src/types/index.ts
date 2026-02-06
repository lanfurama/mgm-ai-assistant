export type ProductStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface Product {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
  source: string;
  error_message?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProductDTO {
  id?: string;
  name: string;
  description?: string;
  status?: ProductStatus;
  source?: string;
  error_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  status?: ProductStatus;
  source?: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  status?: ProductStatus;
  error_message?: string | null;
}
