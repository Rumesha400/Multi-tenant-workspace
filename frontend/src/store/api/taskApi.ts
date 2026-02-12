import { baseApi } from "./baseQuery";

export interface CreateTaskPayload {
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  labels?: string[];
  dueDate?: string;
}

export interface GetTasksParams {
  projectId: string;

  search?: string;
  status?: string;
  assigneeId?: string;
  priority?: string;

  page?: number;
  limit?: number;

  labels?: string;
  sortBy?: string;
  order?: "asc" | "desc";

  overdue?: boolean;
  dueToday?: boolean;
}

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<any, GetTasksParams>({
      query: (params) => ({
        url: "/tasks",
        method: "GET",
        params,
      }),
      providesTags: ["Tasks"],
    }),

    createTask: builder.mutation<any, CreateTaskPayload>({
      query: ({ projectId, ...body }) => ({
        url: `/tasks`,
        method: "POST",
        params: { projectId },
        body,
      }),
      invalidatesTags: ["Tasks"],
    }),

    updateTask: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tasks"],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),

    archiveTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}/archive`,
        method: "PATCH",
      }),
      invalidatesTags: ["Tasks"],
    }),

    getProjectActivity: builder.query<any, string>({
      query: (projectId) => ({
        url: `/tasks/${projectId}/activity`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useArchiveTaskMutation,
  useGetProjectActivityQuery,
} = taskApi;
