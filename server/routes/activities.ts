import { RequestHandler } from "express";
import { z } from "zod";

// Activity interface matching the frontend
interface Activity {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for demo (replace with database in production)
const activities: Map<string, Activity> = new Map();

// Validation schemas
const createActivitySchema = z.object({
  type: z.enum(['transport', 'energy', 'food', 'shopping']),
  description: z.string().min(1, "Description is required"),
  impact: z.number().min(0, "Impact must be positive"),
  unit: z.string().default("kg CO₂"),
  date: z.string().datetime(),
  category: z.string().min(1, "Category is required"),
  details: z.object({
    distance: z.number().optional(),
    vehicleType: z.string().optional(),
    energyAmount: z.number().optional(),
    energySource: z.string().optional(),
    mealType: z.string().optional(),
    foodType: z.string().optional(),
    itemType: z.string().optional(),
    quantity: z.number().optional(),
  }).default({}),
});

const updateActivitySchema = createActivitySchema.partial();

// Helper functions
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Get all activities for a user
export const handleGetActivities: RequestHandler = (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { limit, offset, type, startDate, endDate } = req.query;
    
    // Get user's activities
    let userActivities = Array.from(activities.values())
      .filter(activity => activity.userId === userId);

    // Apply filters
    if (type && typeof type === 'string') {
      userActivities = userActivities.filter(activity => activity.type === type);
    }

    if (startDate && typeof startDate === 'string') {
      userActivities = userActivities.filter(activity => 
        new Date(activity.date) >= new Date(startDate)
      );
    }

    if (endDate && typeof endDate === 'string') {
      userActivities = userActivities.filter(activity => 
        new Date(activity.date) <= new Date(endDate)
      );
    }

    // Sort by date (newest first)
    userActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    const limitNum = limit ? parseInt(limit as string) : undefined;
    const offsetNum = offset ? parseInt(offset as string) : 0;

    if (limitNum) {
      userActivities = userActivities.slice(offsetNum, offsetNum + limitNum);
    }

    // Remove userId from response for security
    const responseActivities = userActivities.map(({ userId: _, ...activity }) => activity);

    res.json({
      activities: responseActivities,
      total: Array.from(activities.values()).filter(a => a.userId === userId).length,
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single activity
export const handleGetActivity: RequestHandler = (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const activity = activities.get(id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove userId from response
    const { userId: _, ...responseActivity } = activity;
    res.json({ activity: responseActivity });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new activity
export const handleCreateActivity: RequestHandler = (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const activityData = createActivitySchema.parse(req.body);
    
    const activityId = generateId();
    const now = new Date().toISOString();
    
    const activity: Activity = {
      id: activityId,
      userId,
      ...activityData,
      createdAt: now,
      updatedAt: now,
    };

    activities.set(activityId, activity);

    // Remove userId from response
    const { userId: _, ...responseActivity } = activity;
    res.status(201).json({ activity: responseActivity });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update activity
export const handleUpdateActivity: RequestHandler = (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const activity = activities.get(id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = updateActivitySchema.parse(req.body);
    
    const updatedActivity: Activity = {
      ...activity,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    activities.set(id, updatedActivity);

    // Remove userId from response
    const { userId: _, ...responseActivity } = updatedActivity;
    res.json({ activity: responseActivity });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete activity
export const handleDeleteActivity: RequestHandler = (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const activity = activities.get(id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    activities.delete(id);
    res.json({ message: 'Activity deleted successfully' });

  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get activity analytics
export const handleGetAnalytics: RequestHandler = (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { period = 'month' } = req.query;
    
    // Get user's activities
    const userActivities = Array.from(activities.values())
      .filter(activity => activity.userId === userId);

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Filter activities by date range
    const periodActivities = userActivities.filter(activity => 
      new Date(activity.date) >= startDate
    );

    // Calculate total footprint
    const totalFootprint = periodActivities.reduce((total, activity) => 
      total + activity.impact, 0
    );

    // Calculate footprint by category
    const categoryTotals = periodActivities.reduce((totals, activity) => {
      if (!totals[activity.type]) {
        totals[activity.type] = 0;
      }
      totals[activity.type] += activity.impact;
      return totals;
    }, {} as Record<string, number>);

    const footprintByCategory = [
      { name: 'Transportation', value: categoryTotals.transport || 0, color: '#3b82f6' },
      { name: 'Energy', value: categoryTotals.energy || 0, color: '#10b981' },
      { name: 'Food', value: categoryTotals.food || 0, color: '#f59e0b' },
      { name: 'Shopping', value: categoryTotals.shopping || 0, color: '#8b5cf6' },
    ].filter(category => category.value > 0);

    // Calculate trend data (last 6 periods)
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const periodStart = new Date();
      const periodEnd = new Date();
      
      if (period === 'week') {
        periodStart.setDate(now.getDate() - (i + 1) * 7);
        periodEnd.setDate(now.getDate() - i * 7);
      } else {
        periodStart.setMonth(now.getMonth() - (i + 1));
        periodEnd.setMonth(now.getMonth() - i);
      }

      const periodActivities = userActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= periodStart && activityDate < periodEnd;
      });

      const periodTotal = periodActivities.reduce((total, activity) => 
        total + activity.impact, 0
      );

      trendData.push({
        name: period === 'week' 
          ? `Week ${i + 1}` 
          : periodStart.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.round(periodTotal * 100) / 100,
      });
    }

    res.json({
      period,
      totalFootprint: Math.round(totalFootprint * 100) / 100,
      dailyAverage: Math.round((totalFootprint / (period === 'week' ? 7 : 30)) * 100) / 100,
      activityCount: periodActivities.length,
      footprintByCategory,
      trendData,
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create demo activities for the demo user
export const createDemoActivities = (userId: string) => {
  const demoActivities: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      userId,
      type: 'transport',
      description: '15 miles by Car',
      impact: 6.0,
      unit: 'kg CO₂',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      category: 'Car',
      details: { vehicleType: 'Car', distance: 15 }
    },
    {
      userId,
      type: 'energy',
      description: '25 kWh from Grid Electricity',
      impact: 12.5,
      unit: 'kg CO₂',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      category: 'Grid Electricity',
      details: { energySource: 'Grid Electricity', energyAmount: 25 }
    },
    {
      userId,
      type: 'food',
      description: 'Beef Lunch',
      impact: 6.0,
      unit: 'kg CO₂',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      category: 'Beef',
      details: { mealType: 'Lunch', foodType: 'Beef' }
    },
    {
      userId,
      type: 'transport',
      description: '8 miles by Bus',
      impact: 0.8,
      unit: 'kg CO₂',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      category: 'Bus',
      details: { vehicleType: 'Bus', distance: 8 }
    },
    {
      userId,
      type: 'shopping',
      description: '2 Electronics items',
      impact: 10.0,
      unit: 'kg CO₂',
      date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics',
      details: { itemType: 'Electronics', quantity: 2 }
    }
  ];

  demoActivities.forEach(activityData => {
    const activityId = generateId();
    const now = new Date().toISOString();
    
    const activity: Activity = {
      id: activityId,
      ...activityData,
      createdAt: now,
      updatedAt: now,
    };

    activities.set(activityId, activity);
  });
};

// Initialize demo activities for demo user
createDemoActivities('demo-user-123');
