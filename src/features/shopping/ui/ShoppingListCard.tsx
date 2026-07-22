import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, ShoppingBasket, Sparkles, Trash2 } from "lucide-react";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import type { ProductWithStock } from "@/features/stock/types/stock.types";
import {
  useAddShoppingItemMutation,
  useClearDoneShoppingItemsMutation,
  useDeleteShoppingItemMutation,
  useGetShoppingListQuery,
  useToggleShoppingItemMutation,
  type ShoppingListItem,
} from "../api/shoppingApi";

type Props = {
  /** Los mismos productos que ya carga la página de caja. */
  products: ProductWithStock[];
};

export function ShoppingListCard({ products }: Props) {
  const [text, setText] = useState("");

  const { data: items = [] } = useGetShoppingListQuery({ context: "CONSULTORIO" });
  const [addItem, { isLoading: isAdding }] = useAddShoppingItemMutation();
  const [toggleItem] = useToggleShoppingItemMutation();
  const [deleteItem] = useDeleteShoppingItemMutation();
  const [clearDone] = useClearDoneShoppingItemsMutation();

  const list = items as ShoppingListItem[];

  /**
   * Sugerencias: productos bajo mínimo que todavía no están anotados. Se
   * calculan acá y no se guardan — el stock cambia con cada compra y una
   * sugerencia persistida quedaría desactualizada sola.
   */
  const suggestions = useMemo(() => {
    const already = new Set(list.filter((i) => !i.done).map((i) => i.productId));
    return products
      .filter((p) => p.belowMinimum && !already.has(p.id))
      .sort((a, b) => Number(a.currentStock ?? 0) - Number(b.currentStock ?? 0))
      .slice(0, 8);
  }, [products, list]);

  const pending = list.filter((i) => !i.done);
  const done = list.filter((i) => i.done);

  const handleAdd = async (description: string, productId?: string | null) => {
    if (!description.trim()) {
      toast.error("Escribí qué hay que comprar");
      return;
    }
    try {
      await addItem({
        description: description.trim(),
        context: "CONSULTORIO",
        productId: productId ?? null,
      }).unwrap();
      setText("");
    } catch {
      toast.error("No se pudo agregar");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
            <ShoppingBasket className="size-5" />
          </div>
          <div>
            <CardTitle>Lista de compras</CardTitle>
            <CardDescription>
              Lo que hay que reponer. {pending.length} pendiente
              {pending.length === 1 ? "" : "s"}.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd(text)}
            placeholder="Ej: agujas 31G, algodón..."
          />
          <Button onClick={() => handleAdd(text)} disabled={isAdding} className="gap-1">
            <Plus className="size-4" />
            Anotar
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2 rounded-lg border border-dashed p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5" />
              Sugerencias por stock bajo
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  size="sm"
                  className="h-auto gap-1.5 py-1 text-xs"
                  onClick={() => handleAdd(p.name, p.id)}
                >
                  <Plus className="size-3" />
                  {p.name}
                  <Badge variant="secondary" className="ml-1 px-1 py-0 text-[10px]">
                    {p.currentStock}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          {pending.map((item) => (
            <Row key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
          ))}

          {!pending.length && !done.length && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nada anotado todavía.
            </p>
          )}
        </div>

        {done.length > 0 && (
          <div className="space-y-1 border-t pt-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Comprado ({done.length})
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 text-xs text-muted-foreground"
                onClick={() => clearDone({ context: "CONSULTORIO" })}
              >
                Limpiar
              </Button>
            </div>
            {done.map((item) => (
              <Row key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingListItem;
  onToggle: (arg: { id: string }) => void;
  onDelete: (arg: { id: string }) => void;
}) {
  return (
    <div className="group flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/40">
      <Checkbox checked={item.done} onCheckedChange={() => onToggle({ id: item.id })} />
      <span
        className={
          "flex-1 truncate text-sm " +
          (item.done ? "text-muted-foreground line-through" : "")
        }
      >
        {item.description}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onDelete({ id: item.id })}
      >
        <Trash2 className="size-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}