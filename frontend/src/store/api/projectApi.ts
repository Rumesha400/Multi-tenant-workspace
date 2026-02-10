import type { Project, ProjectMember } from "@/types";
import { baseApi } from "./baseQuery";

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => "/projects",
      providesTags: ["Projects"],
    }),

    createProject: builder.mutation({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Projects"],
    }),

    getProjectMembers: builder.query<ProjectMember[], string>({
      query: (projectId) => `/projects/${projectId}/members`,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetProjectMembersQuery,
} = projectApi;
