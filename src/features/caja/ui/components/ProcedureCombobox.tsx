import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import type { ProcedureOption } from "../../types/cash.types";
import { filterProcedures } from "@/lib/peeling";


type Props = {
  procedures: ProcedureOption[];
  value: string;
  onChange: (code: string) => void;
};

export function ProcedureCombobox({ procedures, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => procedures.find((p) => p.code === value),
    [procedures, value]
  );
  const results = useMemo(() => filterProcedures(procedures, search), [procedures, search]);

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{selected?.label ?? "Seleccionar procedimiento"}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] bg-background p-0 shadow-md" align="start">
        <div className="relative border-b">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            autoFocus
            className="border-0 pl-9 shadow-none focus-visible:ring-0"
            placeholder="Buscar procedimiento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1" role="listbox">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sin resultados</p>
          ) : (
            results.map((item) => (
              <button
                key={item.code}
                type="button"
                role="option"
                aria-selected={item.code === value}
                onClick={() => handleSelect(item.code)}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                  item.code === value && "bg-accent"
                )}
              >
                <span className="truncate">{item.label}</span>
                {item.code === value && <Check className="ml-2 size-4 shrink-0" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}