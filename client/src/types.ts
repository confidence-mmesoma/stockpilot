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

export type Role = 'ADMIN' | 'STAFF';

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type SaleLine = { productId: number; quantity: number };

export type SaleItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  productId: number;
  product: { name: string; sku: string };
};

export type Sale = {
  id: number;
  total: number;
  createdAt: string;
  userId: number;
  user: { id: number; name: string };
  items: SaleItem[];
};

export type StaffUser = User & { isActive: boolean; createdAt: string };

export type StaffInput = { name: string; email: string; password: string };

export type AppNotification = {
  id: number;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK';
  message: string;
  productId: number;
  isRead: boolean;
  createdAt: string;
};