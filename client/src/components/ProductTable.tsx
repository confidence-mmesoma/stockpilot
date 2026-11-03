import { Button } from "./Button";
import type { Product } from "../types";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

function StockBadge({ product }: { product: Product }) {
  if (product.stock === 0) {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Out of stock
      </span>
    );
  }
  if (product.stock <= product.lowStockThreshold) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        Low stock
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      In stock
    </span>
  );
}

type Props = {
  products: Product[];
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
};

export function ProductTable({ products, onEdit, onArchive }: Props) {
  if (products.length === 0) {
    return <p className="py-10 text-center text-slate-500">No products yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
            <th className="px-4 py-3 text-right font-medium">Stock</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3 font-medium text-slate-800">
                {product.name}
              </td>
              <td className="px-4 py-3 text-slate-600">{product.sku}</td>
              <td className="px-4 py-3 text-right text-slate-800">
                {naira.format(product.price)}
              </td>
              <td className="px-4 py-3 text-right text-slate-800">
                {product.stock}
              </td>
              <td className="px-4 py-3">
                <StockBadge product={product} />
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5"
                      onClick={() => onEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="px-3 py-1.5"
                      onClick={() => onArchive(product)}
                    >
                      Archive
                    </Button>
                  </div>
                </td>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
