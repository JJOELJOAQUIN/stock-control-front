// features/users/models/app-user.ts
export type AppRole = "ADMIN" | "USER" | "COSMETOLOGA" | "PENDING"

export interface AppUser {
  firebaseUid: string
  email: string
  role: AppRole
  enabled: boolean
}