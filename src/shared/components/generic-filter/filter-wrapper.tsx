// src/shared/components/filters/FilterWrapper.tsx
import { toast } from "sonner"; // shadcn

import type { DefaultValues } from "react-hook-form";
import GenericFilterModal, { type FieldConfig } from "./generic-filter-modal.tsx";

export type FilterWrapperProps<T extends Record<string, any>> = {
  open: boolean;
  onClose: () => void;
  onApply: (data: Partial<T>) => void | Promise<void>;
  fields: FieldConfig<T>[];
  defaultValues?: DefaultValues<Partial<T>>;
  title?: string;
  columns?: number;
  requireAtLeastOne?: boolean;
  onEmptyMessage?: string;
  activeFields?: Array<keyof T & string>;
  onChange?: (data: Partial<T>) => void;
};

export default function FilterWrapper<T extends Record<string, any>>({
  open,
  onClose,
  onApply,
  fields,
  defaultValues,
  title = "Filtros",
  columns = 2,
  requireAtLeastOne = true,
  onEmptyMessage = "Debe completar un campo para poder ejecutar la búsqueda.",
  activeFields,
  onChange,
}: FilterWrapperProps<T>) {
  return (
    <GenericFilterModal<T>
      open={open}
      onClose={onClose}
      title={title}
      fields={fields}
      defaultValues={defaultValues}
      columns={columns}
      requireAtLeastOne={requireAtLeastOne}
      onEmptySubmit={() =>
        toast.error(onEmptyMessage, {
          duration: 3000,
        })
      }
      onApply={onApply}
      activeFields={activeFields}
      onChange={onChange}
    />
  );
}

export function makeFilterWrapper<T extends Record<string, any>>(cfg: {
  title?: string;
  fields: FieldConfig<T>[];
  defaultValues?: DefaultValues<Partial<T>>;
  columns?: number;
}) {
  return function BoundFilterWrapper(
    props: Omit<
      FilterWrapperProps<T>,
      "fields" | "defaultValues" | "title" | "columns"
    >
  ) {
    return (
      <FilterWrapper<T>
        {...props}
        title={cfg.title}
        fields={cfg.fields}
        defaultValues={cfg.defaultValues}
        columns={cfg.columns}
      />
    );
  };
}

export const defineFields =
  <T extends Record<string, any>>() =>
  <U extends FieldConfig<T>[]>(u: U) =>
    u;
