import { CajaView } from "./caja-view"

const initialTransactions = [
  {
    id: 1,
    type: "ingreso" as const,
    amount: 15000,
    description: "Venta de cremas faciales",
    date: "2025-01-28",
    category: "Ventas",
  },
  {
    id: 2,
    type: "egreso" as const,
    amount: 5000,
    description: "Compra de insumos",
    date: "2025-01-28",
    category: "Proveedores",
  },
  {
    id: 3,
    type: "ingreso" as const,
    amount: 8500,
    description: "Venta de productos varios",
    date: "2025-01-27",
    category: "Ventas",
  },
  {
    id: 4,
    type: "egreso" as const,
    amount: 2500,
    description: "Pago de servicios",
    date: "2025-01-27",
    category: "Servicios",
  },
  {
    id: 5,
    type: "ingreso" as const,
    amount: 12000,
    description: "Venta de serums",
    date: "2025-01-26",
    category: "Ventas",
  },
]

export default function CajaLocalPage() {
  return (
    <CajaView
      title="Caja Local"
      subtitle="Gestiona el flujo de dinero del local"
      initialBalance={45230}
      initialTransactions={initialTransactions}
    />
  )
}
