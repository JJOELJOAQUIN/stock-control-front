// useFilters.ts
import useModal from "@/shared/hooks/use-modal";
import { useCallback, useMemo, useState } from "react";


const isEmpty = (v: any) =>
  v === undefined ||
  v === null ||
  v === "" ||
  (Array.isArray(v) && v.length === 0);

const defaultClean = <T extends Record<string, any>>(obj: Partial<T>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => !isEmpty(v))
  ) as Partial<T>;

export type UseFiltersOptions<T extends Record<string, any>> = {
  initialFilters?: Partial<T>;
  initialActiveFields?: Array<keyof T & string>;
  cleaner?: (obj: Partial<T>) => Partial<T>; // override si querés otra lógica
  syncActiveFieldsFromPayload?: boolean; // true: chips = keys con valor
};

export default function useFilters<T extends Record<string, any>>({
  initialFilters = {},
  initialActiveFields = [],
  cleaner = defaultClean<T>,
  syncActiveFieldsFromPayload = true,
}: UseFiltersOptions<T> = {}) {
  const [filters, setFilters] = useState<Partial<T>>(initialFilters);
  const [activeFields, setActiveFields] =
    useState<Array<keyof T & string>>(initialActiveFields);

  const { open, setOpen, openModal, closeModal } = useModal();

  const handleApply = useCallback(
    (data: Partial<T>) => {
      const payload = cleaner(data);
      setFilters(payload);
      if (syncActiveFieldsFromPayload) {
        setActiveFields(Object.keys(payload) as Array<keyof T & string>);
      }
    },
    [cleaner, syncActiveFieldsFromPayload]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setActiveFields([]);
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setActiveFields((prev) => prev.filter((k) => k !== key));
  }, []);

  const queryArgs = useMemo(() => cleaner(filters), [filters, cleaner]);

  return {
    filters,
    setFilters,
    activeFields,
    setActiveFields,
    handleApply,
    clearFilters,
    removeFilter,
    queryArgs,
    open,
    setOpen,
    openModal,
    closeModal,
  };
}

export function makeFiltersHook<T extends Record<string, any>>(
  opts?: UseFiltersOptions<T>
) {
  // devuelve un hook ya tipado y con defaults ligados
  return function useTypedFilters() {
    return useFilters<T>(opts);
  };
}
