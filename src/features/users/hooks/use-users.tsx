import { toast } from "sonner"
import type { AppRole, AppUser } from "../models/app-user"
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} from "../api/usersApi"

export interface UserTableRow extends AppUser {
  id: string
}

export function useUsers() {
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useGetUsersQuery()

  const [updateUserRole, { isLoading: isUpdatingRole }] =
    useUpdateUserRoleMutation()

  const normalizedData: AppUser[] = Array.isArray(data)
    ? data
    : data
      ? [data]
      : []

  const rows: UserTableRow[] = normalizedData.map((user) => ({
    ...user,
    id: user.firebaseUid,
  }))

  const handleUpdateUserRole = async (
    firebaseUid: string,
    role: AppRole
  ) => {
    try {
      await updateUserRole({ firebaseUid, role }).unwrap()
      toast.success("Rol actualizado correctamente")
    } catch (error) {
      console.error(error)
      toast.error("No se pudo actualizar el rol")
    }
  }

  return {
    data: rows,
    error,
    isLoading,
    isUpdatingRole,

    page: 0,
    rowsPerPage: rows.length || 10,
    totalCount: rows.length,

    handleChangePage: () => {},
    handleChangeRowsPerPage: () => {},
    refetchUsers: refetch,
    handleUpdateUserRole,
  }
}