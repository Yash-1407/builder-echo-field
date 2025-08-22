import { RequestHandler } from "express";
import { z } from "zod";
import { supabase, User } from "../lib/supabase";

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  monthlyTarget: z.number().min(0.1).max(50).default(4.5),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  monthlyTarget: z.number().min(0.1).max(50).optional(),
  goals: z
    .object({
      carbon_reduction: z.number().min(0).max(100).optional(),
      transport_reduction: z.number().min(0).max(100).optional(),
      renewable_energy: z.number().min(0).max(100).optional(),
    })
    .optional(),
});

// Helper functions
const generateSessionToken = () =>
  Math.random().toString(36).substr(2, 15) + Date.now().toString(36);

// Middleware to verify authentication
export const requireAuth: RequestHandler = async (req, res, next) => {
  const sessionToken = req.headers.authorization?.replace("Bearer ", "");

  if (!sessionToken) {
    return res.status(401).json({ error: "No session token provided" });
  }

  try {
    // Check if session exists and is valid
    const { data: session, error } = await supabase
      .from("user_sessions")
      .select("user_id, expires_at")
      .eq("session_token", sessionToken)
      .single();

    if (error || !session) {
      return res.status(401).json({ error: "Invalid session token" });
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase
        .from("user_sessions")
        .delete()
        .eq("session_token", sessionToken);

      return res.status(401).json({ error: "Session expired" });
    }

    req.user = { id: session.user_id };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Register endpoint
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { name, email, monthlyTarget } = registerSchema.parse(req.body);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Create new user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        name,
        email,
        monthly_target: monthlyTarget,
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
      console.error("User creation error:", userError);
      return res.status(500).json({ error: "Failed to create user" });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const { error: sessionError } = await supabase
      .from("user_sessions")
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      return res.status(500).json({ error: "Failed to create session" });
    }

    // Return user data and session token
    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyTarget: user.monthly_target,
        goals: user.goals,
      },
      sessionToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login endpoint
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email } = loginSchema.parse(req.body);

    // Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Clean up old sessions for this user
    await supabase
      .from("user_sessions")
      .delete()
      .eq("user_id", user.id)
      .lt("expires_at", new Date().toISOString());

    // Create new session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const { error: sessionError } = await supabase
      .from("user_sessions")
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      return res.status(500).json({ error: "Failed to create session" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyTarget: user.monthly_target,
        goals: user.goals,
      },
      sessionToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current user endpoint
export const handleGetUser: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyTarget: user.monthly_target,
        goals: user.goals,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update profile endpoint
export const handleUpdateProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const updates = updateProfileSchema.parse(req.body);

    // Build update object
    const updateObj: any = {};
    if (updates.name) updateObj.name = updates.name;
    if (updates.monthlyTarget) updateObj.monthly_target = updates.monthlyTarget;
    if (updates.goals) {
      // Merge with existing goals
      const { data: currentUser } = await supabase
        .from("users")
        .select("goals")
        .eq("id", userId)
        .single();

      updateObj.goals = {
        ...(currentUser?.goals || {}),
        ...updates.goals,
      };
    }

    const { data: user, error } = await supabase
      .from("users")
      .update(updateObj)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyTarget: user.monthly_target,
        goals: user.goals,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout endpoint
export const handleLogout: RequestHandler = async (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace("Bearer ", "");

    if (sessionToken) {
      await supabase
        .from("user_sessions")
        .delete()
        .eq("session_token", sessionToken);
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
