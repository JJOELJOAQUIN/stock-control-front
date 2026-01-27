
import { type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";

export interface ActivityItem {
  id: string | number;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export interface ActivityListCardProps {
  title: string;
  description?: string;
  items: ActivityItem[];
}

export default function ActivityListCard({
  title,
  description,
  items,
}: ActivityListCardProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            {item.icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                {item.icon}
              </div>
            )}

            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
