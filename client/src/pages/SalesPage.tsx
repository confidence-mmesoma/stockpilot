import { useState } from "react";
import { createSale } from "../api/sales";
import { useAuth } from "../auth/context";
import { ErrorMessage } from "../components/ErrorMessage";
import { SaleForm } from "../components/SaleForm";
import { SalesHistory } from "../components/SalesHistory";
import { Spinner } from "../components/Spinner";
import { useProducts } from "../hooks/useProducts";
import { useSales } from "../hooks/useSales";
import { formatNaira } from "../lib/format";
import type { SaleLine } from "../types";

export function SalesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const {
    products,
    loading: productsLoading,
    error: productsError,
    reload: reloadProducts,
  } = useProducts();
  const {
    sales,
    loading: salesLoading,
    error: salesError,
    reload: reloadSales,
  } = useSales();
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(items: SaleLine[]) {
    setNotice(null);
    try {
      const sale = await createSale(items);
      setNotice(`Sale #${sale.id} recorded: ${formatNaira(sale.total)}`);
    } catch (err) {
      // Show up-to-date stock after a failed sale, then let the form display the error
      await reloadProducts();
      throw err;
    }
    await Promise.all([reloadProducts(), reloadSales()]);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">Record a sale</h2>

      {productsLoading && products.length === 0 ? (
        <Spinner />
      ) : productsError && products.length === 0 ? (
        <ErrorMessage message={productsError} onRetry={reloadProducts} />
      ) : (
        <SaleForm products={products} onSubmit={handleSubmit} />
      )}

      {notice && (
        <p
          className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800"
          role="status"
        >
          {notice}
        </p>
      )}

      <h2 className="pt-4 text-lg font-semibold text-slate-800">
        {isAdmin ? "All sales" : "Your sales"}
      </h2>
      {salesLoading && sales.length === 0 ? (
        <Spinner />
      ) : salesError ? (
        <ErrorMessage message={salesError} onRetry={reloadSales} />
      ) : (
        <SalesHistory sales={sales} showSeller={isAdmin} />
      )}
    </div>
  );
}
