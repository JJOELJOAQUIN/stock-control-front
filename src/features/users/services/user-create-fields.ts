import { defineFields } from "@/shared/components/generic-filter/filter-wrapper"
import type { UserCreatePayload } from '../models/user-create-payload';


export const userCreateFields = defineFields<UserCreatePayload>()([
  { name: "name", label: "Nombre", type: "text" },
  { name: "lastname", label: "Apellido", type: "text" },

  { name: "email", label: "Email", type: "text" },

  {
    name: "role",
    label: "Rol",
    type: "select",
    options: [
      { label: "ADMIN", value: "ADMIN" },
      { label: "USER", value: "USER" },
    ],
  },

  { name: "password", label: "Contraseña", type: "text" },

  { name: "created_by", label: "Creado por", type: "text" },

  // 🌟 NUEVO: lista dinámica de card codes
  { name: "card_codes", label: "Card Codes", type: "taglist" },
])
