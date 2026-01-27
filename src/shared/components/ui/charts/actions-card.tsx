
import { type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";

export interface QuickAction {
  id: string | number;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

export interface QuickActionsCardProps {
  title: string;
  description?: string;
  actions: QuickAction[];
}

export default function QuickActionsCard({
  title,
  description,
  actions,
}: QuickActionsCardProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={a.onClick}
            className="
              flex w-full items-center gap-3 rounded-lg border border-border
              bg-background px-4 py-3 text-left text-sm font-medium 
              text-foreground hover:bg-muted transition-colors
            "
          >
            <div className="h-4 w-4 text-muted-foreground">
              {a.icon}
            </div>
            {a.label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
