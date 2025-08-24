import { RequestHandler } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase";

// Validation schemas
const createActivitySchema = z.object({
  type: z.enum(["transport", "energy", "food", "shopping"]),
  description: z.string().min(1, "Description is required"),
  impact: z.number().min(0, "Impact must be positive"),
  unit: z.string().min(1, "Unit is required"),
  date: z.string().datetime(),
  category: z.string().min(1, "Category is required"),
  details: z.object({
    distance: z.number().optional(),
    vehicle_type: z.string().optional(),
    energy_amount: z.number().optional(),
    energy_source: z.string().optional(),
    meal_type: z.string().optional(),
    food_type: z.string().optional(),
    item_type: z.string().optional(),
    quantity: z.number().optional(),
  }).optional(),
});

const updateActivitySchema = createActivitySchema.partial();

// Get all activities for the authenticated user
export const handleGetActivities: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get activities error:", error);
      return res.status(500).json({ error: "Failed to fetch activities" });
    }

    res.json({ activities: activities || [] });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new activity
export const handleCreateActivity: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const activityData = createActivitySchema.parse(req.body);

    const { data: activity, error } = await supabase
      .from("activities")
      .insert({
        user_id: userId,
        type: activityData.type,
        description: activityData.description,
        impact: activityData.impact,
        unit: activityData.unit,
        date: activityData.date,
        category: activityData.category,
        details: activityData.details || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Create activity error:", error);
      return res.status(500).json({ error: "Failed to create activity" });
    }

    res.status(201).json({ activity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Create activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an activity
export const handleUpdateActivity: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const activityId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const updates = updateActivitySchema.parse(req.body);

    // Verify the activity belongs to the user
    const { data: existingActivity, error: fetchError } = await supabase
      .from("activities")
      .select("user_id")
      .eq("id", activityId)
      .single();

    if (fetchError || !existingActivity || existingActivity.user_id !== userId) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const { data: activity, error } = await supabase
      .from("activities")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activityId)
      .select()
      .single();

    if (error) {
      console.error("Update activity error:", error);
      return res.status(500).json({ error: "Failed to update activity" });
    }

    res.json({ activity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Update activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an activity
export const handleDeleteActivity: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const activityId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify the activity belongs to the user
    const { data: existingActivity, error: fetchError } = await supabase
      .from("activities")
      .select("user_id")
      .eq("id", activityId)
      .single();

    if (fetchError || !existingActivity || existingActivity.user_id !== userId) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId);

    if (error) {
      console.error("Delete activity error:", error);
      return res.status(500).json({ error: "Failed to delete activity" });
    }

    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Delete activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get activity statistics
export const handleGetActivityStats: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { period = "month" } = req.query;
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get activities for the period
    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate.toISOString());

    if (error) {
      console.error("Get activity stats error:", error);
      return res.status(500).json({ error: "Failed to fetch activity stats" });
    }

    // Calculate stats
    const totalImpact = activities?.reduce((sum, activity) => sum + activity.impact, 0) || 0;
    const activityCount = activities?.length || 0;

    const byCategory = activities?.reduce((acc: any, activity) => {
      if (!acc[activity.type]) {
        acc[activity.type] = { count: 0, impact: 0 };
      }
      acc[activity.type].count++;
      acc[activity.type].impact += activity.impact;
      return acc;
    }, {}) || {};

    // Trend data (last 6 months)
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthActivities = activities?.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= monthStart && activityDate <= monthEnd;
      }) || [];

      const monthImpact = monthActivities.reduce((sum, activity) => sum + activity.impact, 0);

      trendData.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        impact: Math.round(monthImpact * 100) / 100,
        count: monthActivities.length,
      });
    }

    res.json({
      stats: {
        totalImpact: Math.round(totalImpact * 100) / 100,
        activityCount,
        byCategory,
        trendData,
        period,
      },
    });
  } catch (error) {
    console.error("Get activity stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
