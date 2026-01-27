// UsersPage.tsx
import { useState } from "react"
import { Banner } from "@/shared/components/ui/banner"
import { Button } from "@/shared/components/ui/button"
import { Pencil, Trash, MoreHorizontal, Plus } from "lucide-react"
import TableWrapper from "@/shared/components/ui/table-wrapper"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu"

import { DeleteUserDialog } from "@/shared/components/ui/users-delete-dialog"
import UserCrudModal from "@/shared/components/ui/user-crud-modal"

import { useModal } from "@/shared/hooks/use-modal"
import { useUsers } from "@/features/users/hooks/use-users"

import type { UserData } from "@/features/tracking/models/afiliate"
import { toast } from "sonner"

export default function UsersPage() {
  const { open, openModal, closeModal } = useModal()

  const {
    data,
    handleDeleteUser,
    handleChangePage,
    handleChangeRowsPerPage,
    error,
    isLoading,
    page,
    rowsPerPage,
    totalCount,
    refetchUsers,
    handleCreateUser,
    handleUpdateUser,
    reloadFirstPage,
  } = useUsers()

  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const openCreate = () => {
    setEditingUser(null)
    openModal()
  }

  const openEdit = (row: UserData) => {
    setEditingUser(row)
    openModal()
  }

  const confirmDelete = async () => {
    if (!deletingUser) return

    try {
      setIsDeleting(true)
      await handleDeleteUser(deletingUser.f_uid)
      toast.success("Usuario eliminado correctamente")
      setDeletingUser(null)
    } catch (error) {
      toast.error("Error al eliminar el usuario")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const userColumns = [
    { field: "name", headerName: "Nombre" },
    { field: "lastname", headerName: "Apellido" },
    { field: "email", headerName: "Email" },
    { field: "role", headerName: "Rol" },
    {
      field: "filters",
      headerName: "Card Codes",
      render: (_: any, row: UserData) =>
        row.filters?.card_codes?.join(", ") || "-",
    },
    {
      field: "actions",
      headerName: "Acciones",
      render: (_: any, row: UserData) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => openEdit(row)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600"
              onClick={() => setDeletingUser(row)}
            >
              <Trash className="h-4 w-4 mr-2" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <Banner title="Usuarios" description="Administración del Backoffice.">
        <Button className="bg-button-gradient" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Agregar Usuario
        </Button>
      </Banner>

      <TableWrapper
        columns={userColumns}
        rows={data}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        isLoading={isLoading}
        isError={!!error}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onRetry={refetchUsers}
      />

      <UserCrudModal
        open={open}
        onClose={closeModal}
        editingUser={editingUser}
        handleCreateUser={handleCreateUser}
        handleUpdateUser={handleUpdateUser}
        reloadFirstPage={reloadFirstPage}
      />

      <DeleteUserDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
        user={deletingUser}
        isLoading={isDeleting}
      />
    </>
  )
}
