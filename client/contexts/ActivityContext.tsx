import React, { createContext, useContext, useReducer, useEffect } from 'react';

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

interface ActivityState {
  activities: Activity[];
  user: User | null;
  isAuthenticated: boolean;
}

type ActivityAction =
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY'; payload: { id: string; updates: Partial<Activity> } }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'LOGIN'; payload: User };

const initialState: ActivityState = {
  activities: [],
  user: null,
  isAuthenticated: false,
};

const activityReducer = (state: ActivityState, action: ActivityAction): ActivityState => {
  switch (action.type) {
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities],
      };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(activity =>
          activity.id === action.payload.id
            ? { ...activity, ...action.payload.updates }
            : activity
        ),
      };
    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter(activity => activity.id !== action.payload),
      };
    case 'SET_ACTIVITIES':
      return {
        ...state,
        activities: action.payload,
      };
    case 'SET_USER':
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const ActivityContext = createContext<{
  state: ActivityState;
  dispatch: React.Dispatch<ActivityAction>;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  getTotalFootprint: (period?: 'week' | 'month' | 'year') => number;
  getFootprintByCategory: () => { name: string; value: number; color: string }[];
  getTrendData: () => { name: string; value: number }[];
  login: (user: User) => void;
  logout: () => void;
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedActivities = localStorage.getItem('carbonmeter_activities');
    const savedUser = localStorage.getItem('carbonmeter_user');
    
    if (savedActivities) {
      try {
        const activities = JSON.parse(savedActivities);
        dispatch({ type: 'SET_ACTIVITIES', payload: activities });
      } catch (error) {
        console.error('Error loading activities:', error);
      }
    }
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN', payload: user });
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
  }, []);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('carbonmeter_activities', JSON.stringify(state.activities));
  }, [state.activities]);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('carbonmeter_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('carbonmeter_user');
    }
  }, [state.user]);

  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    dispatch({ type: 'UPDATE_ACTIVITY', payload: { id, updates } });
  };

  const deleteActivity = (id: string) => {
    dispatch({ type: 'DELETE_ACTIVITY', payload: id });
  };

  const getTotalFootprint = (period: 'week' | 'month' | 'year' = 'month') => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return state.activities
      .filter(activity => new Date(activity.date) >= startDate)
      .reduce((total, activity) => total + activity.impact, 0);
  };

  const getFootprintByCategory = () => {
    const categories = {
      transport: { name: 'Transportation', color: '#3b82f6', total: 0 },
      energy: { name: 'Energy', color: '#10b981', total: 0 },
      food: { name: 'Food', color: '#f59e0b', total: 0 },
      shopping: { name: 'Shopping', color: '#8b5cf6', total: 0 },
    };

    state.activities.forEach(activity => {
      if (categories[activity.type]) {
        categories[activity.type].total += activity.impact;
      }
    });

    return Object.values(categories).map(category => ({
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
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthTotal = state.activities
        .filter(activity => {
          const activityDate = new Date(activity.date);
          return activityDate.getMonth() === date.getMonth() && 
                 activityDate.getFullYear() === date.getFullYear();
        })
        .reduce((total, activity) => total + activity.impact, 0);
      
      months.push({ name: monthName, value: Math.round(monthTotal * 100) / 100 });
    }
    
    return months;
  };

  const login = (user: User) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('carbonmeter_user');
  };

  return (
    <ActivityContext.Provider value={{
      state,
      dispatch,
      addActivity,
      updateActivity,
      deleteActivity,
      getTotalFootprint,
      getFootprintByCategory,
      getTrendData,
      login,
      logout,
    }}>
      {children}
    </ActivityContext.Provider>
  );
};
