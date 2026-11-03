import { request } from './http';
import type { Product, ProductInput } from '../types';

export const getProducts = () => request<Product[]>('/api/products');

export const createProduct = (input: ProductInput) =>
  request<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  export const updateProduct = (id: number, input: ProductInput) =>
  request<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });

export const archiveProduct = (id: number) =>
  request<{ message: string }>(`/api/products/${id}`, { method: 'DELETE' });