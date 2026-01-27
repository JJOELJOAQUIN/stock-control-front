import type { ChartConfig } from "../chart";

export interface PieChartItem {
  id?: string | number;
  label: string;
  value: number;
  fill?: string;
  [key: string]: string | number | undefined;
}
export interface PieChartProps {
  title: string;
  description?: string;
  data: PieChartItem[];
  config: ChartConfig;
  valueKey: keyof PieChartItem; // "value"
  labelKey: keyof PieChartItem; // "label"
  size?: number; // max-height / tamaño
  footer?: React.ReactNode; // footer opcional
}

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../chart";
import { Pie, PieChart } from "recharts";

export function PieChartBase({
  title,
  description,
  data,
  config,
  valueKey,
  labelKey,
  size = 250,
  footer,
}: PieChartProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto"
          style={{ maxHeight: size }}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey={valueKey as string}
              nameKey={labelKey as string}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>

      {footer && (
        <CardFooter className="flex-col gap-2 text-sm">{footer}</CardFooter>
      )}
    </Card>
  );
}
