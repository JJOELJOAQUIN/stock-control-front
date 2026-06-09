import { baseApi } from "@/core/api/baseApi"
import type { AppRole, AppUser } from "../models/app-user"

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<AppUser[], void>({
      query: () => ({
        url: "/api/admin/users",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    updateUserRole: builder.mutation<
      void,
      { firebaseUid: string; role: AppRole }
    >({
      query: ({ firebaseUid, role }) => ({
        url: `/api/admin/users/${firebaseUid}/role`,
        method: "POST",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} = usersApi