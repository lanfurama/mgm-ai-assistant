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

