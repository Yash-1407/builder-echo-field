import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  supabase,
  apiCall,
  getSessionToken,
  setSessionToken,
  removeSessionToken,
} from "@/lib/supabase";

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
  id?: string;
  name: string;
  email: string;
  monthlyTarget: number;
  goals: {
    carbonReduction: number;
    transportReduction: number;
    renewableEnergy: number;
  };
}

interface ActivityState {
  activities: Activity[];
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  syncStatus: "idle" | "syncing" | "synced" | "error";
}

type ActivityAction =
  | { type: "ADD_ACTIVITY"; payload: Activity }
  | {
      type: "UPDATE_ACTIVITY";
      payload: { id: string; updates: Partial<Activity> };
    }
  | { type: "DELETE_ACTIVITY"; payload: string }
  | { type: "SET_ACTIVITIES"; payload: Activity[] }
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "LOGIN"; payload: User }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SYNC_STATUS"; payload: ActivityState["syncStatus"] };

const initialState: ActivityState = {
  activities: [],
  user: null,
  isAuthenticated: false,
  isLoading: false,
  syncStatus: "idle",
};

const activityReducer = (
  state: ActivityState,
  action: ActivityAction,
): ActivityState => {
  switch (action.type) {
    case "ADD_ACTIVITY":
      return {
        ...state,
        activities: [action.payload, ...state.activities],
        syncStatus: "synced",
      };
    case "UPDATE_ACTIVITY":
      return {
        ...state,
        activities: state.activities.map((activity) =>
          activity.id === action.payload.id
            ? { ...activity, ...action.payload.updates }
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
    case "SET_ACTIVITIES":
      return {
        ...state,
        activities: action.payload,
        syncStatus: "synced",
      };
    case "SET_USER":
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        activities: [],
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_SYNC_STATUS":
      return {
        ...state,
        syncStatus: action.payload,
      };
    default:
      return state;
  }
};

const ActivityContext = createContext<{
  state: ActivityState;
  dispatch: React.Dispatch<ActivityAction>;
  addActivity: (activity: Omit<Activity, "id">) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  getTotalFootprint: (period?: "week" | "month" | "year") => number;
  getFootprintByCategory: () => {
    name: string;
    value: number;
    color: string;
  }[];
  getTrendData: () => { name: string; value: number }[];
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    monthlyTarget?: number;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncActivities: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
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

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getSessionToken();
      if (token) {
        try {
          dispatch({ type: "SET_LOADING", payload: true });
          const response = await apiCall("/auth/me");
          dispatch({ type: "LOGIN", payload: response.user });
          await syncActivities();
        } catch (error) {
          console.error("Session validation failed:", error);
          removeSessionToken();
          loadDemoData();
        }
      } else {
        loadDemoData();
      }
    };

    initializeAuth();
  }, []);

  const loadDemoData = () => {
    // Add sample data for demo/first-time users
    const sampleActivities: Activity[] = [
      {
        id: "sample1",
        type: "transport",
        description: "15 miles by Car",
        impact: 6.0,
        unit: "kg CO₂",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: "Car",
        details: { vehicleType: "Car", distance: 15 },
      },
      {
        id: "sample2",
        type: "energy",
        description: "25 kWh from Grid Electricity",
        impact: 12.5,
        unit: "kg CO₂",
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        category: "Grid Electricity",
        details: { energySource: "Grid Electricity", energyAmount: 25 },
      },
      {
        id: "sample3",
        type: "food",
        description: "Beef Lunch",
        impact: 6.0,
        unit: "kg CO₂",
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        category: "Beef",
        details: { mealType: "Lunch", foodType: "Beef" },
      },
    ];

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

    dispatch({ type: "SET_ACTIVITIES", payload: sampleActivities });
    dispatch({ type: "LOGIN", payload: sampleUser });
  };

  const addActivity = async (activity: Omit<Activity, "id">) => {
    const tempId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newActivity: Activity = { ...activity, id: tempId };

    // Optimistic update
    dispatch({ type: "ADD_ACTIVITY", payload: newActivity });
    dispatch({ type: "SET_SYNC_STATUS", payload: "syncing" });

    try {
      if (state.isAuthenticated && getSessionToken()) {
        // Save to backend
        const response = await apiCall("/activities", {
          method: "POST",
          body: JSON.stringify(activity),
        });

        // Update with server ID
        dispatch({
          type: "UPDATE_ACTIVITY",
          payload: { id: tempId, updates: { id: response.activity.id } },
        });
      }

      // Show success toast
      toast({
        title: "Activity Logged! 🌱",
        description: `${activity.description} - ${activity.impact} ${activity.unit}`,
        duration: 3000,
      });

      dispatch({ type: "SET_SYNC_STATUS", payload: "synced" });
    } catch (error) {
      console.error("Failed to save activity:", error);
      dispatch({ type: "SET_SYNC_STATUS", payload: "error" });
      toast({
        title: "Sync Error",
        description: "Activity saved locally, will sync when online.",
        variant: "destructive",
      });
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    dispatch({ type: "UPDATE_ACTIVITY", payload: { id, updates } });

    try {
      if (state.isAuthenticated && getSessionToken()) {
        await apiCall(`/activities/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });
      }
    } catch (error) {
      console.error("Failed to update activity:", error);
    }
  };

  const deleteActivity = async (id: string) => {
    dispatch({ type: "DELETE_ACTIVITY", payload: id });

    try {
      if (state.isAuthenticated && getSessionToken()) {
        await apiCall(`/activities/${id}`, {
          method: "DELETE",
        });
      }
    } catch (error) {
      console.error("Failed to delete activity:", error);
    }
  };

  const login = async (credentials: { email: string; password?: string }) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      setSessionToken(response.sessionToken);
      dispatch({ type: "LOGIN", payload: response.user });
      await syncActivities();

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    monthlyTarget?: number;
  }) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      setSessionToken(response.sessionToken);
      dispatch({ type: "LOGIN", payload: response.user });

      toast({
        title: "Account Created!",
        description: "Welcome to CarbonMeter!",
      });
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "Please try again with different credentials.",
        variant: "destructive",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const loginWithGoogle = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // Simulate Google OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // The actual user data will be handled by the auth callback
      toast({
        title: "Redirecting to Google...",
        description: "Please complete the authentication process.",
      });
    } catch (error) {
      console.error("Google login failed:", error);
      toast({
        title: "Google Login Failed",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = async () => {
    try {
      if (getSessionToken()) {
        await apiCall("/auth/logout", { method: "POST" });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      removeSessionToken();
      dispatch({ type: "LOGOUT" });
      loadDemoData(); // Load demo data after logout

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const syncActivities = async () => {
    if (!state.isAuthenticated || !getSessionToken()) return;

    dispatch({ type: "SET_SYNC_STATUS", payload: "syncing" });

    try {
      const response = await apiCall("/activities");
      dispatch({ type: "SET_ACTIVITIES", payload: response.activities || [] });
      dispatch({ type: "SET_SYNC_STATUS", payload: "synced" });
    } catch (error) {
      console.error("Failed to sync activities:", error);
      dispatch({ type: "SET_SYNC_STATUS", payload: "error" });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!state.user) return;

      const response = await apiCall("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      dispatch({ type: "SET_USER", payload: response.user });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Profile update failed:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
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
    }

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

  return (
    <ActivityContext.Provider
      value={{
        state,
        dispatch,
        addActivity,
        updateActivity,
        deleteActivity,
        getTotalFootprint,
        getFootprintByCategory,
        getTrendData,
        login,
        register,
        loginWithGoogle,
        logout,
        syncActivities,
        updateProfile,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};
