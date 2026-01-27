import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FieldInput } from "../ui/field-input";

type FieldType = "text" | "number" | "select" | "date" | "taglist";

type Option<
  V extends string | number | undefined = string | number | undefined
> = {
  value: V;
  label: string;
};

export type FieldConfig<T extends Record<string, any>> = {
  name: keyof T & string;
  label: string;
  type?: FieldType;
  options?: Option[];
  placeholder?: string;
  parse?: (raw: any) => any;
  props?: Record<string, any>;
};

export type GenericFilterModalProps<T extends Record<string, any>> = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onApply: (data: Partial<T>) => void | Promise<void>;
  fields: FieldConfig<T>[];
  defaultValues?: Partial<T>;
  columns?: number;
  requireAtLeastOne?: boolean;
  onEmptySubmit?: () => void;
  activeFields?: Array<keyof T & string>;
  onChange?: (data: Partial<T>) => void;
};

const isEmpty = (v: any) =>
  v === undefined ||
  v === null ||
  v === "" ||
  (Array.isArray(v) && v.length === 0);

export function GenericFilterModal<T extends Record<string, any>>({
  open,
  title = "Filtros",
  onClose,
  onApply,
  fields,
  defaultValues,
  columns = 2,
  requireAtLeastOne = true,
  onEmptySubmit,
  activeFields,
  onChange,
}: GenericFilterModalProps<T>) {
  const { control, handleSubmit, getValues, watch, setValue } = useForm<
    Partial<T>
  >({
    defaultValues: (defaultValues as DefaultValues<Partial<T>>) ?? undefined,
    shouldUnregister: false,
  });

  const prevDefaultsRef = useRef<Partial<T> | undefined>(undefined);
  const prevActiveFieldsRef = useRef<Array<keyof T & string> | undefined>(
    undefined
  );
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!onChange) return;
    const sub = watch((value) => onChange(value as Partial<T>));
    return () => sub.unsubscribe();
  }, [watch, onChange]);

  useEffect(() => {
    if (isFirstRender.current) {
      prevDefaultsRef.current = (defaultValues ?? {}) as Partial<T>;
      prevActiveFieldsRef.current = activeFields ?? [];
      isFirstRender.current = false;
      return;
    }

    const prevDefaults = (prevDefaultsRef.current ?? {}) as Partial<T>;
    const currDefaults = (defaultValues ?? {}) as Partial<T>;

    const removedByDefaults = Object.keys(prevDefaults).filter(
      (k) => !(k in currDefaults)
    );

    const prevAct = prevActiveFieldsRef.current ?? [];
    const currAct = activeFields ?? [];
    const removedByChips = prevAct.filter((k) => !currAct.includes(k as any));

    const toClear = new Set<string>([
      ...removedByDefaults,
      ...removedByChips.map(String),
    ]);

    for (const f of fields) {
      const name = f.name as string;

      if (toClear.has(name)) {
        setValue(
          name as any,
          (defaultValues as any)?.[name] ?? (f.type === "number" ? null : ""),
          { shouldDirty: false, shouldTouch: false, shouldValidate: false }
        );
        continue;
      }

      const prevVal = (prevDefaults as any)[name];
      const currVal = (currDefaults as any)[name];
      if (prevVal !== currVal && name in currDefaults) {
        setValue(name as any, currVal, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    }

    prevDefaultsRef.current = currDefaults;
    prevActiveFieldsRef.current = currAct;
  }, [defaultValues, activeFields, fields, setValue]);

  useEffect(() => {
    if (!activeFields || activeFields.length === 0) return;

    const current = getValues();
    for (const f of fields) {
      const val = (current as any)[f.name];
      if (val == null) {
        setValue(
          f.name as any,
          (defaultValues as any)?.[f.name] ?? (f.type === "number" ? null : ""),
          { shouldDirty: false, shouldTouch: false, shouldValidate: false }
        );
      }
    }
  }, [activeFields, fields, getValues, setValue, defaultValues]);

  const fallbackFor = (f: FieldConfig<T>) => {
    const dv = (defaultValues as any)?.[f.name];
    if (dv !== undefined) return dv;
    switch (f.type) {
      case "number":
        return null;
      case "date":
      case "select":
      case "text":
      default:
        return "";
    }
  };

  const buildPayload = (formData: Partial<T>) => {
    const out = {} as Partial<T>;
    for (const f of fields) {
      const raw = (formData as any)[f.name];
      const val = isEmpty(raw) ? fallbackFor(f) : raw;
      (out as any)[f.name] = f.parse ? f.parse(val) : val;
    }
    return out;
  };

  const onSubmit = async (data: Partial<T>) => {
    const payload = buildPayload(data);

    if ("farmacia_confirmada" in payload) {
      const val = (payload as any).farmacia_confirmada;
      if (val === "ALL" || val === "") {
        (payload as any).farmacia_confirmada = null;
      } else if (val === "true") {
        (payload as any).farmacia_confirmada = true;
      } else if (val === "false") {
        (payload as any).farmacia_confirmada = false;
      }
    }

    if (requireAtLeastOne) {
      const hasAny = Object.entries(payload).some(([key, val]) => {
        if (key === "farmacia_confirmada") return true;
        return !isEmpty(val);
      });

      if (!hasAny) {
        onEmptySubmit?.();
        return;
      }
    }

    await onApply(payload);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] sm:w-[700px] ">
        <SheetHeader className="border-b">
          <SheetTitle className="text-xl font-semibold tracking-tight">{title}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 px-6">
          <div
            className="flex flex-col gap-4 "
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
            }}
          >
            {fields.map((field) => {
              // SELECT
              if (field.type === "select" && field.options) {
                return (
                  <div key={field.name} className="flex flex-col gap-1">
                    <Label>{field.label}</Label>
                    <Controller
                      name={field.name as any}
                      control={control}
                      render={({ field: rhf }) => (
                        <Select
                          value={
                            rhf.value === undefined || rhf.value === null
                              ? "ALL"
                              : String(rhf.value)
                          }
                          onValueChange={(val) => {
                            rhf.onChange(field.parse ? field.parse(val) : val);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Seleccione</SelectItem>
                            {field.options!.map((opt) => (
                              <SelectItem
                                key={`${field.name}-${opt.value}`}
                                value={String(opt.value)}
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                );
              }

              // DATE
              if (field.type === "date") {
                return (
                  <div key={field.name} className="flex flex-col gap-1 ">
                    <Label>{field.label}</Label>
                    <Controller
                      name={field.name as any}
                      control={control}
                      render={({ field: rhf }) => (
                        <Input
                          {...rhf}
                          type="date"
                          onChange={(e) => {
                            const raw = e.target.value;
                            rhf.onChange(field.parse ? field.parse(raw) : raw);
                          }}
                          {...(field.props ?? {})}
                        />
                      )}
                    />
                  </div>
                );
              }

              // TEXT / NUMBER
              return (
                <div key={field.name} className="flex flex-col gap-1">
                  <Label>{field.label}</Label>
                  <Controller
                    name={field.name as any}
                    control={control}
                    render={({ field: rhf }) => (
                      <FieldInput rhf={rhf} field={field} />
                    )}
                  />
                </div>
              );
            })}
          </div>

          <SheetFooter className="flex justify-end gap-2">
            {/* <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </SheetClose> */}

            <Button
              className="cursor-pointer
              text-primary-foreground
              bg-[linear-gradient(90deg,#da291c_3.17%,#b52217_100%)]"
              type="submit"
            >
              Aplicar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default GenericFilterModal;
