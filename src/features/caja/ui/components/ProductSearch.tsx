import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { currencyFormatter } from "@/shared/lib/purchase";
import type { ProductWithStock } from "@/features/stock/types/stock.types";

const MAX_RESULTS = 8;

type ProductSearchProps = {
  products: ProductWithStock[];
  addedProductIds: Set<string>;
  onAdd: (product: ProductWithStock) => void;
};

export function ProductSearch({ products, addedProductIds, onAdd }: ProductSearchProps) {
  const [term, setTerm] = useState("");

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];

    return products
      .filter((p) => !addedProductIds.has(p.id))
      .filter((p) => `${p.name} ${p.barcode ?? ""}`.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [term, products, addedProductIds]);

  const hasQuery = term.trim().length > 0;

  const handleAdd = (product: ProductWithStock) => {
    onAdd(product);
    setTerm("");
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Buscar producto por nombre o código"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-label="Buscar producto"
      />

      {hasQuery && results.length === 0 && (
        <p className="mt-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
          No se encontraron productos para “{term.trim()}”.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-1 overflow-hidden rounded-md border" role="listbox">
          {results.map((product) => (
            <li key={product.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => handleAdd(product)}
                className="flex w-full items-center justify-between gap-2 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">{product.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    Stock: {product.currentStock} · Costo guardado:{" "}
                    {product.costPrice != null
                      ? currencyFormatter.format(product.costPrice)
                      : "—"}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-primary">
                  <Plus className="size-3" />
                  Agregar
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}