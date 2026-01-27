// src/shared/components/filters/FieldInput.tsx

import type { ControllerRenderProps } from "react-hook-form";
import { Input } from "../ui/input";
import type { FieldConfig } from "../generic-filter/generic-filter-modal";

type Props<T extends Record<string, any>> = {
  rhf: ControllerRenderProps<Partial<T>, any>;
  field: FieldConfig<T>;
};

export function FieldInput<T extends Record<string, any>>({
  rhf,
  field,
}: Props<T>) {
  const { type, placeholder, parse, props } = field;

  // Mapeo exacto de tipos
  const resolvedType =
    type === "date"
      ? "date"
      : type === "number"
      ? "number"
      : "text";

  return (
    <Input
      name={rhf.name}
      ref={rhf.ref}
      type={resolvedType}
      value={rhf.value}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value;
        rhf.onChange(parse ? parse(raw) : raw);
      }}
      onBlur={rhf.onBlur}
      {...props}
    />
  );
}
