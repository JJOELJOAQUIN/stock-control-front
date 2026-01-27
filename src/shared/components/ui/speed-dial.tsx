import { useState } from "react";


import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Button } from "./button";

export interface SpeedDialAction {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  tooltipSide?: "left" | "right" | "top" | "bottom";
}

interface SpeedDialProps {
  actions: SpeedDialAction[];
  position?: string; // Tailwind para moverlo (ej: "bottom-6 right-6")
}

export function SpeedDial({
  actions,
  position = "bottom-6 right-6",
}: SpeedDialProps) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div className={`fixed z-50 flex flex-col items-center ${position}`}>
        {/* ACCIONES */}
        <div
          className={`
            flex flex-col items-center mb-4 space-y-2 transition-all
            ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
          `}
        >
          {actions.map((action, index) => (
            <SpeedDialActionButton key={index} {...action} />
          ))}
        </div>

        {/* FAB PRINCIPAL */}
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          onClick={() => setOpen(!open)}
        >
          <Plus
            className={`h-6 w-6 transition-transform ${open ? "rotate-45" : ""}`}
          />
        </Button>
      </div>
    </TooltipProvider>
  );
}

function SpeedDialActionButton({
  label,
  icon,
  onClick,
  variant = "secondary",
  tooltipSide = "left",
}: SpeedDialAction) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={variant}
          className="h-[52px] w-[52px] rounded-full shadow-md flex items-center justify-center"
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>

      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  );
}
