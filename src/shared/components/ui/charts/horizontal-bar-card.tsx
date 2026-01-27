import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";


export interface BarMetric {
  id: string | number;
  label: string;
  percent: number; // 0–100
  color?: string; // tailwind class (ej: bg-primary, bg-chart-2)
}

export interface HorizontalBarCardProps {
  title: string;
  description?: string;
  metrics: BarMetric[];
}

export default function HorizontalBarCard({
  title,
  description,
  metrics,
}: HorizontalBarCardProps) {
  return (
    <Card className="border-border h-full">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {metrics.map((m) => (
          <div key={m.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-medium text-foreground">
                {m.percent}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full ${m.color ?? "bg-primary"}`}
                style={{ width: `${m.percent}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
