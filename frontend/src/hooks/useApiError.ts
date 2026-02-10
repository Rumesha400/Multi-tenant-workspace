import type { ApiErrorResponse } from "@/types";

export function useApiError() {
    return (error: unknown): string => {
        const apiError = error as ApiErrorResponse;
        return apiError.data?.detail || "An error occurred";
    };
}