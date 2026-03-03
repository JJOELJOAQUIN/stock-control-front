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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Badge } from "@/shared/components/ui/badge"
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  User,
  Receipt,
  TrendingUp,
  TrendingDown,
  Download,
} from "lucide-react"

interface Movement {
  id: number
  date: string
  type: "consulta" | "tratamiento" | "venta" | "gasto"
  patient?: string
  description: string
  amount: number
  paymentMethod: string
  status: "completado" | "pendiente" | "cancelado"
}

const initialMovements: Movement[] = [
  {
    id: 1,
    date: "2025-01-28",
    type: "consulta",
    patient: "Maria Garcia",
    description: "Consulta dermatologica inicial",
    amount: 25000,
    paymentMethod: "Efectivo",
    status: "completado",
  },
  {
    id: 2,
    date: "2025-01-28",
    type: "tratamiento",
    patient: "Carlos Rodriguez",
    description: "Limpieza facial profunda",
    amount: 35000,
    paymentMethod: "Tarjeta",
    status: "completado",
  },
  {
    id: 3,
    date: "2025-01-28",
    type: "venta",
    patient: "Ana Martinez",
    description: "Crema hidratante + Serum",
    amount: 58000,
    paymentMethod: "Transferencia",
    status: "completado",
  },
  {
    id: 4,
    date: "2025-01-27",
    type: "gasto",
    description: "Compra de insumos medicos",
    amount: -15000,
    paymentMethod: "Transferencia",
    status: "completado",
  },
  {
    id: 5,
    date: "2025-01-27",
    type: "consulta",
    patient: "Laura Sanchez",
    description: "Control mensual",
    amount: 20000,
    paymentMethod: "Efectivo",
    status: "completado",
  },
  {
    id: 6,
    date: "2025-01-27",
    type: "tratamiento",
    patient: "Pedro Lopez",
    description: "Microdermoabrasion",
    amount: 45000,
    paymentMethod: "Tarjeta",
    status: "pendiente",
  },
  {
    id: 7,
    date: "2025-01-26",
    type: "venta",
    patient: "Sofia Ruiz",
    description: "Kit de cuidado facial",
    amount: 85000,
    paymentMethod: "Efectivo",
    status: "completado",
  },
  {
    id: 8,
    date: "2025-01-26",
    type: "gasto",
    description: "Pago de servicios",
    amount: -8500,
    paymentMethod: "Transferencia",
    status: "completado",
  },
]

export default function MovimientosConsultorioPage() {
  const [movements] = useState(initialMovements)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      movement.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.patient?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || movement.type === filterType
    const matchesStatus = filterStatus === "all" || movement.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const totalIngresos = movements
    .filter((m) => m.amount > 0 && m.status === "completado")
    .reduce((acc, m) => acc + m.amount, 0)

  const totalEgresos = Math.abs(
    movements
      .filter((m) => m.amount < 0 && m.status === "completado")
      .reduce((acc, m) => acc + m.amount, 0)
  )

  const pendientes = movements.filter((m) => m.status === "pendiente").length

  const getTypeColor = (type: string) => {
    switch (type) {
      case "consulta":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "tratamiento":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400"
      case "venta":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      case "gasto":
        return "bg-red-500/10 text-red-600 dark:text-red-400"
      default:
        return "bg-gray-500/10 text-gray-600"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completado":
        return <Badge variant="default">Completado</Badge>
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
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
          <h1 className="text-3xl font-bold text-foreground">Movimientos Consultorio</h1>
          <p className="text-muted-foreground">Registro de todas las transacciones del consultorio</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Movimientos</p>
              <p className="text-2xl font-bold text-foreground">{movements.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ingresos</p>
              <p className="text-2xl font-bold text-emerald-500">${totalIngresos.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Egresos</p>
              <p className="text-2xl font-bold text-destructive">${totalEgresos.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-amber-500">{pendientes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente o descripcion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="consulta">Consultas</SelectItem>
              <SelectItem value="tratamiento">Tratamientos</SelectItem>
              <SelectItem value="venta">Ventas</SelectItem>
              <SelectItem value="gasto">Gastos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead>Metodo de Pago</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {movement.date}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(movement.type)}`}>
                    {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {movement.patient ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {movement.patient}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {movement.description}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {movement.paymentMethod}
                </TableCell>
                <TableCell>{getStatusBadge(movement.status)}</TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    movement.amount > 0 ? "text-emerald-500" : "text-destructive"
                  }`}
                >
                  {movement.amount > 0 ? "+" : ""}${Math.abs(movement.amount).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
