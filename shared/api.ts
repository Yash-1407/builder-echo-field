/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * User types
 */
export interface User {
  id: string;
  name: string;
  email: string;
  monthlyTarget: number;
  goals: {
    carbon_reduction?: number;
    transport_reduction?: number;
    renewable_energy?: number;
  };
}

export interface AuthResponse {
  user: User;
  sessionToken: string;
}

export interface UserResponse {
  user: User;
}

/**
 * Activity types
 */
export interface Activity {
  id: string;
  type: 'transport' | 'energy' | 'food' | 'shopping';
  description: string;
  impact: number;
  unit: string;
  date: string;
  category: string;
  details: {
    distance?: number;
    vehicle_type?: string;
    energy_amount?: number;
    energy_source?: string;
    meal_type?: string;
    food_type?: string;
    item_type?: string;
    quantity?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ActivitiesResponse {
  activities: Activity[];
  total: number;
}

export interface ActivityResponse {
  activity: Activity;
}

export interface CreateActivityRequest {
  type: 'transport' | 'energy' | 'food' | 'shopping';
  description: string;
  impact: number;
  unit?: string;
  date: string;
  category: string;
  details?: {
    distance?: number;
    vehicle_type?: string;
    energy_amount?: number;
    energy_source?: string;
    meal_type?: string;
    food_type?: string;
    item_type?: string;
    quantity?: number;
  };
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {}

/**
 * Analytics types
 */
export interface AnalyticsResponse {
  period: string;
  totalFootprint: number;
  dailyAverage: number;
  activityCount: number;
  footprintByCategory: {
    name: string;
    value: number;
    color: string;
  }[];
  trendData: {
    name: string;
    value: number;
  }[];
}

/**
 * Authentication request types
 */
export interface RegisterRequest {
  name: string;
  email: string;
  monthlyTarget?: number;
}

export interface LoginRequest {
  email: string;
}

export interface UpdateProfileRequest {
  name?: string;
  monthlyTarget?: number;
  goals?: {
    carbon_reduction?: number;
    transport_reduction?: number;
    renewable_energy?: number;
  };
}

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
}

/**
 * Success Message Response
 */
export interface SuccessResponse {
  message: string;
}
