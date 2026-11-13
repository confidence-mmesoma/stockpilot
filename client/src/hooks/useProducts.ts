import { useCallback, useEffect, useState } from "react";
import { getProducts } from "../api/products";
import type { Product } from "../types";
import { socket } from "../lib/socket";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await getProducts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Live stock changes from other users' sales: patch the list in place, no refetch
  useEffect(() => {
    const onStockUpdated = (
      updates: { productId: number; stock: number }[],
    ) => {
      setProducts((current) =>
        current.map((product) => {
          const update = updates.find((u) => u.productId === product.id);
          return update ? { ...product, stock: update.stock } : product;
        }),
      );
    };

    socket.on("stock:updated", onStockUpdated);
    return () => {
      socket.off("stock:updated", onStockUpdated);
    };
  }, []);

  return { products, loading, error, reload: load };
}
