import { supabase } from "./supabase";
import { readFileSync } from "fs";
import { resolve } from "path";

export async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Check if tables exist
    const { data: tablesData, error: tablesError } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    if (tablesError && tablesError.code === "42P01") {
      // Tables don't exist, create them
      console.log("Creating database tables...");

      // Read and execute the schema
      try {
        const schemaPath = resolve(__dirname, "../database/schema.sql");
        const schema = readFileSync(schemaPath, "utf8");

        // Split the schema into individual statements
        const statements = schema
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith("--"));

        // Execute each statement
        for (const statement of statements) {
          try {
            const { error } = await supabase.rpc("exec_sql", {
              sql: statement,
            });
            if (error && !error.message.includes("already exists")) {
              console.warn("SQL execution warning:", error.message);
            }
          } catch (err) {
            console.warn("SQL statement skipped:", err);
          }
        }

        console.log("Database tables created successfully");
      } catch (error) {
        console.warn("Could not read schema file, using manual table creation");
        await createTablesManually();
      }
    } else {
      console.log("Database tables already exist");
    }

    // Verify demo user exists
    const { data: demoUser, error: demoError } = await supabase
      .from("users")
      .select("id")
      .eq("email", "demo@carbonmeter.com")
      .single();

    if (demoError && demoError.code === "PGRST116") {
      // Demo user doesn't exist, create it
      console.log("Creating demo user...");
      await createDemoUser();
    }

    console.log("Database initialization complete");
  } catch (error) {
    console.error("Database initialization error:", error);
    // Don't throw - allow the app to start even if DB init fails
  }
}

async function createTablesManually() {
  // Create users table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      monthly_target DECIMAL(10,2) DEFAULT 4.5,
      goals JSONB DEFAULT '{"carbon_reduction": 30, "transport_reduction": 25, "renewable_energy": 80}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Create activities table
  const createActivitiesTable = `
    CREATE TABLE IF NOT EXISTS activities (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('transport', 'energy', 'food', 'shopping')),
      description TEXT NOT NULL,
      impact DECIMAL(10,2) NOT NULL CHECK (impact >= 0),
      unit TEXT DEFAULT 'kg CO₂',
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      category TEXT NOT NULL,
      details JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Create sessions table
  const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      session_token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  const tables = [createUsersTable, createActivitiesTable, createSessionsTable];

  for (const tableSQL of tables) {
    try {
      const { error } = await supabase.rpc("exec_sql", { sql: tableSQL });
      if (error) {
        console.warn("Table creation warning:", error.message);
      }
    } catch (error) {
      console.warn("Table creation error:", error);
    }
  }
}

async function createDemoUser() {
  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        id: "demo-user-123",
        name: "Demo User",
        email: "demo@carbonmeter.com",
        monthly_target: 4.5,
        goals: {
          carbon_reduction: 30,
          transport_reduction: 25,
          renewable_energy: 80,
        },
        last_login: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      console.warn("Demo user creation error:", userError.message);
      return;
    }

    // Create demo session
    const { error: sessionError } = await supabase
      .from("user_sessions")
      .insert({
        user_id: "demo-user-123",
        session_token: "demo-session-token",
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 30 days
      });

    if (sessionError) {
      console.warn("Demo session creation error:", sessionError.message);
    }

    // Create demo activities
    const demoActivities = [
      {
        user_id: "demo-user-123",
        type: "transport",
        description: "15 miles by Car",
        impact: 6.0,
        unit: "kg CO₂",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: "Car",
        details: { vehicle_type: "Car", distance: 15 },
      },
      {
        user_id: "demo-user-123",
        type: "energy",
        description: "25 kWh from Grid Electricity",
        impact: 12.5,
        unit: "kg CO₂",
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        category: "Grid Electricity",
        details: { energy_source: "Grid Electricity", energy_amount: 25 },
      },
      {
        user_id: "demo-user-123",
        type: "food",
        description: "Beef Lunch",
        impact: 6.0,
        unit: "kg CO₂",
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        category: "Beef",
        details: { meal_type: "Lunch", food_type: "Beef" },
      },
    ];

    const { error: activitiesError } = await supabase
      .from("activities")
      .insert(demoActivities);

    if (activitiesError) {
      console.warn("Demo activities creation error:", activitiesError.message);
    }

    console.log("Demo user and data created successfully");
  } catch (error) {
    console.warn("Demo user creation error:", error);
  }
}
