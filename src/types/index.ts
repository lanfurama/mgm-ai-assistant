export type ProductStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface Product {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GeminiProductResponse {
  name: string;
  description: string;
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

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}
