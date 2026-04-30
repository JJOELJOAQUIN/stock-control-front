
import { Barcode, DollarSign, Pencil } from "lucide-react";
import type { ProductWithStock, UpdateProductRequest } from "../types/stock.types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
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
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithStock | null;
  form: UpdateProductRequest;
  setForm: React.Dispatch<React.SetStateAction<UpdateProductRequest>>;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  form,
  setForm,
  isSubmitting,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Editar Producto
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del producto seleccionado.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="grid grid-cols-1 gap-5 py-4 md:grid-cols-2">
          <Field className="md:col-span-2">
            <FieldLabel>Nombre del producto</FieldLabel>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel>Descripcion (opcional)</FieldLabel>
            <Input
              placeholder="Detalles adicionales..."
              value={form.description ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </Field>

          <Field>
            <FieldLabel>Stock minimo</FieldLabel>
            <Input
              type="number"
              min="0"
              value={form.minimumStock}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, minimumStock: Number(e.target.value) }))
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
                value={form.costPrice}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, costPrice: Number(e.target.value) }))
                }
              />
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel>Categoria</FieldLabel>
            <Select
              value={form.category}
              onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
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
              onValueChange={(value) => setForm((prev) => ({ ...prev, brand: value }))}
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
              value={String(form.expirable ?? false)}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, expirable: value === "true" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Si</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Estado</FieldLabel>
            <Select
              value={String(form.active ?? true)}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, active: value === "true" }))
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
            <FieldLabel>Codigo de barras</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Barcode className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput value={product?.barcode ?? ""} disabled />
            </InputGroup>
            <p className="mt-1 text-xs text-muted-foreground">
              El codigo de barras no puede modificarse.
            </p>
          </Field>
        </FieldGroup>

        <DialogFooter className="gap-2 sm:gap-0">
          {product && (
            <Badge
              variant={product.active ? "default" : "secondary"}
              className="mr-auto"
            >
              Stock actual: {product.currentStock}
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
