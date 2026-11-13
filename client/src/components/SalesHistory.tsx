import { formatDateTime, formatNaira } from "../lib/format";
import type { Sale } from "../types";

type Props = { sales: Sale[]; showSeller: boolean };

export function SalesHistory({ sales, showSeller }: Props) {
  if (sales.length === 0) {
    return (
      <p className="py-6 text-center text-slate-500">No sales recorded yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {sales.map((sale) => (
        <li
          key={sale.id}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-500">
              Sale #{sale.id} · {formatDateTime(sale.createdAt)}
              {showSeller && ` · ${sale.user.name}`}
            </p>
            <p className="font-semibold text-slate-800">
              {formatNaira(sale.total)}
            </p>
          </div>
          <ul className="mt-2 text-sm text-slate-600">
            {sale.items.map((item) => (
              <li key={item.id}>
                {item.quantity} × {item.product.name} at{" "}
                {formatNaira(item.unitPrice)}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
