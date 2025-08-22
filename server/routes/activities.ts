import { RequestHandler } from "express";
import { z } from "zod";
import { supabase, Activity } from "../lib/supabase";

// Validation schemas
const createActivitySchema = z.object({
  type: z.enum(["transport", "energy", "food", "shopping"]),
  description: z.string().min(1, "Description is required"),
  impact: z.number().min(0, "Impact must be positive"),
  unit: z.string().default("kg CO₂"),
  date: z.string().datetime(),
  category: z.string().min(1, "Category is required"),
  details: z
    .object({
      distance: z.number().optional(),
      vehicle_type: z.string().optional(),
      energy_amount: z.number().optional(),
      energy_source: z.string().optional(),
      meal_type: z.string().optional(),
      food_type: z.string().optional(),
      item_type: z.string().optional(),
      quantity: z.number().optional(),
    })
    .default({}),
});

const updateActivitySchema = createActivitySchema.partial();

// Get all activities for a user
export const handleGetActivities: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { limit, offset, type, startDate, endDate } = req.query;

    let query = supabase.from("activities").select("*").eq("user_id", userId);

    // Apply filters
    if (type && typeof type === "string") {
      query = query.eq("type", type);
    }

    if (startDate && typeof startDate === "string") {
      query = query.gte("date", startDate);
    }

    if (endDate && typeof endDate === "string") {
      query = query.lte("date", endDate);
    }

    // Apply sorting (newest first)
    query = query.order("date", { ascending: false });

    // Apply pagination
    const limitNum = limit ? parseInt(limit as string) : undefined;
    const offsetNum = offset ? parseInt(offset as string) : 0;

    if (limitNum) {
      query = query.range(offsetNum, offsetNum + limitNum - 1);
    }

    const { data: activities, error, count } = await query;

    if (error) {
      console.error("Get activities error:", error);
      return res.status(500).json({ error: "Failed to fetch activities" });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    res.json({
      activities: activities || [],
      total: totalCount || 0,
    });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get single activity
export const handleGetActivity: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { data: activity, error } = await supabase
      .from("activities")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Activity not found" });
      }
      console.error("Get activity error:", error);
      return res.status(500).json({ error: "Failed to fetch activity" });
    }

    res.json({ activity });
  } catch (error) {
    console.error("Get activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new activity
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
        details: activityData.details,
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

// Update activity
export const handleUpdateActivity: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const updates = updateActivitySchema.parse(req.body);

    // Build update object
    const updateObj: any = {};
    if (updates.type) updateObj.type = updates.type;
    if (updates.description) updateObj.description = updates.description;
    if (updates.impact !== undefined) updateObj.impact = updates.impact;
    if (updates.unit) updateObj.unit = updates.unit;
    if (updates.date) updateObj.date = updates.date;
    if (updates.category) updateObj.category = updates.category;
    if (updates.details) updateObj.details = updates.details;

    const { data: activity, error } = await supabase
      .from("activities")
      .update(updateObj)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Activity not found" });
      }
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

// Delete activity
export const handleDeleteActivity: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

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

// Get activity analytics
export const handleGetAnalytics: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { period = "month" } = req.query;

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get activities for the specified period
    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate.toISOString())
      .order("date", { ascending: false });

    if (error) {
      console.error("Get analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }

    // Calculate total footprint
    const totalFootprint = activities.reduce(
      (total, activity) => total + activity.impact,
      0,
    );

    // Calculate footprint by category
    const categoryTotals = activities.reduce(
      (totals, activity) => {
        if (!totals[activity.type]) {
          totals[activity.type] = 0;
        }
        totals[activity.type] += activity.impact;
        return totals;
      },
      {} as Record<string, number>,
    );

    const footprintByCategory = [
      {
        name: "Transportation",
        value: categoryTotals.transport || 0,
        color: "#3b82f6",
      },
      { name: "Energy", value: categoryTotals.energy || 0, color: "#10b981" },
      { name: "Food", value: categoryTotals.food || 0, color: "#f59e0b" },
      {
        name: "Shopping",
        value: categoryTotals.shopping || 0,
        color: "#8b5cf6",
      },
    ].filter((category) => category.value > 0);

    // Calculate trend data (last 6 periods)
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const periodStart = new Date();
      const periodEnd = new Date();

      if (period === "week") {
        periodStart.setDate(now.getDate() - (i + 1) * 7);
        periodEnd.setDate(now.getDate() - i * 7);
      } else {
        periodStart.setMonth(now.getMonth() - (i + 1));
        periodEnd.setMonth(now.getMonth() - i);
      }

      const periodActivities = activities.filter((activity) => {
        const activityDate = new Date(activity.date);
        return activityDate >= periodStart && activityDate < periodEnd;
      });

      const periodTotal = periodActivities.reduce(
        (total, activity) => total + activity.impact,
        0,
      );

      trendData.push({
        name:
          period === "week"
            ? `Week ${i + 1}`
            : periodStart.toLocaleDateString("en-US", { month: "short" }),
        value: Math.round(periodTotal * 100) / 100,
      });
    }

    res.json({
      period,
      totalFootprint: Math.round(totalFootprint * 100) / 100,
      dailyAverage:
        Math.round((totalFootprint / (period === "week" ? 7 : 30)) * 100) / 100,
      activityCount: activities.length,
      footprintByCategory,
      trendData,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get recent activities (for dashboard)
export const handleGetRecentActivities: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Get recent activities error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch recent activities" });
    }

    res.json({ activities: activities || [] });
  } catch (error) {
    console.error("Get recent activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Bulk delete activities (for cleanup)
export const handleBulkDeleteActivities: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { activityIds } = req.body;

    if (!Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ error: "Activity IDs array is required" });
    }

    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("user_id", userId)
      .in("id", activityIds);

    if (error) {
      console.error("Bulk delete activities error:", error);
      return res.status(500).json({ error: "Failed to delete activities" });
    }

    res.json({
      message: `Successfully deleted ${activityIds.length} activities`,
      deletedCount: activityIds.length,
    });
  } catch (error) {
    console.error("Bulk delete activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
