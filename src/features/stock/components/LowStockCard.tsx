import { AlertTriangle, PackageCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type { ProductWithStock } from "@/features/stock/types/stock.types";

type Props = {
    products: ProductWithStock[];
    /** Opcional: abrir el modal de venta al tocar un producto (a cablear más adelante). */
    onSelectProduct?: (product: ProductWithStock) => void;
};

export function LowStockCard({ products, onSelectProduct }: Props) {
    const lowStock = [...products]
        .filter((p) => p.belowMinimum)
        .sort((a, b) => a.currentStock - b.currentStock);

    return (
        <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Productos con stock bajo
                    {lowStock.length > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                            {lowStock.length}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent>
                {lowStock.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-lg bg-emerald-50/60 px-4 py-6 text-sm text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <PackageCheck className="h-5 w-5 shrink-0" />
                        <span>Todos los productos están por encima del mínimo.</span>
                    </div>
                ) : (
                    <ul className="divide-y divide-border/60">
                        {lowStock.map((p) => {
                            const clickable = Boolean(onSelectProduct);
                            return (
                                <li
                                    key={p.id}
                                    onClick={clickable ? () => onSelectProduct?.(p) : undefined}
                                    className={
                                        "flex items-center justify-between gap-3 py-3 " +
                                        (clickable ? "cursor-pointer rounded-md px-2 hover:bg-muted/50" : "")
                                    }
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-foreground">{p.name}</p>
                                        {p.barcode && (
                                            <p className="truncate font-mono text-xs text-muted-foreground">
                                                {p.barcode}
                                            </p>
                                        )}
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="shrink-0 border-destructive/50 text-foreground">
                                        {p.currentStock} en stock
                                    </Badge>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}