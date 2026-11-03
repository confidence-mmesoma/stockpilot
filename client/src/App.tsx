import { useState } from "react";
import { archiveProduct, createProduct, updateProduct } from "./api/products";
import { Button } from "./components/Button";
import { ErrorMessage } from "./components/ErrorMessage";
import { ProductForm } from "./components/ProductForm";
import { ProductTable } from "./components/ProductTable";
import { Spinner } from "./components/Spinner";
import { useProducts } from "./hooks/useProducts";
import type { Product, ProductInput } from "./types";

function App() {
  const { products, loading, error, reload } = useProducts();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setShowCreate(true);
  }

  function startEdit(product: Product) {
    setShowCreate(false);
    setEditing(product);
  }

  async function handleCreate(input: ProductInput) {
    await createProduct(input);
    setShowCreate(false);
    await reload();
  }

  async function handleUpdate(input: ProductInput) {
    if (!editing) return;
    await updateProduct(editing.id, input);
    setEditing(null);
    await reload();
  }

  async function handleArchive(product: Product) {
    const confirmed = window.confirm(
      `Archive "${product.name}"? It will be hidden from the product list.`,
    );
    if (!confirmed) return;

    setActionError(null);
    try {
      await archiveProduct(product.id);
      await reload();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not archive the product",
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-2xl font-bold text-emerald-700">StockPilot</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Products</h2>
          {!showCreate && !editing && (
            <Button onClick={startCreate}>Add product</Button>
          )}
        </div>

        {showCreate && (
          <ProductForm
            submitLabel="Create product"
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        )}

        {editing && (
          <ProductForm
            key={editing.id}
            initialValues={{
              name: editing.name,
              sku: editing.sku,
              price: editing.price,
              stock: editing.stock,
              lowStockThreshold: editing.lowStockThreshold,
            }}
            submitLabel="Save changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}

        {actionError && <ErrorMessage message={actionError} />}

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={reload} />
        ) : (
          <ProductTable
            products={products}
            onEdit={startEdit}
            onArchive={handleArchive}
          />
        )}
      </main>
    </div>
  );
}

export default App;
