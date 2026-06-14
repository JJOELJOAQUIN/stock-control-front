import { useEffect } from "react";
import { Barcode, DollarSign, Package } from "lucide-react";
import type { CreateProductRequest } from "../types/stock.types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

const PRODUCT_CATEGORIES = [
  { value: "COSMETICO_VENTA", label: "Cosmetico Venta" },
  { value: "INSUMO_CAMILLA", label: "Insumo Camilla" },
  { value: "INSUMO_DESCARTABLE", label: "Insumo Descartable" },
  { value: "MESOTERAPIA", label: "Mesoterapia" },
  { value: "OTRO", label: "Otro" },
] as const;

const PRODUCT_BRANDS = [
  "LIDHERMA",
  "IDRAET",
  "EXEL",
  "SOLENIL",
  "BIOBELLUS",
  "MAGISTRALES",
  "OXAPHARMA",
  "MESOESTETIC",
  "GENERICO",
  "PRODERMIC",
  "HDM",
  "LACA",
  "CARTHAGE",
  "FORTBENTON",
  "BIOFARMACY",
  "MIRADROR",
   "LACROZE"
] as const;



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

  const handleCostOrMarkupChange = (
    field: "costPrice" | "defaultMarkupPercentage",
    value: number
  ) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      }

      const costPrice =
        field === "costPrice" ? value : Number(prev.costPrice)

      const markup =
        field === "defaultMarkupPercentage"
          ? value
          : Number(prev.defaultMarkupPercentage)

      if (
        Number.isFinite(costPrice) &&
        costPrice > 0 &&
        Number.isFinite(markup) &&
        markup >= 0
      ) {
        next.salePrice = Number(
          (costPrice + costPrice * (markup / 100)).toFixed(2)
        )
      }

      return next
    })
  }

  useEffect(() => {
    if (!open) return;

    setForm((prev) => ({
      ...prev,
      scope: "CONSULTORIO",
    }));
  }, [open, setForm]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Crear Producto
          </DialogTitle>
          <DialogDescription>
            Completa los datos para dar de alta un nuevo producto en el sistema.
          </DialogDescription>
        </DialogHeader>

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

        <DialogFooter>
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
