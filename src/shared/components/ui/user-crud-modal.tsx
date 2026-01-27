// UserCrudModal.tsx
import { GenericCrudModal } from "@/shared/components/ui/generic-crud-modal"
import type { CrudField } from "@/shared/components/ui/generic-crud-modal"
import { toast } from "sonner"
import type { UserData } from "@/features/tracking/models/afiliate"
import { useMemo } from "react"

interface UserCrudModalProps {
    open: boolean
    onClose: () => void
    editingUser: UserData | null
    handleCreateUser: (payload: any) => Promise<void>
    handleUpdateUser: (id: string, payload: any) => Promise<void>
    reloadFirstPage: () => void
}

export default function UserCrudModal({
    open,
    onClose,
    editingUser,
    handleCreateUser,
    handleUpdateUser,
    reloadFirstPage,
}: UserCrudModalProps) {
    const fields: CrudField[] = [
        { name: "name", label: "Nombre", type: "text", required: true },
        { name: "lastname", label: "Apellido", type: "text", required: true },
        { name: "email", label: "Email", type: "text", required: true },
        {
            name: "password",
            label: "Contraseña",
            type: "password",
            required: true,
        },
        {
            name: "role",
            label: "Rol",
            type: "select",
            options: ["ADMIN", "USER"],
            required: true,
        },
        { name: "created_by", label: "Creado por", type: "text" },
        { name: "card_codes", label: "Card Codes", type: "taglist" },
    ]

    const initialValues = useMemo(
        () =>
            editingUser
                ? {
                    ...editingUser,
                    password: "",
                    card_codes: editingUser.filters?.card_codes ?? [],
                }
                : {},
        [editingUser]
    )

    

    return (
        <GenericCrudModal
            open={open}
            onClose={onClose}
            fields={fields}
            initialValues={initialValues}
            title={editingUser ? "Editar Usuario" : "Crear Usuario"}
            isEditing={!!editingUser}
            onSubmit={async (form) => {
                if (editingUser) {
                    await handleUpdateUser(editingUser.f_uid, form)
                    toast.success("Usuario actualizado correctamente!")
                } else {
                    await handleCreateUser(form)
                    toast.success("Usuario creado correctamente!")
                }

                reloadFirstPage()
                onClose()
            }}
        />
    )
}
