import { CajaView } from "./caja-view"

const initialTransactions = [
  {
    id: 1,
    type: "ingreso" as const,
    amount: 25000,
    description: "Consulta dermatologica",
    date: "2025-01-28",
    category: "Consultas",
  },
  {
    id: 2,
    type: "ingreso" as const,
    amount: 35000,
    description: "Tratamiento facial",
    date: "2025-01-28",
    category: "Servicios",
  },
  {
    id: 3,
    type: "egreso" as const,
    amount: 8000,
    description: "Insumos medicos",
    date: "2025-01-27",
    category: "Proveedores",
  },
  {
    id: 4,
    type: "ingreso" as const,
    amount: 20000,
    description: "Control mensual paciente",
    date: "2025-01-27",
    category: "Consultas",
  },
  {
    id: 5,
    type: "ingreso" as const,
    amount: 45000,
    description: "Microdermoabrasion",
    date: "2025-01-26",
    category: "Servicios",
  },
]

export default function CajaConsultorioPage() {
  return (
    <CajaView
      title="Caja Consultorio"
      subtitle="Gestiona el flujo de dinero del consultorio"
      initialBalance={82500}
      initialTransactions={initialTransactions}
    />
  )
}
