import { useState, useCallback } from 'react';
import { Product } from '../types';
import { ProductService } from '../services/productService';
import { ProductStorageService } from '../services/productStorageService';

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
      let updatedProducts = ProductService.markProductsAsProcessing(products, productIds);
      setProducts(updatedProducts);
      ProductStorageService.saveAll(updatedProducts);

      const batchSize = 3;

      for (let i = 0; i < pendingProducts.length; i += batchSize) {
        const batch = pendingProducts.slice(i, i + batchSize);

        try {
          updatedProducts = await ProductService.processBatch(
            updatedProducts,
            batch,
            async (progressProducts) => {
              setProducts(progressProducts);
              ProductStorageService.saveAll(progressProducts);
              updatedProducts = progressProducts;
            }
          );
        } catch (err) {
          const batchIds = batch.map(p => p.id);
          updatedProducts = ProductService.markProductsAsError(updatedProducts, batchIds);
          setProducts(updatedProducts);
          ProductStorageService.saveAll(updatedProducts);
          const errorMessage = err instanceof Error 
            ? `Lỗi khi xử lý: ${err.message}` 
            : 'Có lỗi xảy ra khi kết nối AI. Một số sản phẩm bị lỗi.';
          setError(errorMessage);
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
