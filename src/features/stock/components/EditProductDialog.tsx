import { Barcode, DollarSign, Pencil, Percent } from "lucide-react";
import type { ProductWithStock, UpdateProductRequest } from "../types/stock.types";
import { PRODUCT_BRANDS } from "../types/stock.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { stockLabel, UNIT_OPTIONS, unitShort } from "@/lib/units";

const PRODUCT_CATEGORIES = [
  { value: "COSMETICO_VENTA", label: "Cosmético Venta" },
  { value: "INSUMO_CAMILLA", label: "Insumo Camilla" },
  { value: "INSUMO_DESCARTABLE", label: "Insumo Descartable" },
  { value: "MESOTERAPIA", label: "Mesoterapia" },
  { value: "OTRO", label: "Otro" },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithStock | null;
  form: UpdateProductRequest;
  setForm: React.Dispatch<React.SetStateAction<UpdateProductRequest>>;
  barcode: string;
  onBarcodeChange: (barcode: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  form,
  setForm,
  barcode,
  onBarcodeChange,
  isSubmitting,
  onSubmit,
}: Props) {
  // Costo, margen y venta van enlazados: cambiar el costo mantiene el margen
  // (la venta acompaña el aumento), cambiar el margen recalcula la venta y
  // cambiar la venta a mano actualiza el margen.
  const handleCostChange = (costPrice: number) => {
    setForm((prev) => {
      const markup = Number(prev.defaultMarkupPercentage ?? 0);
      // Sin margen no se toca la venta: antes quedaba igual al costo.
      if (!(costPrice > 0) || !(markup > 0)) {
        return { ...prev, costPrice };
      }
      return {
        ...prev,
        costPrice,
        salePrice: Number((costPrice * (1 + markup / 100)).toFixed(2)),
      };
    });
  };

  const handleMarkupChange = (markup: number) => {
    setForm((prev) => {
      const costPrice = Number(prev.costPrice ?? 0);
      if (!(costPrice > 0) || !(markup >= 0)) {
        return { ...prev, defaultMarkupPercentage: markup };
      }
      return {
        ...prev,
        defaultMarkupPercentage: markup,
        salePrice: Number((costPrice * (1 + markup / 100)).toFixed(2)),
      };
    });
  };

  const handleSalePriceChange = (salePrice: number) => {
    setForm((prev) => {
      const costPrice = Number(prev.costPrice ?? 0);
      if (!(costPrice > 0) || !(salePrice > 0)) {
        return { ...prev, salePrice };
      }
      return {
        ...prev,
        salePrice,
        defaultMarkupPercentage: Number(
          ((salePrice / costPrice - 1) * 100).toFixed(2)
        ),
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Editar Producto
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del producto seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-2">
          <FieldGroup className="grid grid-cols-1 gap-5 py-4 md:grid-cols-2">
            <Field className="md:col-span-2">
              <FieldLabel>Nombre del producto</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>Descripción (opcional)</FieldLabel>
              <Input
                placeholder="Detalles adicionales..."
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <FieldLabel>Unidad en que se cuenta el stock</FieldLabel>
              <Select
                value={form.consumptionUnit ?? "UNIDAD"}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    consumptionUnit: value as UpdateProductRequest["consumptionUnit"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {product && (form.consumptionUnit ?? "UNIDAD") !== (product.consumptionUnit ?? "UNIDAD") && (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  Al cambiar la unidad, revisá después el stock con Reconciliación de stock.
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel>
                Contenido de un envase ({unitShort(form.consumptionUnit)})
              </FieldLabel>
              <Input
                type="number"
                min="0"
                step={form.consumptionUnit === "ML" ? "0.1" : "1"}
                placeholder={form.consumptionUnit === "ML" ? "Ej: 15 (5 viales × 3 ml)" : "Ej: 20"}
                value={form.unitsPerPackage ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    unitsPerPackage: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Al cargar una compra de 1 envase, entra esta cantidad al stock.
              </p>
            </Field>

            <Field>
              <FieldLabel>Stock mínimo ({unitShort(form.consumptionUnit)})</FieldLabel>
              <Input
                type="number"
                min="0"
                step={form.consumptionUnit === "ML" ? "0.1" : "1"}
                value={form.minimumStock}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    minimumStock: Number(e.target.value),
                  }))
                }
              />
            </Field>

            <Field>
              <FieldLabel>Costo unitario</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <DollarSign className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice || ""}
                  onChange={(e) => handleCostChange(Number(e.target.value))}
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>Margen sugerido %</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Percent className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.defaultMarkupPercentage || ""}
                  onChange={(e) => handleMarkupChange(Number(e.target.value))}
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>Precio venta público</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <DollarSign className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salePrice || ""}
                  onChange={(e) => handleSalePriceChange(Number(e.target.value))}
                />
              </InputGroup>
              <p className="mt-1 text-xs text-muted-foreground">
                Si cambiás el costo, el precio de venta se ajusta manteniendo el margen.
              </p>
            </Field>

            <Field>
              <FieldLabel>Categoría</FieldLabel>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Marca</FieldLabel>
              <Select
                value={form.brand}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, brand: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Expirable</FieldLabel>
              <Select
                value={form.expirable == null ? undefined : String(form.expirable)}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    expirable: value === "true",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin cambios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Estado</FieldLabel>
              <Select
                value={String(form.active ?? true)}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    active: value === "true",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>Código de barras</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Barcode className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  value={barcode}
                  placeholder="Escaneá o escribí el código"
                  onChange={(e) => onBarcodeChange(e.target.value)}
                />
              </InputGroup>
              <p className="mt-1 text-xs text-muted-foreground">
                No puede repetirse: si otro producto ya lo usa, no se guarda.
              </p>
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter className="border-t pt-4">
          {product && (
            <Badge
              variant={product.active ? "default" : "secondary"}
              className="mr-auto"
            >
              Stock actual: {stockLabel(product)}
            </Badge>
          )}

          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}