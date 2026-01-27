import { useEffect, useState } from "react"
import type { UserData } from "@/features/tracking/models/afiliate"
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersMutation,
  useUpdateUserMutation,
} from "@/features/users/api/usersApi"

export interface UsersMetadata {
  page: number
  per_page: number
  count: number
  total_pages: number
  total_count: number
}

export function useUsers() {
  const [data, setData] = useState<UserData[]>([])
  const [metadata, setMetadata] = useState<UsersMetadata>({
    page: 0,
    per_page: 10,
    count: 0,
    total_pages: 1,
    total_count: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [getUsers] = useGetUsersMutation()
  const [createUser] = useCreateUserMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [updateUser] = useUpdateUserMutation()

  // --------------------
  // Params de paginación
  // --------------------
  const [params, setParams] = useState({
    limit: metadata.per_page,
    offset: metadata.page,
  })

  // --------------------
  // 🔁 Contador de refetch
  // --------------------
  const [refetchIndex, setRefetchIndex] = useState(0)
  const refetchUsers = () => setRefetchIndex((i) => i + 1)

  const resetToFirstPage = () => {
    setParams((prev) => ({ ...prev, offset: 0 }))
  }

  const reloadFirstPage = () => {
    resetToFirstPage()
    refetchUsers()
  }

  // --------------------
  // FETCH AUTOMÁTICO
  // --------------------
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getUsers({
          page: params.offset,
          per_page: params.limit,
        }).unwrap()

        const mapped: UserData[] = (response.users ?? []).map((u: any) => ({
          ...u,
          card_codes: u?.filters?.card_codes ?? [],
        }))

        setData(mapped)

        const rawMeta = (response.metadata as Partial<UsersMetadata>) ?? {}

        const meta: UsersMetadata = {
          page: rawMeta.page ?? 0,
          per_page: rawMeta.per_page ?? params.limit,
          count: rawMeta.count ?? mapped.length,
          total_pages: rawMeta.total_pages ?? 1,
          total_count: rawMeta.total_count ?? mapped.length,
        }

        setMetadata(meta)
      } catch (err) {
        console.error(err)
        setError("Error fetching users")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [params.limit, params.offset, refetchIndex, getUsers])
  // 👆 ahora sí se ejecuta cuando realmente queremos, aunque el offset no cambie

  // --------------------
  // Acciones CRUD
  // --------------------
  const handleCreateUser = async (payload: any) => {
    await createUser({ formData: payload }).unwrap()
    refetchUsers()
  }

  const handleDeleteUser = async (userId: string) => {
    await deleteUser({ userId }).unwrap()
    refetchUsers()
  }

  const handleUpdateUser = async (userId: string, payload: any) => {
    await updateUser({ userId, formData: payload }).unwrap()
    refetchUsers()
  }

  return {
    data,
    error,
    isLoading,

    page: metadata.page,
    rowsPerPage: metadata.per_page,
    totalCount: metadata.total_count,
    totalPages: metadata.total_pages,

    handleChangePage: (p: number) =>
      setParams((prev) => ({ ...prev, offset: p })),

    handleChangeRowsPerPage: (r: number) =>
      setParams({ limit: r, offset: 0 }),

    // acciones
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,

    refetchUsers,
    resetToFirstPage,
    reloadFirstPage,
  }
}
