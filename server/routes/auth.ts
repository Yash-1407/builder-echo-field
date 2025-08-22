import { RequestHandler } from "express";
import { z } from "zod";

// In-memory storage for demo (in production, use a proper database)
interface User {
  id: string;
  name: string;
  email: string;
  monthlyTarget: number;
  goals: {
    carbonReduction: number;
    transportReduction: number;
    renewableEnergy: number;
  };
  createdAt: string;
  lastLogin: string;
}

// Simple in-memory store (replace with database in production)
const users: Map<string, User> = new Map();
const sessions: Map<string, string> = new Map(); // sessionToken -> userId

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
  goals: z.object({
    carbonReduction: z.number().min(0).max(100).optional(),
    transportReduction: z.number().min(0).max(100).optional(),
    renewableEnergy: z.number().min(0).max(100).optional(),
  }).optional(),
});

// Helper functions
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
const generateSessionToken = () => Math.random().toString(36).substr(2, 15) + Date.now().toString(36);

// Middleware to verify authentication
export const requireAuth: RequestHandler = (req, res, next) => {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'No session token provided' });
  }
  
  const userId = sessions.get(sessionToken);
  if (!userId || !users.has(userId)) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  req.user = { id: userId };
  next();
};

// Register endpoint
export const handleRegister: RequestHandler = (req, res) => {
  try {
    const { name, email, monthlyTarget } = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = Array.from(users.values()).find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create new user
    const userId = generateId();
    const user: User = {
      id: userId,
      name,
      email,
      monthlyTarget,
      goals: {
        carbonReduction: 30,
        transportReduction: 25,
        renewableEnergy: 80,
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    
    users.set(userId, user);
    
    // Create session
    const sessionToken = generateSessionToken();
    sessions.set(sessionToken, userId);
    
    // Return user data and session token
    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyTarget: user.monthlyTarget,
        goals: user.goals,
      },
      sessionToken,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login endpoint
export const handleLogin: RequestHandler = (req, res) => {
  try {
    const { email } = loginSchema.parse(req.body);
    
    // Find user by email
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    // Create session
    const sessionToken = generateSessionToken();
    sessions.set(sessionToken, user.id);
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyTarget: user.monthlyTarget,
        goals: user.goals,
      },
      sessionToken,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user endpoint
export const handleGetUser: RequestHandler = (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = users.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyTarget: user.monthlyTarget,
        goals: user.goals,
      },
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update profile endpoint
export const handleUpdateProfile: RequestHandler = (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const updates = updateProfileSchema.parse(req.body);
    const user = users.get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user fields
    if (updates.name) user.name = updates.name;
    if (updates.monthlyTarget) user.monthlyTarget = updates.monthlyTarget;
    if (updates.goals) {
      user.goals = { ...user.goals, ...updates.goals };
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyTarget: user.monthlyTarget,
        goals: user.goals,
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout endpoint
export const handleLogout: RequestHandler = (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (sessionToken) {
      sessions.delete(sessionToken);
    }
    
    res.json({ message: 'Logged out successfully' });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Demo user creation for development
export const createDemoUser = () => {
  const demoUserId = 'demo-user-123';
  const demoUser: User = {
    id: demoUserId,
    name: 'Demo User',
    email: 'demo@carbonmeter.com',
    monthlyTarget: 4.5,
    goals: {
      carbonReduction: 30,
      transportReduction: 25,
      renewableEnergy: 80,
    },
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  
  users.set(demoUserId, demoUser);
  
  // Create a long-lasting session for demo
  const demoSessionToken = 'demo-session-token';
  sessions.set(demoSessionToken, demoUserId);
  
  return { user: demoUser, sessionToken: demoSessionToken };
};

// Initialize demo user on module load
createDemoUser();
