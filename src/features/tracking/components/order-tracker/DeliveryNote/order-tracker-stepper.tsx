import { useState, type FC, useEffect } from "react"
import { HourglassIcon, Package2Icon, TruckIcon, HomeIcon, UndoIcon, CheckCircle2Icon } from "lucide-react"

interface CustomizedSteppersProps {
  estado: string
}

const BASE_STEPS = [
  { label: "Pendiente", status: "PENDIENTE" },
  { label: "Armado", status: "ARMADO" },
  { label: "En Tránsito", status: "EN_TRANSITO" },
  { label: "Disponible", status: "DISPONIBLE" },
  { label: "Dispensado", status: "DISPENSADO" },
]

const RETURN_STEP = { label: "Devolución", status: "DEVOLUCION" }

const stepIcons = {
  PENDIENTE: HourglassIcon,
  ARMADO: Package2Icon,
  EN_TRANSITO: TruckIcon,
  DISPONIBLE: HomeIcon,
  DISPENSADO: CheckCircle2Icon,
  DEVOLUCION: UndoIcon,
}

const stepColors = {
  PENDIENTE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
  ARMADO: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
  EN_TRANSITO: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
  DISPONIBLE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
  DISPENSADO: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
  DEVOLUCION: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
}

const CustomizedSteppers: FC<CustomizedSteppersProps> = ({ estado }) => {
  const [activeStep, setActiveStep] = useState(0)

  const steps = estado === "DEVOLUCION" ? [...BASE_STEPS, RETURN_STEP] : BASE_STEPS

  useEffect(() => {
    const stepIndex = steps.findIndex((s) => s.status === estado)
    setActiveStep(stepIndex >= 0 ? stepIndex : 0)
  }, [estado, steps])

  const activeStepColor = "from-[#da291c] to-[#b52217]"

  return (
    <div className="w-full mt-6 mb-4 overflow-hidden">
      <div className="flex items-center justify-between relative px-2">
        <div
          className="absolute top-6 h-1 bg-muted rounded-full"
          style={{
            left: "24px",
            right: "24px",
            zIndex: 0,
          }}
        />

        <div
          className={`absolute top-6 h-1 bg-gradient-to-r ${activeStepColor} rounded-full transition-all duration-500`}
          style={{
            left: "24px",
            width: activeStep === 0 ? "0%" : `calc((100% - 48px) * ${activeStep} / ${steps.length - 1})`,
            zIndex: 1,
          }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < activeStep
          const isActive = index === activeStep
          const Icon = stepIcons[step.status as keyof typeof stepIcons]
          const bgColor = stepColors[step.status as keyof typeof stepColors] || "bg-muted text-muted-foreground"

          return (
            <div key={step.status} className="relative flex flex-col items-center flex-1 z-10">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  isActive ? `${bgColor} shadow-lg scale-110` : isCompleted ? bgColor : "bg-muted text-muted-foreground"
                }`}
              >
                {Icon && <Icon size={24} />}
              </div>

              {/* Step Label */}
              <p
                className={`text-xs text-center mt-2 font-medium transition-colors ${
                  isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CustomizedSteppers
