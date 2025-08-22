import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authApi, activitiesApi, demoLogin, setupApiInterceptors, handleApiError } from '@/lib/api';
import type { User, Activity } from '@shared/api';

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
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVITIES_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY'; payload: { id: string; activity: Activity } }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_ANALYTICS'; payload: ActivityState['analytics'] }
  | { type: 'LOGOUT' };

const initialState: ActivityState = {
  activities: [],
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  activitiesLoading: false,
  analytics: null,
};

const activityReducer = (state: ActivityState, action: ActivityAction): ActivityState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ACTIVITIES_LOADING':
      return { ...state, activitiesLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(activity =>
          activity.id === action.payload.id ? action.payload.activity : activity
        ),
      };
    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter(activity => activity.id !== action.payload),
      };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const ActivityContext = createContext<{
  state: ActivityState;
  dispatch: React.Dispatch<ActivityAction>;
  // Authentication methods
  login: (email: string) => Promise<void>;
  register: (name: string, email: string, monthlyTarget?: number) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; monthlyTarget?: number; goals?: any }) => Promise<void>;
  // Activity methods
  addActivity: (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  refreshActivities: () => Promise<void>;
  // Analytics methods
  getTotalFootprint: (period?: 'week' | 'month' | 'year') => number;
  getFootprintByCategory: () => { name: string; value: number; color: string }[];
  getTrendData: () => { name: string; value: number }[];
  refreshAnalytics: (period?: string) => Promise<void>;
} | null>(null);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(activityReducer, initialState);

  // Setup API interceptors on mount
  useEffect(() => {
    setupApiInterceptors();
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Check if we have a session token
        const sessionToken = localStorage.getItem('carbonmeter_session_token');
        
        if (sessionToken) {
          // Try to get current user
          const userResponse = await authApi.getUser();
          dispatch({ type: 'SET_USER', payload: userResponse.user });
          
          // Load initial activities
          await refreshActivities();
          await refreshAnalytics();
        } else {
          // Try demo login for development
          try {
            const authResponse = await demoLogin();
            dispatch({ type: 'SET_USER', payload: authResponse.user });
            await refreshActivities();
            await refreshAnalytics();
          } catch (error) {
            // Demo login failed, user needs to authenticate
            dispatch({ type: 'SET_AUTHENTICATED', payload: false });
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Authentication methods
  const login = async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await authApi.login({ email });
      dispatch({ type: 'SET_USER', payload: response.user });
      
      // Load user's activities and analytics
      await refreshActivities();
      await refreshAnalytics();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (name: string, email: string, monthlyTarget: number = 4.5) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await authApi.register({ name, email, monthlyTarget });
      dispatch({ type: 'SET_USER', payload: response.user });
      
      // No activities for new users, but load analytics
      await refreshAnalytics();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (updates: { name?: string; monthlyTarget?: number; goals?: any }) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await authApi.updateProfile(updates);
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
      throw error;
    }
  };

  // Activity methods
  const addActivity = async (activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
    dispatch({ type: 'SET_ERROR', payload: null });

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
      
      dispatch({ type: 'ADD_ACTIVITY', payload: response.activity });
      
      // Refresh analytics to update charts
      await refreshAnalytics();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
      throw error;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await activitiesApi.updateActivity(id, updates);
      dispatch({ type: 'UPDATE_ACTIVITY', payload: { id, activity: response.activity } });
      
      // Refresh analytics to update charts
      await refreshAnalytics();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
      throw error;
    }
  };

  const deleteActivity = async (id: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await activitiesApi.deleteActivity(id);
      dispatch({ type: 'DELETE_ACTIVITY', payload: id });
      
      // Refresh analytics to update charts
      await refreshAnalytics();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
      throw error;
    }
  };

  const refreshActivities = async () => {
    if (!state.isAuthenticated) return;
    
    dispatch({ type: 'SET_ACTIVITIES_LOADING', payload: true });
    
    try {
      const response = await activitiesApi.getActivities({ limit: 50 });
      dispatch({ type: 'SET_ACTIVITIES', payload: response.activities });
    } catch (error) {
      console.error('Failed to refresh activities:', error);
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
    } finally {
      dispatch({ type: 'SET_ACTIVITIES_LOADING', payload: false });
    }
  };

  // Analytics methods
  const refreshAnalytics = async (period: string = 'month') => {
    if (!state.isAuthenticated) return;

    try {
      const response = await activitiesApi.getAnalytics(period);
      dispatch({ type: 'SET_ANALYTICS', payload: response });
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    }
  };

  // Helper methods for backward compatibility
  const getTotalFootprint = (period: 'week' | 'month' | 'year' = 'month') => {
    return state.analytics?.totalFootprint || 0;
  };

  const getFootprintByCategory = () => {
    return state.analytics?.footprintByCategory || [];
  };

  const getTrendData = () => {
    return state.analytics?.trendData || [];
  };

  return (
    <ActivityContext.Provider value={{
      state,
      dispatch,
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
    }}>
      {children}
    </ActivityContext.Provider>
  );
};
