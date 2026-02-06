import { useState, useCallback, useEffect } from 'react';
import { Product, ProductStatus } from '../types';
import { ProductApiService } from '../services/productApiService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProductApiService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = useCallback(async (name: string) => {
    try {
      const newProduct = await ProductApiService.create(name, 'manual');
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      throw err;
    }
  }, []);

  const addProducts = useCallback(async (names: string[]) => {
    try {
      const newProducts = await ProductApiService.batchCreate(names, 'excel');
      setProducts(prev => [...prev, ...newProducts]);
    } catch (err) {
      throw err;
    }
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    try {
      await ProductApiService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      const deletePromises = products.map(p => ProductApiService.delete(p.id));
      await Promise.all(deletePromises);
      setProducts([]);
    } catch (err) {
      console.error('Error clearing products:', err);
      throw err;
    }
  }, [products]);

  const updateProductStatus = useCallback(async (id: string, status: ProductStatus) => {
    try {
      const updated = await ProductApiService.updateStatus(id, status);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      console.error('Error updating product status:', err);
      throw err;
    }
  }, []);

  const getPendingProducts = useCallback(() => {
    return products.filter(p => p.status === 'pending' || p.status === 'error');
  }, [products]);

  const getCompletedProducts = useCallback(() => {
    return products.filter(p => p.status === 'completed');
  }, [products]);

  const completedCount = products.filter(p => p.status === 'completed').length;
  const hasPending = products.some(p => p.status === 'pending' || p.status === 'error');

  return {
    products,
    setProducts,
    isLoading,
    error,
    loadProducts,
    addProduct,
    addProducts,
    removeProduct,
    clearAll,
    updateProductStatus,
    getPendingProducts,
    getCompletedProducts,
    completedCount,
    hasPending,
  };
};
