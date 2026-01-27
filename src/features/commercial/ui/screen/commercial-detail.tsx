import { Banner } from "@/shared/components/ui/banner";
import type { ChartConfig } from "@/shared/components/ui/chart";
import HorizontalBarCard, {
  type BarMetric,
} from "@/shared/components/ui/charts/horizontal-bar-card";
import {
  PieChartBase,
  type PieChartItem,
} from "@/shared/components/ui/charts/pie-chart";


const CommercialDetail = () => {
 

  const barMetricsDummy: BarMetric[] = [
    {
      id: 1,
      label: "Mes Anterior",
      percent: 78,
      color: "bg-primary",
    },
    {
      id: 2,
      label: "Mes Actual",
      percent: 64,
      color: "bg-emerald-500",
    },
    {
      id: 3,
      label: "Proyectado",
      percent: 32,
      color: "bg-blue-500",
    },
    {
      id: 4,
      label: "Mes Base",
      percent: 89,
      color: "bg-purple-500",
    },
  ];
  const pieChartDummyData: PieChartItem[] = [
    {
      id: 1,
      label: "Ventas",
      value: 320,
      fill: "var(--chart-1)",
    },
    {
      id: 2,
      label: "Operaciones",
      value: 210,
      fill: "var(--chart-2)",
    },
    {
      id: 3,
      label: "Logística",
      value: 150,
      fill: "var(--chart-3)",
    },
    {
      id: 4,
      label: "Marketing",
      value: 180,
      fill: "var(--chart-4)",
    },
    {
      id: 5,
      label: "Otros",
      value: 90,
      fill: "var(--chart-5)",
    },
  ];

  const pieChartConfig = {
    value: { label: "Total" },

    Ventas: {
      label: "Ventas",
      color: "var(--chart-1)",
    },
    Operaciones: {
      label: "Operaciones",
      color: "var(--chart-2)",
    },
    Logística: {
      label: "Logística",
      color: "var(--chart-3)",
    },
    Marketing: {
      label: "Marketing",
      color: "var(--chart-4)",
    },
    Otros: {
      label: "Otros",
      color: "var(--chart-5)",
    },
  } satisfies ChartConfig;

  return (
    <div>
      <Banner
        title="Detalle Comercial"
        description="Información detallada del comercial"
      />
      <div className="flex gap-4 h-[350px]">
        <div className="w-4/6 h-full">
          <HorizontalBarCard
            title="Rendimiento de Ventas"
            description="asd"
            metrics={barMetricsDummy}
          />
        </div>

        <div className="w-2/6 h-full">
          <PieChartBase
            title="Tasa de conversión"
            description="Q1 2025"
            data={pieChartDummyData}
            config={pieChartConfig}
            valueKey="value"
            labelKey="label"
          />
        </div>
      </div>
    </div>
  );
};

export default CommercialDetail;
