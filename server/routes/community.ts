import { RequestHandler } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase";

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  type: z.enum(["achievement", "tip", "question", "challenge"]),
});

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

// Get community posts with pagination
export const handleGetPosts: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from("community_posts")
      .select(`
        *,
        users:user_id (name, email)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (type) {
      query = query.eq("type", type);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("Get posts error:", error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true });

    if (type) {
      countQuery = countQuery.eq("type", type);
    }

    const { count } = await countQuery;

    res.json({
      posts: posts || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new community post
export const handleCreatePost: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const postData = createPostSchema.parse(req.body);

    const { data: post, error } = await supabase
      .from("community_posts")
      .insert({
        user_id: userId,
        title: postData.title,
        content: postData.content,
        type: postData.type,
        likes: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        users:user_id (name, email)
      `)
      .single();

    if (error) {
      console.error("Create post error:", error);
      return res.status(500).json({ error: "Failed to create post" });
    }

    res.status(201).json({ post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Create post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Like/Unlike a post
export const handleToggleLike: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const postId = req.params.postId;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if user already liked this post
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .single();

    if (existingLike) {
      // Unlike the post
      await supabase
        .from("post_likes")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);

      // Decrease like count
      await supabase.rpc("decrement_post_likes", { post_id: postId });

      res.json({ liked: false, message: "Post unliked" });
    } else {
      // Like the post
      await supabase
        .from("post_likes")
        .insert({
          user_id: userId,
          post_id: postId,
          created_at: new Date().toISOString(),
        });

      // Increase like count
      await supabase.rpc("increment_post_likes", { post_id: postId });

      res.json({ liked: true, message: "Post liked" });
    }
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get comments for a post
export const handleGetComments: RequestHandler = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { data: comments, error } = await supabase
      .from("post_comments")
      .select(`
        *,
        users:user_id (name, email)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      console.error("Get comments error:", error);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }

    res.json({ comments: comments || [] });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a comment on a post
export const handleCreateComment: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const postId = req.params.postId;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const commentData = createCommentSchema.parse(req.body);

    const { data: comment, error } = await supabase
      .from("post_comments")
      .insert({
        user_id: userId,
        post_id: postId,
        content: commentData.content,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        users:user_id (name, email)
      `)
      .single();

    if (error) {
      console.error("Create comment error:", error);
      return res.status(500).json({ error: "Failed to create comment" });
    }

    // Increment comment count on the post
    await supabase.rpc("increment_post_comments", { post_id: postId });

    res.status(201).json({ comment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get community challenges
export const handleGetChallenges: RequestHandler = async (req, res) => {
  try {
    const { status = "active" } = req.query;

    let query = supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (status === "active") {
      const now = new Date().toISOString();
      query = query.lte("start_date", now).gte("end_date", now);
    }

    const { data: challenges, error } = await query;

    if (error) {
      console.error("Get challenges error:", error);
      return res.status(500).json({ error: "Failed to fetch challenges" });
    }

    res.json({ challenges: challenges || [] });
  } catch (error) {
    console.error("Get challenges error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Join a challenge
export const handleJoinChallenge: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const challengeId = req.params.challengeId;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if user is already participating
    const { data: existingParticipation } = await supabase
      .from("challenge_participants")
      .select("id")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .single();

    if (existingParticipation) {
      return res.status(400).json({ error: "Already participating in this challenge" });
    }

    const { error } = await supabase
      .from("challenge_participants")
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        joined_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Join challenge error:", error);
      return res.status(500).json({ error: "Failed to join challenge" });
    }

    res.json({ message: "Successfully joined challenge" });
  } catch (error) {
    console.error("Join challenge error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get leaderboard
export const handleGetLeaderboard: RequestHandler = async (req, res) => {
  try {
    const { period = "month", category = "overall" } = req.query;
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

    // Get user carbon footprint rankings
    const { data: leaderboard, error } = await supabase.rpc("get_leaderboard", {
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
      category_filter: category === "overall" ? null : category,
    });

    if (error) {
      console.error("Get leaderboard error:", error);
      return res.status(500).json({ error: "Failed to fetch leaderboard" });
    }

    res.json({
      leaderboard: leaderboard || [],
      period,
      category,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
