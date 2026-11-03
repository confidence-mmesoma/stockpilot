export type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
};