import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";

interface UserDropdownProps {
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  onLogout?: () => void;
  isCollapsed?: boolean;
}

export function UserDropdown({
  userName = "John Doe",
  userEmail = "john@example.com",
  userInitials = "JD",
  onLogout,
  isCollapsed = false,
}: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted cursor-pointer",
            isCollapsed && "justify-center px-0"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted p-3">
            <span className="text-xs font-semibold text-foreground">
              {userInitials}
            </span>
          </div>

          {!isCollapsed && (
            <div className="flex-1 overflow-hidden text-start">
              <p className="truncate text-sm font-medium text-foreground">
                {userName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="start" className="w-56 ">
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
