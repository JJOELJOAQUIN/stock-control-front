"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import type { UserData } from "@/features/tracking/models/afiliate"

interface DeleteUserDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  user?: UserData | null
  isLoading?: boolean
}

export function DeleteUserDialog({ open, onClose, onConfirm, user, isLoading = false }: DeleteUserDialogProps) {
  const [confirmValue, setConfirmValue] = useState("")

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmValue("")
    }
    onClose()
  }

  const isConfirmed = confirmValue.trim() === user?.name

  const handleConfirm = () => {
    if (!isConfirmed) return
    setConfirmValue("")
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <DialogTitle className="text-destructive">¿Eliminar usuario?</DialogTitle>
          </div>
          {user && (
            <DialogDescription className="text-base font-medium text-foreground">
              {user.name} {user.lastname}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              Estás a punto de eliminar a{" "}
              <span className="font-bold">
                {user?.name} {user?.lastname}
              </span>
              .
            </p>
            {user?.email && (
              <p className="text-sm text-muted-foreground">
                Correo: <strong>{user.email}</strong>
              </p>
            )}
            {user?.role && (
              <p className="text-sm text-muted-foreground">
                Rol: <strong>{user.role}</strong>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-name" className="text-sm">
              Escribe el nombre <span className="font-bold">{user?.name}</span> para confirmar
            </Label>
            <Input
              id="confirm-name"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder="Ingresa el nombre del usuario"
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          <Alert variant="destructive" className="bg-destructive/10">
            <AlertTitle className="text-sm">Advertencia</AlertTitle>
            <AlertDescription className="text-sm">Esta acción es permanente y no se puede deshacer.</AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>

          <Button variant="destructive" onClick={handleConfirm} disabled={!isConfirmed || isLoading}>
            {isLoading ? "Eliminando..." : "Eliminar usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
