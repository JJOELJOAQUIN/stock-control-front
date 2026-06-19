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
  TableRow
  
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
import { Textarea } from "@/shared/components/ui/textarea"
import { Badge } from "@/shared/components/ui/badge"

import {
  ArrowLeft,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
} from "lucide-react"

interface Transaction {
  id: number
  type: "ingreso" | "egreso"
  amount: number
  description: string
  date: string
  category: string
}

interface CajaViewProps {
  title: string
  subtitle: string
  initialBalance: number
  initialTransactions: Transaction[]
}

export function CajaView({
  title,
  subtitle,
  initialBalance,
  initialTransactions,
}: CajaViewProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [balance, setBalance] = useState(initialBalance)
  const [isIngresoOpen, setIsIngresoOpen] = useState(false)
  const [isEgresoOpen, setIsEgresoOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")

  const handleIngreso = () => {
    if (amount && description) {
      const newTransaction: Transaction = {
        id: Date.now(),
        type: "ingreso",
        amount: Number.parseFloat(amount),
        description,
        category: category || "General",
        date: new Date().toISOString().split("T")[0],
      }
      setTransactions((prev) => [newTransaction, ...prev])
      setBalance((prev) => prev + Number.parseFloat(amount))
      setIsIngresoOpen(false)
      resetForm()
    }
  }

  const handleEgreso = () => {
    if (amount && description) {
      const newTransaction: Transaction = {
        id: Date.now(),
        type: "egreso",
        amount: Number.parseFloat(amount),
        description,
        category: category || "General",
        date: new Date().toISOString().split("T")[0],
      }
      setTransactions((prev) => [newTransaction, ...prev])
      setBalance((prev) => prev - Number.parseFloat(amount))
      setIsEgresoOpen(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setAmount("")
    setDescription("")
    setCategory("")
  }

  const totalIngresos = transactions
    .filter((t) => t.type === "ingreso")
    .reduce((acc, t) => acc + t.amount, 0)

  const totalEgresos = transactions
    .filter((t) => t.type === "egreso")
    .reduce((acc, t) => acc + t.amount, 0)

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
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Balance and Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Balance Card */}
        <div className="col-span-1 rounded-xl border border-border bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">Balance Actual</p>
              <p className="text-3xl font-bold">${balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Ingresos Summary */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ingresos</p>
              <p className="text-2xl font-bold text-emerald-500">
                ${totalIngresos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Egresos Summary */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Egresos</p>
              <p className="text-2xl font-bold text-destructive">
                ${totalEgresos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Ingreso Dialog */}
        <Dialog open={isIngresoOpen} onOpenChange={setIsIngresoOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar Ingreso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Ingreso</DialogTitle>
              <DialogDescription>
                Agrega un nuevo ingreso a la caja
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
           
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Seleccionar categoria</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Consultas">Consultas</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Descripcion</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el ingreso..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIngresoOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleIngreso} disabled={!amount || !description}>
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
              Registrar Egreso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Egreso</DialogTitle>
              <DialogDescription>
                Registra un egreso de la caja
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input
                  type="number"
                  min="0"

                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
              
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Seleccionar categoria</option>
                  <option value="Proveedores">Proveedores</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Salarios">Salarios</option>
                  <option value="Gastos Fijos">Gastos Fijos</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Descripcion</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el egreso..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEgresoOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEgreso} disabled={!amount || !description} variant="destructive">
                Confirmar Egreso
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Movimientos Recientes</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {transaction.date}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={transaction.type === "ingreso" ? "default" : "destructive"}
                  >
                    {transaction.type === "ingreso" ? "Ingreso" : "Egreso"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.category}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {transaction.description}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    transaction.type === "ingreso"
                      ? "text-emerald-500"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "ingreso" ? "+" : "-"}$
                  {transaction.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
