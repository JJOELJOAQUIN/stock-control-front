import { currencyFormatter } from "@/lib/currencyFormatter";
import type { ProductScanResponse } from "@/features/stock/types/stock.types";

type Props = {
  results: ProductScanResponse[];
  onSelect: (product: ProductScanResponse) => void;
};

export function ProductNameResults({ results, onSelect }: Props) {
  if (results.length === 0) return null;

  return (
    <ul className="overflow-hidden rounded-md border" role="listbox">
      {results.map((product) => (
        <li key={product.id} role="option" aria-selected={false}>
          <button
            type="button"
            onClick={() => onSelect(product)}
            className="flex w-full items-center justify-between border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{product.name}</span>
              <span className="block text-xs text-muted-foreground">
                {product.barcode} · Stock: {product.currentStock}
              </span>
            </span>
            <span className="shrink-0 text-sm text-emerald-600 dark:text-emerald-400">
              {product.salePrice != null ? currencyFormatter.format(product.salePrice) : "—"}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}