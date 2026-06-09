// UsersPage.tsx
import { Banner } from "@/shared/components/ui/banner"
import TableWrapper from "@/shared/components/ui/table-wrapper"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

import { useUsers, type UserTableRow } from "@/features/users/hooks/use-users"
import type { AppRole } from "@/features/users/models/app-user"

const ROLES: AppRole[] = ["ADMIN", "USER", "COSMETOLOGA", "PENDING"]

export default function UsersPage() {
  const {
    data,
    error,
    isLoading,
    isUpdatingRole,
    page,
    rowsPerPage,
    totalCount,
    refetchUsers,
    handleChangePage,
    handleChangeRowsPerPage,
    handleUpdateUserRole,
  } = useUsers()

  const userColumns = [
    {
      field: "email",
      headerName: "Email",
    },
    {
      field: "firebaseUid",
      headerName: "Firebase UID",
      render: (_: any, row: UserTableRow) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.firebaseUid}
        </span>
      ),
    },
    {
      field: "role",
      headerName: "Rol",
      render: (_: any, row: UserTableRow) => (
        <Select
          value={row.role}
          disabled={isUpdatingRole}
          onValueChange={(value) =>
            handleUpdateUserRole(row.firebaseUid, value as AppRole)
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>

          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      field: "enabled",
      headerName: "Estado",
      render: (_: any, row: UserTableRow) =>
        row.enabled ? "Activo" : "Inactivo",
    },
  ]

  return (
    <>
      <Banner
        title="Usuarios"
        description="Administración de roles y accesos del sistema."
      />

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
    </>
  )
}