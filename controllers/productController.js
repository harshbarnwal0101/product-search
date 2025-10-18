import fs from 'fs';
import csv from 'csv-parser';
import { pool } from '../db.js';

export const uploadProducts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
  }

  const results = [];
  const failed = [];
  let stored = 0;

  const filepath = req.file.path;

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (row) => {
          results.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of results) {
      const sku = row.sku || '';
      const name = row.name || '';
      const brand = row.brand || '';
      const color = row.color || null;
      const size = row.size || null;
      const mrp = parseFloat(row.mrp);
      const price = parseFloat(row.price);
      const quantity = parseInt(row.quantity) || 0;

      // Validate required fields
      if (!sku || !name || !brand || !mrp || !price) {
        failed.push({ sku, reason: 'Missing required fields' });
        continue;
      }

      // Validate price <= mrp
      if (price > mrp) {
        failed.push({ sku, reason: 'Price > MRP' });
        continue;
      }

      // Validate quantity >= 0
      if (quantity < 0) {
        failed.push({ sku, reason: 'Quantity < 0' });
        continue;
      }

      try {
        await pool.query(
          `INSERT INTO products (sku, name, brand, color, size, mrp, price, quantity)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [sku, name, brand, color, size, mrp, price, quantity]
        );
        stored += 1;
      } catch (err) {
        failed.push({ sku, reason: 'DB insert error' });
      }
    }

    return res.json({ stored, failed });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process CSV' });
  } finally {
    fs.unlink(filepath, () => {});
  }
};

export const listProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      'SELECT * FROM products LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { brand, color, minPrice, maxPrice } = req.query;
    
    const conditions = [];
    const params = [];

    if (brand) {
      params.push(`%${brand}%`);
      conditions.push(`brand ILIKE $${params.length}`);
    }
    if (color) {
      params.push(`%${color}%`);
      conditions.push(`color ILIKE $${params.length}`);
    }
    if (minPrice) {
      params.push(minPrice);
      conditions.push(`price >= $${params.length}`);
    }
    if (maxPrice) {
      params.push(maxPrice);
      conditions.push(`price <= $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `SELECT * FROM products ${whereClause}`;
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search products' });
  }
};
