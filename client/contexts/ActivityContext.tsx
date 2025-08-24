import React, { createContext, useContext, useReducer, useEffect } from "react";
<<<<<<< HEAD
import { toast } from "@/components/ui/use-toast";

export interface Activity {
  id: string;
  type: "transport" | "energy" | "food" | "shopping";
  description: string;
  impact: number;
  unit: string;
  date: string;
  category: string;
  details: {
    distance?: number;
    vehicleType?: string;
    energyAmount?: number;
    energySource?: string;
    mealType?: string;
    foodType?: string;
    itemType?: string;
    quantity?: number;
  };
}

export interface User {
  name: string;
  email: string;
  monthlyTarget: number;
  goals: {
    carbonReduction: number;
    transportReduction: number;
    renewableEnergy: number;
  };
}
=======
import {
  authApi,
  activitiesApi,
  demoLogin,
  setupApiInterceptors,
  handleApiError,
} from "@/lib/api";
import type { User, Activity } from "@shared/api";
>>>>>>> refs/remotes/origin/main

interface ActivityState {
  activities: Activity[];
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  activitiesLoading: boolean;
  analytics: {
    totalFootprint: number;
    dailyAverage: number;
    activityCount: number;
    footprintByCategory: { name: string; value: number; color: string }[];
    trendData: { name: string; value: number }[];
  } | null;
}

type ActivityAction =
<<<<<<< HEAD
  | { type: "ADD_ACTIVITY"; payload: Activity }
  | {
      type: "UPDATE_ACTIVITY";
      payload: { id: string; updates: Partial<Activity> };
    }
  | { type: "DELETE_ACTIVITY"; payload: string }
  | { type: "SET_ACTIVITIES"; payload: Activity[] }
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "LOGIN"; payload: User };
=======
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ACTIVITIES_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ACTIVITIES"; payload: Activity[] }
  | { type: "ADD_ACTIVITY"; payload: Activity }
  | { type: "UPDATE_ACTIVITY"; payload: { id: string; activity: Activity } }
  | { type: "DELETE_ACTIVITY"; payload: string }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_ANALYTICS"; payload: ActivityState["analytics"] }
  | { type: "LOGOUT" };
>>>>>>> refs/remotes/origin/main

const initialState: ActivityState = {
  activities: [],
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  activitiesLoading: false,
  analytics: null,
};

