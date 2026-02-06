import { useState, useCallback } from 'react';
import { Product } from '../types';
import { ProductService } from '../services/productService';
import { ProductApiService } from '../services/productApiService';

interface UseProductProcessingReturn {
  isLoading: boolean;
  error: string | null;
  processProducts: (products: Product[], setProducts: (products: Product[]) => void) => Promise<void>;
  clearError: () => void;
}

export const useProductProcessing = (): UseProductProcessingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processProducts = useCallback(
    async (products: Product[], setProducts: (products: Product[]) => void) => {
      const pendingProducts = ProductService.getPendingProducts(products);
      
      if (pendingProducts.length === 0) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const productIds = pendingProducts.map(p => p.id);
      
      for (const id of productIds) {
        try {
          await ProductApiService.updateStatus(id, 'processing');
        } catch (err) {
          console.error('Error updating status to processing:', err);
        }
      }

      const batchSize = 3;
      let updatedProducts = [...products];

      for (let i = 0; i < pendingProducts.length; i += batchSize) {
        const batch = pendingProducts.slice(i, i + batchSize);

        try {
          updatedProducts = await ProductService.processBatch(
            updatedProducts,
            batch,
            async (progressProducts) => {
              for (const product of progressProducts) {
                const original = updatedProducts.find(p => p.id === product.id);
                if (original && original.status !== product.status) {
                  try {
                    if (product.status === 'completed') {
                      await ProductApiService.updateDescription(product.id, product.description);
                    } else if (product.status === 'error') {
                      await ProductApiService.updateStatus(product.id, 'error');
                    }
                  } catch (err) {
                    console.error('Error updating product in API:', err);
                  }
                }
              }
              setProducts(progressProducts);
              updatedProducts = progressProducts;
            }
          );
        } catch (err) {
          const batchIds = batch.map(p => p.id);
          for (const id of batchIds) {
            try {
              await ProductApiService.updateStatus(id, 'error');
            } catch (apiErr) {
              console.error('Error updating status to error:', apiErr);
            }
          }
          updatedProducts = ProductService.markProductsAsError(updatedProducts, batchIds);
          setProducts(updatedProducts);
          setError("Có lỗi xảy ra khi kết nối AI. Một số sản phẩm bị lỗi.");
        }
      }

      setIsLoading(false);
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    processProducts,
    clearError,
  };
};
