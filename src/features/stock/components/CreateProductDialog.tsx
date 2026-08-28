import { useEffect } from "react";
import { Barcode, DollarSign, Package, Plus, Trash2, FlaskConical } from "lucide-react";
import type { CreateProductRequest } from "../types/stock.types";
import { PRODUCT_BRANDS } from "../types/stock.types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { useGetProcedureCatalogQuery } from "@/features/treatments/ui/screens/api/procedureCatalogApi";

const PRODUCT_CATEGORIES = [
  { value: "COSMETICO_VENTA", label: "Cosmetico Venta" },
  { value: "INSUMO_CAMILLA", label: "Insumo Camilla" },
  { value: "INSUMO_DESCARTABLE", label: "Insumo Descartable" },
  { value: "MESOTERAPIA", label: "Mesoterapia" },
  { value: "OTRO", label: "Otro" },
] as const;

// Unidad en la que se cuenta el stock del producto. Es la etiqueta con la que
// se expresa el consumo en las recetas (sin conversión: la caja ya entra
// multiplicada por unitsPerPackage al comprar).
const CONSUMPTION_UNITS = [
  { value: "UNIDAD", label: "Unidad" },
  { value: "ML", label: "ml" },
  { value: "AMPOLLA", label: "Ampolla" },
  { value: "DISPARO", label: "Disparo" },
] as const;

const UNIT_SHORT: Record<string, string> = {
  UNIDAD: "u.",
  ML: "ml",
  AMPOLLA: "amp.",
  DISPARO: "disp.",
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: CreateProductRequest;
  setForm: React.Dispatch<React.SetStateAction<CreateProductRequest>>;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function CreateProductDialog({
  open,
  onOpenChange,
  form,
  setForm,
  isSubmitting,
  onSubmit,
}: Props) {
  const { data: procedures = [] } = useGetProcedureCatalogQuery();
  const recipes = form.recipes ?? [];
  const unitLabel = UNIT_SHORT[form.consumptionUnit ?? "UNIDAD"] ?? "u.";

  const handleCostOrMarkupChange = (
    field: "costPrice" | "defaultMarkupPercentage",
    value: number
  ) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      const costPrice =
        field === "costPrice" ? value : Number(prev.costPrice);

      const markup =
        field === "defaultMarkupPercentage"
          ? value
          : Number(prev.defaultMarkupPercentage);

      if (
        Number.isFinite(costPrice) &&
        costPrice > 0 &&
        Number.isFinite(markup) &&
        markup >= 0
      ) {
        next.salePrice = Number(
          (costPrice + costPrice * (markup / 100)).toFixed(2)
        );
      }

      return next;
    });
  };

  // Agrega una línea de receta vacía.
  const addRecipeLine = () => {
    setForm((p) => ({
      ...p,
      recipes: [...(p.recipes ?? []), { procedureCode: "", quantity: 1 }],
    }));
  };

  const updateRecipeLine = (
    index: number,
    field: "procedureCode" | "quantity",
    value: string | number
  ) => {
    setForm((p) => ({
      ...p,
      recipes: (p.recipes ?? []).map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      ),
    }));
  };

  const removeRecipeLine = (index: number) => {
    setForm((p) => ({
      ...p,
      recipes: (p.recipes ?? []).filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (!open) return;

    setForm((prev) => ({
      ...prev,
      scope: "CONSULTORIO",
    }));
  }, [open, setForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Crear Producto
          </DialogTitle>
          <DialogDescription>
            Completa los datos para dar de alta un nuevo producto en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-1">
          <FieldGroup className="grid grid-cols-1 gap-5 py-4 md:grid-cols-2">
            <Field className="md:col-span-2">
              <FieldLabel>Nombre del producto</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>Descripcion (opcional)</FieldLabel>
              <Input
                placeholder="Detalles adicionales del producto..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel>Stock minimo</FieldLabel>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.minimumStock}
                onChange={(e) =>
                  setForm((p) => ({ ...p, minimumStock: Number(e.target.value) }))
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
                  placeholder="0.00"
                  value={form.costPrice}
                  onChange={(e) =>
                    handleCostOrMarkupChange("costPrice", Number(e.target.value))
                  }
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>Margen sugerido %</FieldLabel>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 50"
                value={form.defaultMarkupPercentage ?? ""}
                onChange={(e) =>
                  handleCostOrMarkupChange(
                    "defaultMarkupPercentage",
                    Number(e.target.value)
                  )
                }
              />
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
                  placeholder="0.00"
                  value={form.salePrice ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      salePrice: Number(e.target.value),
                    }))
                  }
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>Categoria</FieldLabel>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((p) => ({ ...p, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
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
                onValueChange={(value) => setForm((p) => ({ ...p, brand: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
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

            {/* --- Unidad de consumo + unidades por envase --- */}
            <Field>
              <FieldLabel>Unidad de consumo</FieldLabel>
              <Select
                value={form.consumptionUnit ?? "UNIDAD"}
                onValueChange={(value) =>
                  setForm((p) => ({ ...p, consumptionUnit: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {CONSUMPTION_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Unidades por envase</FieldLabel>
              <Input
                type="number"
                min="1"
                placeholder="Ej: 15 (caja NCTF 5×3ml)"
                value={form.unitsPerPackage ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    unitsPerPackage: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </Field>

            <Field>
              <FieldLabel>Disponibilidad</FieldLabel>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground">
                Consultorio
              </div>
            </Field>

            <Field>
              <FieldLabel>Codigo de barras (opcional)</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Barcode className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Escanear o ingresar..."
                  value={form.barcode}
                  onChange={(e) => setForm((p) => ({ ...p, barcode: e.target.value }))}
                />
              </InputGroup>
            </Field>
          </FieldGroup>

          {/* --- Asociar a tratamientos (opcional) --- */}
          <div className="mt-2 rounded-lg border p-4">
            <div className="mb-1 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Asociar a tratamientos (opcional)
              </span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Definí en qué procedimientos se usa este producto y cuánto se
              consume por sesión, en {UNIT_SHORT[form.consumptionUnit ?? "UNIDAD"] ?? "unidades"}.
              Podés dejarlo vacío y cargar las recetas más adelante.
            </p>

            <div className="space-y-2">
              {recipes.map((line, index) => {
                // Procedimientos ya elegidos en otras líneas (para no repetir).
                const taken = recipes
                  .filter((_, i) => i !== index)
                  .map((l) => l.procedureCode);
                const options = procedures.filter(
                  (proc) => !taken.includes(proc.code)
                );

                return (
                  <div key={index} className="flex items-end gap-2">
                    <Field className="flex-1">
                      <FieldLabel className="text-xs">Tratamiento</FieldLabel>
                      <Select
                        value={line.procedureCode || undefined}
                        onValueChange={(value) =>
                          updateRecipeLine(index, "procedureCode", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Elegir tratamiento..." />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((proc) => (
                            <SelectItem key={proc.code} value={proc.code}>
                              {proc.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field className="w-28">
                      <FieldLabel className="text-xs">Cantidad ({unitLabel})</FieldLabel>
                      <Input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          updateRecipeLine(
                            index,
                            "quantity",
                            Math.max(1, Math.trunc(Number(e.target.value) || 1))
                          )
                        }
                      />
                    </Field>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="mb-0.5 text-muted-foreground hover:text-destructive"
                      onClick={() => removeRecipeLine(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={addRecipeLine}
            >
              <Plus className="h-4 w-4" />
              Agregar tratamiento
            </Button>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Creando...
              </>
            ) : (
              "Crear Producto"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}