const activityReducer = (
  state: ActivityState,
  action: ActivityAction,
): ActivityState => {
  switch (action.type) {
<<<<<<< HEAD
    case "ADD_ACTIVITY":
      return {
        ...state,
        activities: [action.payload, ...state.activities],
      };
    case "UPDATE_ACTIVITY":
      return {
        ...state,
        activities: state.activities.map((activity) =>
          activity.id === action.payload.id
            ? { ...activity, ...action.payload.updates }
=======
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ACTIVITIES_LOADING":
      return { ...state, activitiesLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_ACTIVITIES":
      return { ...state, activities: action.payload };
    case "ADD_ACTIVITY":
      return { ...state, activities: [action.payload, ...state.activities] };
    case "UPDATE_ACTIVITY":
      return {
        ...state,
        activities: state.activities.map((activity) =>
          activity.id === action.payload.id
            ? action.payload.activity
>>>>>>> refs/remotes/origin/main
            : activity,
        ),
      };
    case "DELETE_ACTIVITY":
      return {
        ...state,
        activities: state.activities.filter(
          (activity) => activity.id !== action.payload,
        ),
      };
<<<<<<< HEAD
    case "SET_ACTIVITIES":
      return {
        ...state,
        activities: action.payload,
      };
    case "SET_USER":
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
=======
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload };
    case "SET_ANALYTICS":
      return { ...state, analytics: action.payload };
    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
>>>>>>> refs/remotes/origin/main
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const ActivityContext = createContext<{
  state: ActivityState;
  dispatch: React.Dispatch<ActivityAction>;
<<<<<<< HEAD
  addActivity: (activity: Omit<Activity, "id">) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
=======
  // Authentication methods
  login: (email: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    monthlyTarget?: number,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: {
    name?: string;
    monthlyTarget?: number;
    goals?: any;
  }) => Promise<void>;
  // Activity methods
  addActivity: (
    activity: Omit<Activity, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  refreshActivities: () => Promise<void>;
  // Analytics methods
>>>>>>> refs/remotes/origin/main
  getTotalFootprint: (period?: "week" | "month" | "year") => number;
  getFootprintByCategory: () => {
    name: string;
    value: number;
    color: string;
  }[];
  getTrendData: () => { name: string; value: number }[];
  refreshAnalytics: (period?: string) => Promise<void>;
} | null>(null);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(activityReducer, initialState);

  // Setup API interceptors on mount
  useEffect(() => {
<<<<<<< HEAD
    const savedActivities = localStorage.getItem("carbonmeter_activities");
    const savedUser = localStorage.getItem("carbonmeter_user");

    if (savedActivities) {
      try {
        const activities = JSON.parse(savedActivities);
        dispatch({ type: "SET_ACTIVITIES", payload: activities });
      } catch (error) {
        console.error("Error loading activities:", error);
      }
    } else {
      // Add sample data for first-time users
      const sampleActivities: Activity[] = [
        {
          id: "sample1",
          type: "transport",
          description: "15 miles by Car",
          impact: 6.0,
          unit: "kg CO₂",
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          category: "Car",
          details: { vehicleType: "Car", distance: 15 },
        },
        {
          id: "sample2",
          type: "energy",
          description: "25 kWh from Grid Electricity",
          impact: 12.5,
          unit: "kg CO₂",
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          category: "Grid Electricity",
          details: { energySource: "Grid Electricity", energyAmount: 25 },
        },
        {
          id: "sample3",
          type: "food",
          description: "Beef Lunch",
          impact: 6.0,
          unit: "kg CO₂",
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          category: "Beef",
          details: { mealType: "Lunch", foodType: "Beef" },
        },
        {
          id: "sample4",
          type: "transport",
          description: "8 miles by Bus",
          impact: 0.8,
          unit: "kg CO₂",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          category: "Bus",
          details: { vehicleType: "Bus", distance: 8 },
        },
        {
          id: "sample5",
          type: "shopping",
          description: "2 Electronics items",
          impact: 10.0,
          unit: "kg CO₂",
          date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
          category: "Electronics",
          details: { itemType: "Electronics", quantity: 2 },
        },
      ];
      dispatch({ type: "SET_ACTIVITIES", payload: sampleActivities });
    }

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: "LOGIN", payload: user });
      } catch (error) {
        console.error("Error loading user:", error);
      }
    } else {
      // Add sample user for demo
      const sampleUser: User = {
        name: "Demo User",
        email: "demo@carbonmeter.com",
        monthlyTarget: 4.5,
        goals: {
          carbonReduction: 30,
          transportReduction: 25,
          renewableEnergy: 80,
        },
      };
      dispatch({ type: "LOGIN", payload: sampleUser });
    }
=======
    setupApiInterceptors();
>>>>>>> refs/remotes/origin/main
  }, []);

  // Real-time polling for updates
  useEffect(() => {
<<<<<<< HEAD
    localStorage.setItem(
      "carbonmeter_activities",
      JSON.stringify(state.activities),
    );
  }, [state.activities]);
=======
    if (!state.isAuthenticated) return;
>>>>>>> refs/remotes/origin/main

    const pollInterval = setInterval(() => {
      // Only poll if user is on the page (document is visible)
      if (document.visibilityState === "visible") {
        refreshActivities();
        refreshAnalytics();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [state.isAuthenticated]);

  // Initialize authentication state
  useEffect(() => {
<<<<<<< HEAD
    if (state.user) {
      localStorage.setItem("carbonmeter_user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("carbonmeter_user");
    }
  }, [state.user]);

  const addActivity = (activity: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    dispatch({ type: "ADD_ACTIVITY", payload: newActivity });

    // Show success toast
    toast({
      title: "Activity Logged! 🌱",
      description: `${activity.description} - ${activity.impact} ${activity.unit}`,
      duration: 3000,
    });
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    dispatch({ type: "UPDATE_ACTIVITY", payload: { id, updates } });
  };

  const deleteActivity = (id: string) => {
    dispatch({ type: "DELETE_ACTIVITY", payload: id });
  };

  const getTotalFootprint = (period: "week" | "month" | "year" = "month") => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
=======
    const initializeAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        // Check if we have a session token
        const sessionToken = localStorage.getItem("carbonmeter_session_token");

        if (sessionToken) {
          // Try to get current user
          const userResponse = await authApi.getUser();
          dispatch({ type: "SET_USER", payload: userResponse.user });

          // Load initial activities
          await refreshActivities();
          await refreshAnalytics();
        } else {
          // Try demo login for development
          try {
            const authResponse = await demoLogin();
            dispatch({ type: "SET_USER", payload: authResponse.user });
            await refreshActivities();
            await refreshAnalytics();
          } catch (error) {
            // Demo login failed, user needs to authenticate
            dispatch({ type: "SET_AUTHENTICATED", payload: false });
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        dispatch({ type: "SET_ERROR", payload: handleApiError(error) });
        dispatch({ type: "SET_AUTHENTICATED", payload: false });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Authentication methods
  const login = async (email: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await authApi.login({ email });
      dispatch({ type: "SET_USER", payload: response.user });

      // Load user's activities and analytics
      await refreshActivities();
      await refreshAnalytics();
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(error) });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
>>>>>>> refs/remotes/origin/main
    }
  };

<<<<<<< HEAD
    return state.activities
      .filter((activity) => new Date(activity.date) >= startDate)
      .reduce((total, activity) => total + activity.impact, 0);
  };

  const getFootprintByCategory = () => {
    const categories = {
      transport: { name: "Transportation", color: "#3b82f6", total: 0 },
      energy: { name: "Energy", color: "#10b981", total: 0 },
      food: { name: "Food", color: "#f59e0b", total: 0 },
      shopping: { name: "Shopping", color: "#8b5cf6", total: 0 },
    };

    state.activities.forEach((activity) => {
      if (categories[activity.type]) {
        categories[activity.type].total += activity.impact;
      }
    });

    return Object.values(categories).map((category) => ({
      name: category.name,
      value: Math.round(category.total * 100) / 100,
      color: category.color,
    }));
  };

  const getTrendData = () => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      const monthTotal = state.activities
        .filter((activity) => {
          const activityDate = new Date(activity.date);
          return (
            activityDate.getMonth() === date.getMonth() &&
            activityDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((total, activity) => total + activity.impact, 0);

      months.push({
        name: monthName,
        value: Math.round(monthTotal * 100) / 100,
      });
    }

    return months;
  };

  const login = (user: User) => {
    dispatch({ type: "LOGIN", payload: user });
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("carbonmeter_user");
=======
  const register = async (
    name: string,
    email: string,
    monthlyTarget: number = 4.5,
  ) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await authApi.register({ name, email, monthlyTarget });
      dispatch({ type: "SET_USER", payload: response.user });

      // No activities for new users, but load analytics
      await refreshAnalytics();
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(error) });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    monthlyTarget?: number;
    goals?: any;
  }) => {
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await authApi.updateProfile(updates);
      dispatch({ type: "SET_USER", payload: response.user });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(error) });
      throw error;
    }
  };

  // Activity methods
  const addActivity = async (
    activityData: Omit<Activity, "id" | "created_at" | "updated_at">,
  ) => {
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await activitiesApi.createActivity({
        type: activityData.type,
        description: activityData.description,
        impact: activityData.impact,
        unit: activityData.unit,
        date: activityData.date,
        category: activityData.category,
        details: activityData.details,
      });

      dispatch({ type: "ADD_ACTIVITY", payload: response.activity });

      // Refresh analytics to update charts
      await refreshAnalytics();
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(error) });
      throw error;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await activitiesApi.updateActivity(id, updates);
      dispatch({
        type: "UPDATE_ACTIVITY",
        payload: { id, activity: response.activity },
      });

      // Refresh analytics to update charts
      await refreshAnalytics();
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(error) });
      throw error;
    }
  };

  const deleteActivity = async (id: string) => {
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      await activitiesApi.deleteActivity(id);
      dispatch({ type: "DELETE_ACTIVITY", payload: id });

      // Refresh analytics to update charts
      await refreshAnalytics();
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(error) });
      throw error;
    }
  };

  const refreshActivities = async () => {
    if (!state.isAuthenticated) return;

    dispatch({ type: "SET_ACTIVITIES_LOADING", payload: true });

    try {
      const response = await activitiesApi.getActivities({ limit: 50 });
      dispatch({ type: "SET_ACTIVITIES", payload: response.activities });
    } catch (error) {
      console.error("Failed to refresh activities:", error);
      dispatch({ type: "SET_ERROR", payload: handleApiError(error) });
    } finally {
      dispatch({ type: "SET_ACTIVITIES_LOADING", payload: false });
    }
  };

  // Analytics methods
  const refreshAnalytics = async (period: string = "month") => {
    if (!state.isAuthenticated) return;

    try {
      const response = await activitiesApi.getAnalytics(period);
      dispatch({ type: "SET_ANALYTICS", payload: response });
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
    }
  };

  // Helper methods for backward compatibility
  const getTotalFootprint = (period: "week" | "month" | "year" = "month") => {
    return state.analytics?.totalFootprint || 0;
  };

  const getFootprintByCategory = () => {
    return state.analytics?.footprintByCategory || [];
  };

  const getTrendData = () => {
    return state.analytics?.trendData || [];
>>>>>>> refs/remotes/origin/main
  };

  return (
    <ActivityContext.Provider
      value={{
        state,
        dispatch,
<<<<<<< HEAD
        addActivity,
        updateActivity,
        deleteActivity,
        getTotalFootprint,
        getFootprintByCategory,
        getTrendData,
        login,
        logout,
=======
        login,
        register,
        logout,
        updateProfile,
        addActivity,
        updateActivity,
        deleteActivity,
        refreshActivities,
        getTotalFootprint,
        getFootprintByCategory,
        getTrendData,
        refreshAnalytics,
>>>>>>> refs/remotes/origin/main
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};
