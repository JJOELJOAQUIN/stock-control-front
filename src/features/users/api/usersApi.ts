import { baseApi } from "@/core/api/baseApi";
import type { GenericResponse } from "@/features/tracking/models/afiliate";
import type { UserData } from "@/features/tracking/models/afiliate";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // CREATE
    createUser: builder.mutation<
      GenericResponse,
      { formData: Partial<UserData> }
    >({
      query: ({ formData }) => ({
        url: "/api/backoffice/",
        method: "POST",
        body: formData,
      }),
    }),

    // LIST
    getUsers: builder.mutation<
      GenericResponse,
      { page?: number; per_page?: number }
    >({
      query: ({ page = 0, per_page = 100 }) => ({
        url: "/api/backoffice/list",
        method: "POST",
        body: {
          limit: per_page,
          offset: page,
        },
      }),
    }),

    // UPDATE
    updateUser: builder.mutation<
      GenericResponse,
      { userId: string; formData: Partial<UserData> }
    >({
      query: ({ userId, formData }) => ({
        url: `/api/backoffice/${userId}`,
        method: "PUT",
        body: formData,
      }),
    }),

    // DELETE
    deleteUser: builder.mutation<
      GenericResponse,
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/api/backoffice/${userId}`,
        method: "DELETE",
      }),
    }),

  }),
});

export const {
  useCreateUserMutation,
  useGetUsersMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
