
import type { ReactNode } from "react";
import { DialogFooter, DialogHeader,  Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger  } from "./dialog";

interface DialogWrapperProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function DialogWrapper({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  className,
}: DialogWrapperProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-2">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
