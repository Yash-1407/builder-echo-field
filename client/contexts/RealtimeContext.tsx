import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'achievement' | 'challenge';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export interface LiveUpdate {
  type: 'activity_added' | 'goal_progress' | 'friend_activity' | 'challenge_update' | 'leaderboard_change';
  data: any;
  timestamp: string;
}

interface RealtimeState {
  notifications: Notification[];
  liveUpdates: LiveUpdate[];
  isConnected: boolean;
  unreadCount: number;
  achievementStreak: number;
  dailyGoalProgress: number;
}

type RealtimeAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'ADD_LIVE_UPDATE'; payload: LiveUpdate }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'UPDATE_STREAK'; payload: number }
  | { type: 'UPDATE_DAILY_PROGRESS'; payload: number };

const initialState: RealtimeState = {
  notifications: [],
  liveUpdates: [],
  isConnected: false,
  unreadCount: 0,
  achievementStreak: 0,
  dailyGoalProgress: 0,
};

const realtimeReducer = (state: RealtimeState, action: RealtimeAction): RealtimeState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0,
      };
    case 'ADD_LIVE_UPDATE':
      return {
        ...state,
        liveUpdates: [action.payload, ...state.liveUpdates.slice(0, 49)], // Keep last 50 updates
      };
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload,
      };
    case 'UPDATE_STREAK':
      return {
        ...state,
        achievementStreak: action.payload,
      };
    case 'UPDATE_DAILY_PROGRESS':
      return {
        ...state,
        dailyGoalProgress: action.payload,
      };
    default:
      return state;
  }
};

const RealtimeContext = createContext<{
  state: RealtimeState;
  dispatch: React.Dispatch<RealtimeAction>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  simulateRealtimeUpdates: () => void;
} | null>(null);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(realtimeReducer, initialState);

  // Simulate WebSocket connection
  useEffect(() => {
    const connectToRealtime = () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      
      // Add initial notifications
      const welcomeNotification: Notification = {
        id: 'welcome',
        type: 'info',
        title: 'Welcome to CarbonMeter!',
        message: 'Start logging activities to track your carbon footprint.',
        timestamp: new Date().toISOString(),
        read: false,
        action: {
          label: 'Start Tracking',
          href: '/activity'
        }
      };
      
      setTimeout(() => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: welcomeNotification });
        toast({
          title: welcomeNotification.title,
          description: welcomeNotification.message,
        });
      }, 2000);
    };

    connectToRealtime();

    return () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    };
  }, []);

  // Simulate real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isConnected) {
        simulateRealtimeUpdates();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [state.isConnected]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    
    // Show toast notification
    toast({
      title: newNotification.title,
      description: newNotification.message,
      variant: newNotification.type === 'warning' ? 'destructive' : 'default',
    });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_READ' });
  };

  const simulateRealtimeUpdates = () => {
    const updates = [
      {
        type: 'friend_activity' as const,
        data: {
          friendName: 'Sarah Green',
          activity: 'logged a 5-mile bike ride',
          carbonSaved: 2.1
        },
        timestamp: new Date().toISOString()
      },
      {
        type: 'challenge_update' as const,
        data: {
          challengeName: 'Meatless Monday',
          participantCount: Math.floor(Math.random() * 100) + 1200,
          yourProgress: Math.floor(Math.random() * 30) + 70
        },
        timestamp: new Date().toISOString()
      },
      {
        type: 'leaderboard_change' as const,
        data: {
          newRank: Math.floor(Math.random() * 5) + 3,
          change: Math.random() > 0.5 ? 'up' : 'down',
          category: 'Weekly Carbon Reduction'
        },
        timestamp: new Date().toISOString()
      }
    ];

    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    dispatch({ type: 'ADD_LIVE_UPDATE', payload: randomUpdate });

    // Create notifications for some updates
    if (randomUpdate.type === 'leaderboard_change' && randomUpdate.data.change === 'up') {
      addNotification({
        type: 'success',
        title: 'Leaderboard Update!',
        message: `You moved up to rank ${randomUpdate.data.newRank} in ${randomUpdate.data.category}!`,
        action: {
          label: 'View Leaderboard',
          href: '/community'
        }
      });
    }

    if (randomUpdate.type === 'challenge_update' && randomUpdate.data.yourProgress > 85) {
      addNotification({
        type: 'achievement',
        title: 'Challenge Progress!',
        message: `You're ${randomUpdate.data.yourProgress}% through the ${randomUpdate.data.challengeName} challenge!`,
        action: {
          label: 'View Challenge',
          href: '/community'
        }
      });
    }

    // Update daily progress simulation
    const newProgress = Math.min(100, state.dailyGoalProgress + Math.random() * 5);
    dispatch({ type: 'UPDATE_DAILY_PROGRESS', payload: newProgress });

    // Update streak simulation
    if (Math.random() > 0.8) {
      const newStreak = state.achievementStreak + 1;
      dispatch({ type: 'UPDATE_STREAK', payload: newStreak });
      
      if (newStreak % 7 === 0) {
        addNotification({
          type: 'achievement',
          title: 'Streak Milestone!',
          message: `🔥 ${newStreak} day sustainability streak! Keep it up!`,
          action: {
            label: 'View Profile',
            href: '/profile'
          }
        });
      }
    }
  };

  return (
    <RealtimeContext.Provider value={{
      state,
      dispatch,
      addNotification,
      markAsRead,
      markAllAsRead,
      simulateRealtimeUpdates,
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};
