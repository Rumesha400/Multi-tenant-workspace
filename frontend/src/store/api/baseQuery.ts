import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "..";
import { logout } from "../slices/authSlice";
// import { toast } from "sonner";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://127.0.0.1:8000",
  timeout: 120000,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // Determine the request URL to avoid redirecting on login failures
  const requestUrl = typeof args === "string" ? args : args.url;

  if (result.error?.status === 401 && !requestUrl.includes("/auth/login")) {
    api.dispatch(logout());
    window.location.href = "/login";
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithAuth,

  tagTypes: ["Projects", "Tasks"],
  endpoints: () => ({}),
});
