import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmuvtxtspyqwvelvuusr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXZ0eHRzcHlxd3ZlbHZ1dXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODI4MjcsImV4cCI6MjA3MTQ1ODgyN30.-ZC9RB2i7kHN-d-nL7uQOG-hT7khyxMrIER8Tv9x0d0';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
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

// Helper function to initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    const { error: usersError } = await supabase.rpc('create_users_table');
    if (usersError && !usersError.message.includes('already exists')) {
      console.error('Error creating users table:', usersError);
    }

    // Create activities table
    const { error: activitiesError } = await supabase.rpc('create_activities_table');
    if (activitiesError && !activitiesError.message.includes('already exists')) {
      console.error('Error creating activities table:', activitiesError);
    }

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}
