import { Router, Request, Response } from 'express';
import { ProductModel } from '../models/Product';
import { CreateProductDTO, UpdateProductDTO } from '../types';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.findAll();
    res.json({
      success: true,
      data: products.map(ProductModel.toDTO),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch products',
      },
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found',
        },
      });
    }

    res.json({
      success: true,
      data: ProductModel.toDTO(product),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch product',
      },
    });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data: CreateProductDTO = req.body;
    
    if (!data.name || typeof data.name !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Product name is required',
        },
      });
    }

    const product = await ProductModel.create(data);
    res.status(201).json({
      success: true,
      data: ProductModel.toDTO(product),
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create product',
      },
    });
  }
});

router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Products must be an array',
        },
      });
    }

    const createdProducts = await ProductModel.batchCreate(products);
    res.status(201).json({
      success: true,
      data: createdProducts.map(ProductModel.toDTO),
    });
  } catch (error) {
    console.error('Error creating products:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create products',
      },
    });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateProductDTO = req.body;

    const product = await ProductModel.update(id, data);
    res.json({
      success: true,
      data: ProductModel.toDTO(product),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update product',
      },
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await ProductModel.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found',
        },
      });
    }

    res.json({
      success: true,
      data: undefined,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete product',
      },
    });
  }
});

export default router;
