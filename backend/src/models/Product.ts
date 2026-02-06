import { query } from '../config/database';
import { Product, ProductDTO, CreateProductDTO, UpdateProductDTO } from '../types';

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    const result = await query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Product | null> {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: CreateProductDTO): Promise<Product> {
    const result = await query(
      `INSERT INTO products (name, description, status, source)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        data.name,
        data.description || '',
        data.status || 'pending',
        data.source || 'manual',
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, data: UpdateProductDTO): Promise<Product> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.error_message !== undefined) {
      updates.push(`error_message = $${paramCount++}`);
      values.push(data.error_message);
    }

    if (updates.length === 0) {
      return (await this.findById(id))!;
    }

    values.push(id);
    const result = await query(
      `UPDATE products SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }

  static async batchCreate(products: CreateProductDTO[]): Promise<Product[]> {
    if (products.length === 0) return [];

    const values: any[] = [];
    const placeholders: string[] = [];
    let paramCount = 1;

    for (const product of products) {
      placeholders.push(
        `($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`
      );
      values.push(
        product.name,
        product.description || '',
        product.status || 'pending',
        product.source || 'manual'
      );
    }

    const result = await query(
      `INSERT INTO products (name, description, status, source)
       VALUES ${placeholders.join(', ')}
       RETURNING *`,
      values
    );
    return result.rows;
  }

  static async findByStatus(status: string): Promise<Product[]> {
    const result = await query(
      'SELECT * FROM products WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  }

  static toDTO(product: Product): ProductDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      status: product.status,
      source: product.source,
      error_message: product.error_message,
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString(),
    };
  }
}
