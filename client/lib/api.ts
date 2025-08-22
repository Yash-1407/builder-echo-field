import {
  AuthResponse,
  UserResponse,
  ActivitiesResponse,
  ActivityResponse,
  AnalyticsResponse,
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest,
  CreateActivityRequest,
  UpdateActivityRequest,
  ApiError,
  SuccessResponse,
} from "@shared/api";

// Base API URL - in development this will be proxied by Vite
const API_BASE_URL = "/api";

// Get session token from localStorage
const getSessionToken = (): string | null => {
  return localStorage.getItem("carbonmeter_session_token");
};

// Set session token in localStorage
const setSessionToken = (token: string): void => {
  localStorage.setItem("carbonmeter_session_token", token);
};

// Remove session token from localStorage
const removeSessionToken = (): void => {
  localStorage.removeItem("carbonmeter_session_token");
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const sessionToken = getSessionToken();

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Authentication API
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setSessionToken(response.sessionToken);
    return response;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setSessionToken(response.sessionToken);
    return response;
  },

  getUser: async (): Promise<UserResponse> => {
    return apiRequest<UserResponse>("/auth/user");
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    return apiRequest<UserResponse>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  logout: async (): Promise<SuccessResponse> => {
    const response = await apiRequest<SuccessResponse>("/auth/logout", {
      method: "POST",
    });
    removeSessionToken();
    return response;
  },
};

// Activities API
export const activitiesApi = {
  getActivities: async (params?: {
    limit?: number;
    offset?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ActivitiesResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.type) searchParams.append("type", params.type);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);

    const query = searchParams.toString();
    return apiRequest<ActivitiesResponse>(
      `/activities${query ? `?${query}` : ""}`,
    );
  },

  getActivity: async (id: string): Promise<ActivityResponse> => {
    return apiRequest<ActivityResponse>(`/activities/${id}`);
  },

  createActivity: async (
    data: CreateActivityRequest,
  ): Promise<ActivityResponse> => {
    return apiRequest<ActivityResponse>("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateActivity: async (
    id: string,
    data: UpdateActivityRequest,
  ): Promise<ActivityResponse> => {
    return apiRequest<ActivityResponse>(`/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteActivity: async (id: string): Promise<SuccessResponse> => {
    return apiRequest<SuccessResponse>(`/activities/${id}`, {
      method: "DELETE",
    });
  },

  getRecentActivities: async (): Promise<ActivitiesResponse> => {
    return apiRequest<ActivitiesResponse>("/activities/recent");
  },

  getAnalytics: async (period?: string): Promise<AnalyticsResponse> => {
    const query = period ? `?period=${period}` : "";
    return apiRequest<AnalyticsResponse>(`/activities/analytics${query}`);
  },

  bulkDeleteActivities: async (
    activityIds: string[],
  ): Promise<SuccessResponse & { deletedCount: number }> => {
    return apiRequest<SuccessResponse & { deletedCount: number }>(
      "/activities",
      {
        method: "DELETE",
        body: JSON.stringify({ activityIds }),
      },
    );
  },
};

// Demo API function for testing session
export const demoLogin = async (): Promise<AuthResponse> => {
  const response = await authApi.login({ email: "demo@carbonmeter.com" });
  return response;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getSessionToken();
};

// Handle API errors
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Auto-logout on token expiration
export const setupApiInterceptors = () => {
  // This could be enhanced to automatically handle token refresh
  // For now, we'll just handle 401 errors by clearing the session
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    if (response.status === 401 && getSessionToken()) {
      // Session expired, clear token and redirect to login
      removeSessionToken();
      window.location.href = "/";
    }

    return response;
  };
};
