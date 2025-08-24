import React, { createContext, useContext, useReducer, useEffect } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useActivity } from "./ActivityContext";

export interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "achievement" | "challenge";
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
  type:
    | "activity_added"
    | "goal_progress"
    | "friend_activity"
    | "challenge_update"
    | "leaderboard_change"
    | "community_post";
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
  onlineUsers: number;
  communityActivity: LiveUpdate[];
}

type RealtimeAction =
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "MARK_ALL_READ" }
  | { type: "ADD_LIVE_UPDATE"; payload: LiveUpdate }
  | { type: "SET_CONNECTION_STATUS"; payload: boolean }
  | { type: "UPDATE_STREAK"; payload: number }
  | { type: "UPDATE_DAILY_PROGRESS"; payload: number }
  | { type: "SET_ONLINE_USERS"; payload: number }
  | { type: "ADD_COMMUNITY_ACTIVITY"; payload: LiveUpdate };

const initialState: RealtimeState = {
  notifications: [],
  liveUpdates: [],
  isConnected: false,
  unreadCount: 0,
  achievementStreak: 0,
  dailyGoalProgress: 0,
  onlineUsers: 0,
  communityActivity: [],
};

const realtimeReducer = (
  state: RealtimeState,
  action: RealtimeAction,
): RealtimeState => {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
        unreadCount: 0,
      };
    case "ADD_LIVE_UPDATE":
      return {
        ...state,
        liveUpdates: [action.payload, ...state.liveUpdates.slice(0, 49)],
      };
    case "SET_CONNECTION_STATUS":
      return {
        ...state,
        isConnected: action.payload,
      };
    case "UPDATE_STREAK":
      return {
        ...state,
        achievementStreak: action.payload,
      };
    case "UPDATE_DAILY_PROGRESS":
      return {
        ...state,
        dailyGoalProgress: action.payload,
      };
    case "SET_ONLINE_USERS":
      return {
        ...state,
        onlineUsers: action.payload,
      };
    case "ADD_COMMUNITY_ACTIVITY":
      return {
        ...state,
        communityActivity: [action.payload, ...state.communityActivity.slice(0, 19)],
      };
    default:
      return state;
  }
};

const RealtimeContext = createContext<{
  state: RealtimeState;
  dispatch: React.Dispatch<RealtimeAction>;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  broadcastActivity: (activity: any) => void;
  joinUserPresence: () => void;
  leaveUserPresence: () => void;
} | null>(null);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
};

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(realtimeReducer, initialState);
  const { state: activityState } = useActivity();
  const userId = activityState.user?.id;

  useEffect(() => {
    if (!userId) return;

    let activityChannel: RealtimeChannel;
    let presenceChannel: RealtimeChannel;
    let communityChannel: RealtimeChannel;

    const setupRealtimeConnections = async () => {
      try {
        // Connect to Supabase realtime
        dispatch({ type: "SET_CONNECTION_STATUS", payload: true });

        // Activity updates channel
        activityChannel = supabase.channel(`activities:${userId}`)
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'activities',
              filter: `user_id=eq.${userId}`
            },
            (payload) => {
              const liveUpdate: LiveUpdate = {
                type: "activity_added",
                data: payload.new,
                timestamp: new Date().toISOString(),
              };
              dispatch({ type: "ADD_LIVE_UPDATE", payload: liveUpdate });
              
              addNotification({
                type: "success",
                title: "Activity Recorded!",
                message: `${payload.new.description} - ${payload.new.impact} ${payload.new.unit}`,
              });
            }
          )
          .subscribe();

        // User presence channel
        presenceChannel = supabase.channel('user-presence')
          .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            const userCount = Object.keys(state).length;
            dispatch({ type: "SET_ONLINE_USERS", payload: userCount });
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('User joined:', key, newPresences);
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('User left:', key, leftPresences);
          })
          .subscribe();

        // Community activity channel
        communityChannel = supabase.channel('community-activity')
          .on('postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'community_posts'
            },
            (payload) => {
              const liveUpdate: LiveUpdate = {
                type: "community_post",
                data: payload.new,
                timestamp: new Date().toISOString(),
              };
              dispatch({ type: "ADD_COMMUNITY_ACTIVITY", payload: liveUpdate });
            }
          )
          .on('broadcast', { event: 'challenge_update' }, (payload) => {
            const liveUpdate: LiveUpdate = {
              type: "challenge_update",
              data: payload.payload,
              timestamp: new Date().toISOString(),
            };
            dispatch({ type: "ADD_LIVE_UPDATE", payload: liveUpdate });
          })
          .subscribe();

        // Join user presence
        joinUserPresence();

        // Add welcome notification for first-time users
        setTimeout(() => {
          addNotification({
            type: "info",
            title: "🌱 Welcome to CarbonMeter!",
            message: "You're now connected to real-time updates. Start logging activities to see live progress!",
            action: {
              label: "Start Tracking",
              href: "/activity",
            },
          });
        }, 2000);

      } catch (error) {
        console.error("Realtime connection error:", error);
        dispatch({ type: "SET_CONNECTION_STATUS", payload: false });
      }
    };

    setupRealtimeConnections();

    // Cleanup on unmount
    return () => {
      if (activityChannel) activityChannel.unsubscribe();
      if (presenceChannel) presenceChannel.unsubscribe();
      if (communityChannel) communityChannel.unsubscribe();
      dispatch({ type: "SET_CONNECTION_STATUS", payload: false });
    };
  }, [userId]);

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };

    dispatch({ type: "ADD_NOTIFICATION", payload: newNotification });

    // Show toast notification
    toast({
      title: newNotification.title,
      description: newNotification.message,
      variant: newNotification.type === "warning" ? "destructive" : "default",
    });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: "MARK_ALL_READ" });
  };

  const broadcastActivity = (activity: any) => {
    supabase.channel('community-activity').send({
      type: 'broadcast',
      event: 'user_activity',
      payload: {
        user_id: userId,
        activity,
        timestamp: new Date().toISOString(),
      }
    });
  };

  const joinUserPresence = () => {
    if (!userId) return;
    
    const presenceChannel = supabase.channel('user-presence');
    presenceChannel.track({
      user_id: userId,
      online_at: new Date().toISOString(),
    });
  };

  const leaveUserPresence = () => {
    const presenceChannel = supabase.channel('user-presence');
    presenceChannel.untrack();
  };

  return (
    <RealtimeContext.Provider
      value={{
        state,
        dispatch,
        addNotification,
        markAsRead,
        markAllAsRead,
        broadcastActivity,
        joinUserPresence,
        leaveUserPresence,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};
