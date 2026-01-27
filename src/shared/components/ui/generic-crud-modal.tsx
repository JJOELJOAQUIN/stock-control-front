import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/shared/components/ui/select"
import { Controller, useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export interface CrudField {
    name: string
    label: string
    type: "text" | "select" | "password" | "taglist"
    required?: boolean
    options?: string[]

}

export function GenericCrudModal({
    open,
    title,
    onClose,
    fields,
    initialValues = {},
    onSubmit,
    isEditing = false,

}: {
    open: boolean
    title: string
    onClose: () => void
    fields: CrudField[]
    initialValues?: Record<string, any>
    onSubmit: (data: any) => Promise<void>
    isEditing?: boolean
}) {




    const [submitting, setSubmitting] = useState(false)
    const {
        handleSubmit,
        register,
        control,
        reset,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: initialValues,
        mode: "onChange",
    })



    // Reset cuando abre
    useEffect(() => {
        if (open) reset(initialValues)
    }, [open, initialValues, reset])

    const onSubmitForm = async (data: any) => {
        setSubmitting(true)
        try {
            await onSubmit(data)
        } catch (err: any) {
            const backendMsg =
                err?.data?.message ||
                err?.message ||
                "Ha ocurrido un error inesperado."
            toast.error(backendMsg)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right" className="max-w-[500px] p-0 flex flex-col">
            
                    <SheetHeader className="border-b">
                        <SheetTitle className="text-xl font-semibold tracking-tight">
                            {title}
                        </SheetTitle>
                    </SheetHeader>
              

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <form
                        key={initialValues?.f_uid ?? "new"}
                        onSubmit={handleSubmit(onSubmitForm)}
                        className="flex flex-col gap-6"
                    >
                        {fields.map((f) => {
                            if (f.type === "select") {
                                return (
                                    <div key={f.name} className="flex flex-col gap-2">
                                        <Label className="font-medium text-[15px]">{f.label}</Label>
                                        <Controller
                                            control={control}
                                            name={f.name}
                                            rules={{
                                                required: f.required ? "Campo obligatorio" : false,
                                            }}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || ""}
                                                >
                                                    <SelectTrigger
                                                        className={`h-10 rounded-md ${errors[f.name] ? "border-red-500" : ""
                                                            }`}
                                                    >
                                                        <SelectValue placeholder={f.label} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {f.options?.map((op) => (
                                                            <SelectItem key={op} value={op}>
                                                                {op}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors[f.name] && (
                                            <p className="text-sm text-red-500">
                                                {String(errors[f.name]?.message)}
                                            </p>
                                        )}
                                    </div>
                                )
                            }

                            return (
                                <div key={f.name} className="flex flex-col gap-2">
                                    <Label className="font-medium text-[15px]">{f.label}</Label>
                                    <Input
                                        {...register(f.name, {
                                            required: f.required ? "Campo obligatorio" : false,
                                            ...(f.name === "email"
                                                ? {
                                                    pattern: {
                                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                        message: "Email inválido",
                                                    },
                                                }
                                                : {}),
                                            ...(f.type === "password"
                                                ? {
                                                    validate: (value) => {

                                                        if (!isEditing && !value) return "La contraseña es obligatoria"


                                                        if (isEditing && value && value.length < 6)
                                                            return "La contraseña debe tener mínimo 6 caracteres"

                                                        return true
                                                    },
                                                }
                                                : {}),
                                        })}
                                        type={f.type}
                                        className={`h-10 rounded-md ${errors[f.name] ? "border-red-500" : ""
                                            }`}
                                    />
                                    {errors[f.name] && (
                                        <p className="text-sm text-red-500">
                                            {String(errors[f.name]?.message)}
                                        </p>
                                    )}
                                </div>
                            )
                        })}

                        <Button
                            type="submit"
                            className="w-full h-11 text-[15px] font-semibold"

                            disabled={submitting || !isValid}
                        >
                            {submitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    )
}
