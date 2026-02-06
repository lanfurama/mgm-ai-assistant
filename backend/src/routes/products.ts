import { Router, Request, Response, NextFunction } from 'express';
import { ProductModel } from '../models/Product.js';
import { CreateProductDTO, UpdateProductDTO } from '../types/index.js';
import { validateBody, validateParams, validators } from '../middleware/validator.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ProductModel.findAll();
    res.json({
      success: true,
      data: products.map(ProductModel.toDTO),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', 
  validateParams({
    id: validators.combine(validators.required, validators.string),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);
      
      if (!product) {
        const error: ApiError = new Error('Product not found');
        error.statusCode = 404;
        return next(error);
      }

      res.json({
        success: true,
        data: ProductModel.toDTO(product),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  validateBody({
    name: validators.combine(validators.required, validators.string, validators.nonEmpty),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateProductDTO = req.body;
      const product = await ProductModel.create(data);
      res.status(201).json({
        success: true,
        data: ProductModel.toDTO(product),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/batch',
  validateBody({
    products: validators.combine(validators.required, validators.array, validators.nonEmpty),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { products } = req.body;
      const createdProducts = await ProductModel.batchCreate(products);
      res.status(201).json({
        success: true,
        data: createdProducts.map(ProductModel.toDTO),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  validateParams({
    id: validators.combine(validators.required, validators.string),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: UpdateProductDTO = req.body;
      const product = await ProductModel.update(id, data);
      res.json({
        success: true,
        data: ProductModel.toDTO(product),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validateParams({
    id: validators.combine(validators.required, validators.string),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await ProductModel.delete(id);
      
      if (!deleted) {
        const error: ApiError = new Error('Product not found');
        error.statusCode = 404;
        return next(error);
      }

      res.json({
        success: true,
        data: undefined,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
