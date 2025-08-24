import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xmuvtxtspyqwvelvuusr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXZ0eHRzcHlxd3ZlbHZ1dXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODI4MjcsImV4cCI6MjA3MTQ1ODgyN30.-ZC9RB2i7kHN-d-nL7uQOG-hT7khyxMrIER8Tv9x0d0";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types (shared with server)
export interface User {
  id: string;
  name: string;
  email: string;
  monthly_target: number;
  goals: {
    carbon_reduction: number;
    transport_reduction: number;
    renewable_energy: number;
  };
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: "transport" | "energy" | "food" | "shopping";
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

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: "achievement" | "tip" | "question" | "challenge";
  likes: number;
  comments_count: number;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

// Auth helpers
export const getSessionToken = () => localStorage.getItem("carbonmeter_session_token");

export const setSessionToken = (token: string) => 
  localStorage.setItem("carbonmeter_session_token", token);

export const removeSessionToken = () => 
  localStorage.removeItem("carbonmeter_session_token");

// API helpers with auth
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getSessionToken();
  
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

// Google OAuth configuration
export const GOOGLE_CLIENT_ID = "your-google-client-id"; // This should be set via environment variable
