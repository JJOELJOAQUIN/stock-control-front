'use client';

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import {
  Search,
  Plus,
  Minus,
  Package,
  ArrowLeft,
} from "lucide-react"

// Mock data for products
const initialProducts = [
  { id: 1, name: "Crema Facial Hidratante", sku: "CF001", quantity: 45, minStock: 10, price: 25000 },
  { id: 2, name: "Serum Vitamina C", sku: "SV001", quantity: 8, minStock: 15, price: 35000 },
  { id: 3, name: "Mascarilla de Arcilla", sku: "MA001", quantity: 32, minStock: 10, price: 18000 },
  { id: 4, name: "Tonico Facial", sku: "TF001", quantity: 28, minStock: 12, price: 22000 },
  { id: 5, name: "Protector Solar SPF50", sku: "PS001", quantity: 5, minStock: 20, price: 28000 },
  { id: 6, name: "Aceite de Rosa Mosqueta", sku: "AR001", quantity: 18, minStock: 8, price: 32000 },
]

export default function StockPage() {
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [isIngresoOpen, setIsIngresoOpen] = useState(false)
  const [isEgresoOpen, setIsEgresoOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<typeof initialProducts[0] | null>(null)
  const [quantity, setQuantity] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleIngreso = () => {
    if (selectedProduct && quantity) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id
            ? { ...p, quantity: p.quantity + Number.parseInt(quantity) }
            : p
        )
      )
      setIsIngresoOpen(false)
      setSelectedProduct(null)
      setQuantity("")
    }
  }

  const handleEgreso = () => {
    if (selectedProduct && quantity) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id
            ? { ...p, quantity: Math.max(0, p.quantity - Number.parseInt(quantity)) }
            : p
        )
      )
      setIsEgresoOpen(false)
      setSelectedProduct(null)
      setQuantity("")
    }
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock * 0.5) return { label: "Critico", variant: "destructive" as const }
    if (quantity <= minStock) return { label: "Bajo", variant: "secondary" as const }
    return { label: "Normal", variant: "default" as const }
  }

  return (
       <div className="min-h-full bg-background text-foreground space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/inicio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Stock</h1>
          <p className="text-muted-foreground">Gestiona el inventario de productos</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {/* Ingreso Dialog */}
          <Dialog open={isIngresoOpen} onOpenChange={setIsIngresoOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ingresar Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ingresar Stock</DialogTitle>
                <DialogDescription>
                  Agrega unidades al inventario de un producto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Producto</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedProduct?.id || ""}
                    onChange={(e) => {
                      const product = products.find((p) => p.id === Number.parseInt(e.target.value))
                      setSelectedProduct(product || null)
                    }}
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock actual: {product.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Cantidad a ingresar</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Ingrese cantidad"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsIngresoOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleIngreso} disabled={!selectedProduct || !quantity}>
                  Confirmar Ingreso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Egreso Dialog */}
          <Dialog open={isEgresoOpen} onOpenChange={setIsEgresoOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Minus className="h-4 w-4" />
                Egresar Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Egresar Stock</DialogTitle>
                <DialogDescription>
                  Registra la salida de unidades del inventario
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">

                <div className="space-y-2">
                  <Label>Producto</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedProduct?.id || ""}
                    onChange={(e) => {
                      const product = products.find((p) => p.id === Number.parseInt(e.target.value))
                      setSelectedProduct(product || null)
                    }}
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock actual: {product.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Cantidad a egresar</Label>
                  <Input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 0}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Ingrese cantidad"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEgresoOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEgreso} disabled={!selectedProduct || !quantity} variant="destructive">
                  Confirmar Egreso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Productos</p>
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
            </div> 
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Package className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unidades Totales</p>
              <p className="text-2xl font-bold text-foreground">
                {products.reduce((acc, p) => acc + p.quantity, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Package className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock Bajo</p>
              <p className="text-2xl font-bold text-foreground">
                {products.filter((p) => p.quantity <= p.minStock).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Stock Min.</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const status = getStockStatus(product.quantity, product.minStock)
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="text-right font-semibold">{product.quantity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{product.minStock}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${product.price.toLocaleString()}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
