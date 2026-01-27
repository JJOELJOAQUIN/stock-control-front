// usePagination.ts
import { useState } from "react";

export default function usePagination() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (newSize: number) => {
    setRowsPerPage(newSize)
    setPage(0)
  }

  return {
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  }
}