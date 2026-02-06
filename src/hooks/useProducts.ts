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
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticProduct: Product = {
      id: tempId,
      name: name.trim(),
      description: '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProducts(prev => [...prev, optimisticProduct]);

    try {
      const newProduct = await ProductApiService.create(name, 'manual');
      setProducts(prev => prev.map(p => p.id === tempId ? newProduct : p));
      return newProduct;
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== tempId));
      throw err;
    }
  }, []);

  const addProducts = useCallback(async (names: string[]) => {
    const tempProducts: Product[] = names.map((name, idx) => ({
      id: `temp-${Date.now()}-${idx}`,
      name: name.trim(),
      description: '',
      status: 'pending' as ProductStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    setProducts(prev => [...prev, ...tempProducts]);
    const tempIds = tempProducts.map(p => p.id);

    try {
      const newProducts = await ProductApiService.batchCreate(names, 'excel');
      setProducts(prev => {
        const withoutTemp = prev.filter(p => !tempIds.includes(p.id));
        return [...withoutTemp, ...newProducts];
      });
      return newProducts;
    } catch (err) {
      setProducts(prev => prev.filter(p => !tempIds.includes(p.id)));
      throw err;
    }
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    const productToRemove = products.find(p => p.id === id);
    if (!productToRemove) return;

    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      await ProductApiService.delete(id);
    } catch (err) {
      setProducts(prev => {
        const index = prev.findIndex(p => p.id === id);
        if (index === -1) {
          return [...prev, productToRemove].sort((a, b) => 
            (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
          );
        }
        return prev;
      });
      throw err;
    }
  }, [products]);

  const clearAll = useCallback(async () => {
    const previousProducts = [...products];
    setProducts([]);

    try {
      const deletePromises = previousProducts.map(p => ProductApiService.delete(p.id));
      await Promise.all(deletePromises);
    } catch (err) {
      setProducts(previousProducts);
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
