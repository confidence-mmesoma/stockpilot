import { Router } from "express";
import { z } from "zod";

const router = Router();

const products = [
  {
    id: 1,
    name: "Bottled Water 75cl",
    sku: "WTR-075",
    price: 200,
    stock: 120,
    lowStockThreshold: 20,
    isArchived: false,
  },
  {
    id: 2,
    name: "Indomie Noodles (Chicken)",
    sku: "NDL-001",
    price: 250,
    stock: 80,
    lowStockThreshold: 15,
    isArchived: false,
  },
  {
    id: 3,
    name: "Peak Milk Sachet",
    sku: "MLK-S01",
    price: 150,
    stock: 8,
    lowStockThreshold: 10,
    isArchived: false,
  },
];
let nextId = 4;

// Rules for valid product data
const fields = {
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(30, "SKU must be 30 characters or less"),
  price: z.number().positive("Price must be greater than 0"),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  lowStockThreshold: z
    .number()
    .int("Threshold must be a whole number")
    .min(0, "Threshold cannot be negative"),
};

const createSchema = z.object({
  ...fields,
  lowStockThreshold: fields.lowStockThreshold.optional(),
});
const updateSchema = z.object(fields).partial();

function formatIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

function parseId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/products: list all active products
router.get("/", (req, res) => {
  res.status(200).json(products.filter((p) => !p.isArchived));
});

// GET /api/products/:id: get one product
router.get("/:id", (req, res) => {
  const id = parseId(req);
  if (!id) return res.status(400).json({ message: "Invalid product id" });

  const product = products.find((p) => p.id === id && !p.isArchived);
  if (!product) return res.status(404).json({ message: "Product not found" });

  res.status(200).json(product);
});

// POST /api/products: create a product
router.post("/", (req, res) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({
        message: "Validation failed",
        errors: formatIssues(result.error),
      });
  }

  const data = result.data;
  const sku = data.sku.toUpperCase();

  if (products.some((p) => p.sku === sku)) {
    return res
      .status(409)
      .json({ message: `A product with SKU "${sku}" already exists` });
  }

  const product = {
    id: nextId++,
    name: data.name,
    sku,
    price: data.price,
    stock: data.stock,
    lowStockThreshold: data.lowStockThreshold ?? 5,
    isArchived: false,
  };
  products.push(product);

  res.status(201).json(product);
});

// PUT /api/products/:id: update one or more fields of a product
router.put("/:id", (req, res) => {
  const id = parseId(req);
  if (!id) return res.status(400).json({ message: "Invalid product id" });

  const product = products.find((p) => p.id === id && !p.isArchived);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({
        message: "Validation failed",
        errors: formatIssues(result.error),
      });
  }

  const updates = result.data;
  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ message: "Provide at least one field to update" });
  }

  if (updates.sku) {
    updates.sku = updates.sku.toUpperCase();
    if (products.some((p) => p.sku === updates.sku && p.id !== id)) {
      return res
        .status(409)
        .json({
          message: `A product with SKU "${updates.sku}" already exists`,
        });
    }
  }

  Object.assign(product, updates);
  res.status(200).json(product);
});

// DELETE /api/products/:id: archive a product (it is not permanently removed)
router.delete("/:id", (req, res) => {
  const id = parseId(req);
  if (!id) return res.status(400).json({ message: "Invalid product id" });

  const product = products.find((p) => p.id === id && !p.isArchived);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.isArchived = true;
  res.status(200).json({ message: "Product archived", product });
});

export default router;
