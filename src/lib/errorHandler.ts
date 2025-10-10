/**
 * Centralized Error Handling Utility
 * Provides consistent error handling and user-friendly error messages
 */

import { toast } from "@/Components/UI/shadcn-UI/use-toast";

export interface ErrorResponse {
    message: string;
    status?: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

export interface ApiError extends Error {
    statusCode?: number;
    response?: ErrorResponse;
}

/**
 * Extract user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
    if (typeof error === "string") {
        return error;
    }

    if (error instanceof Error) {
        // Check for API error response
        const apiError = error as ApiError;
        if (apiError.response?.message) {
            return apiError.response.message;
        }
        return error.message;
    }

    if (typeof error === "object" && error !== null) {
        // Handle error objects
        const errorObj = error as Record<string, unknown>;

        if (errorObj.message && typeof errorObj.message === "string") {
            return errorObj.message;
        }

        if (errorObj.error && typeof errorObj.error === "string") {
            return errorObj.error;
        }

        // Handle validation errors
        if (errorObj.errors && typeof errorObj.errors === "object") {
            const errors = Object.values(errorObj.errors).flat();
            return errors.join(", ");
        }
    }

    return "An unexpected error occurred. Please try again.";
}

/**
 * Handle API errors and show appropriate toast
 */
export function handleApiError(error: unknown, customMessage?: string) {
    const errorMessage = customMessage || getErrorMessage(error);

    toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
    });

    console.error("API Error:", error);
}

/**
 * Handle network errors specifically
 */
export function handleNetworkError() {
    toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to connect to the server. Please check your internet connection.",
    });
}

/**
 * Handle authentication errors
 */
export function handleAuthError() {
    toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Your session has expired. Please sign in again.",
    });

    // Clear token and redirect to login
    localStorage.removeItem("token");
    setTimeout(() => {
        window.location.href = "/signin";
    }, 1500);
}

/**
 * Show success toast
 */
export function showSuccessToast(title: string, description?: string) {
    toast({
        title,
        description,
        variant: "default",
    });
}

/**
 * Show info toast
 */
export function showInfoToast(title: string, description?: string) {
    toast({
        title,
        description,
    });
}

/**
 * Show warning toast
 */
export function showWarningToast(title: string, description?: string) {
    toast({
        title: "⚠️ " + title,
        description,
    });
}

/**
 * Async error handler wrapper for async functions
 */
export async function handleAsyncError<T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string
): Promise<T | null> {
    try {
        return await asyncFn();
    } catch (error) {
        handleApiError(error, errorMessage);
        return null;
    }
}

/**
 * HTTP error class
 */
export class HttpError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public response?: ErrorResponse
    ) {
        super(message);
        this.name = "HttpError";
    }
}

/**
 * Handle fetch response and check for errors
 */
export async function handleFetchResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        // Try to parse error response
        let errorData: ErrorResponse | null = null;
        try {
            errorData = await response.json();
        } catch {
            // If parsing fails, use status text
        }

        const errorMessage = errorData?.message || response.statusText || "Request failed";

        // Handle specific status codes
        if (response.status === 401 || response.status === 403) {
            handleAuthError();
        } else if (response.status >= 500) {
            handleApiError(new Error("Server error. Please try again later."));
        }

        throw new HttpError(response.status, errorMessage, errorData || undefined);
    }

    const data = await response.json();

    // Check for API-level errors (status: "error")
    if (data.status === "error") {
        throw new HttpError(
            response.status,
            data.message || "Request failed",
            data
        );
    }

    return data;
}

/**
 * Create a fetch wrapper with error handling
 */
export async function fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit
): Promise<T | null> {
    try {
        const token = localStorage.getItem("token");

        const defaultHeaders: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            defaultHeaders["authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options?.headers,
            },
        });

        return await handleFetchResponse<T>(response);
    } catch (error) {
        if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
            handleNetworkError();
        } else {
            handleApiError(error);
        }
        return null;
    }
}

/**
 * Validation error handler
 */
export function handleValidationError(errors: Record<string, string[]>) {
    const errorMessages = Object.entries(errors)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("\n");

    toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessages,
    });
}
