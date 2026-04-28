import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { ProductWithStock, UpdateProductRequest } from "../types/stock.types";


const PRODUCT_CATEGORIES = [
  "COSMETICO_VENTA",
  "INSUMO_CAMILLA",
  "INSUMO_DESCARTABLE",
  "MESOTERAPIA",
  "OTRO",
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
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>
            Modificá los datos del producto seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Descripción</Label>
            <Input
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Stock mínimo</Label>
            <Input
              type="number"
              min="0"
              value={form.minimumStock}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  minimumStock: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Costo</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.costPrice}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  costPrice: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
            >
              {PRODUCT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Marca</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.brand}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  brand: e.target.value,
                }))
              }
            >
              {PRODUCT_BRANDS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Expirable</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={String(form.expirable ?? false)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  expirable: e.target.value === "true",
                }))
              }
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Activo</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={String(form.active ?? true)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  active: e.target.value === "true",
                }))
              }
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Barcode</Label>
            <Input value={product?.barcode ?? ""} disabled />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}