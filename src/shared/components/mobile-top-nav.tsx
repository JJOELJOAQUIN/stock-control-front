// src/shared/layouts/components/MobileTopNav.tsx
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type Props = {
  showBackButton?: boolean;
  onBack?: () => void;
};

export function MobileTopNav({ showBackButton = true, onBack }: Props) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <span className="font-semibold">Stock Control</span>
      </div>

      <Menu className="h-5 w-5 text-muted-foreground" />
    </header>
  );
}