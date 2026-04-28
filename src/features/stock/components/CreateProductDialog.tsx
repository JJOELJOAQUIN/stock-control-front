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
import type { CreateProductRequest, ProductScope } from "../types/stock.types";


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

const PRODUCT_SCOPES = ["LOCAL", "CONSULTORIO", "BOTH"] as const;

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear producto</DialogTitle>
          <DialogDescription>Alta de producto</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Descripción</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Stock mínimo</Label>
            <Input
              type="number"
              value={form.minimumStock}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  minimumStock: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Costo</Label>
            <Input
              type="number"
              value={form.costPrice}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  costPrice: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  category: e.target.value as any,
                }))
              }
              className="input"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Marca</Label>
            <select
              value={form.brand}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  brand: e.target.value as any,
                }))
              }
              className="input"
            >
              {PRODUCT_BRANDS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Scope</Label>
            <select
              value={form.scope}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  scope: e.target.value as ProductScope,
                }))
              }
              className="input"
            >
              {PRODUCT_SCOPES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Barcode</Label>
            <Input
              value={form.barcode}
              onChange={(e) =>
                setForm((p) => ({ ...p, barcode: e.target.value }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}