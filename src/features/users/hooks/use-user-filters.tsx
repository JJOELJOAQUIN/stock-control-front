import { useState } from "react"

export interface UserFilters {
  name: string
  email: string
  role: string
}

export function useUsersFilters() {
  const [open, setOpen] = useState(false)

  const [filters, setFilters] = useState<UserFilters>({
    name: "",
    email: "",
    role: "",
  })

  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const handleApply = (newFilters: UserFilters) => {
    setFilters(newFilters)
    closeModal()
  }

  return {
    open,
    openModal,
    closeModal,
    filters,
    handleApply,
  }
}
