import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeDatabase } from "./lib/initDb";
import {
  rateLimit,
  sanitizeInput,
  securityHeaders,
  detectSuspiciousActivity,
} from "./middleware/validation";
import { handleDemo } from "./routes/demo";
import {
  handleRegister,
  handleLogin,
  handleGetUser,
  handleUpdateProfile,
  handleLogout,
  requireAuth,
} from "./routes/auth";
import {
  handleGetActivities,
  handleGetActivity,
  handleCreateActivity,
  handleUpdateActivity,
  handleDeleteActivity,
  handleGetAnalytics,
  handleGetRecentActivities,
  handleBulkDeleteActivities,
  handleGetActivityStats,
} from "./routes/activities";
import {
  handleGetPosts,
  handleCreatePost,
  handleToggleLike,
  handleGetComments,
  handleCreateComment,
  handleGetChallenges,
  handleJoinChallenge,
  handleGetLeaderboard,
} from "./routes/community";

export function createServer() {
  const app = express();

  // Initialize database on startup (async, non-blocking)
  initializeDatabase();

  // Security middleware
  app.use(securityHeaders);
  // More generous rate limit for development
  app.use(rateLimit(10000, 15 * 60 * 1000)); // 10000 requests per 15 minutes for dev
  app.use(detectSuspiciousActivity);

  // Basic middleware
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? ["https://your-domain.com"] // Replace with your production domain
          : true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(sanitizeInput);

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/me", requireAuth, handleGetUser);
  app.put("/api/auth/profile", requireAuth, handleUpdateProfile);
  app.post("/api/auth/logout", requireAuth, handleLogout);

  // Activity routes (all require authentication)
  app.get("/api/activities", requireAuth, handleGetActivities);
  app.get("/api/activities/recent", requireAuth, handleGetRecentActivities);
  app.get("/api/activities/analytics", requireAuth, handleGetAnalytics);
  app.get("/api/activities/stats", requireAuth, handleGetActivityStats);
  app.get("/api/activities/:id", requireAuth, handleGetActivity);
  app.post("/api/activities", requireAuth, handleCreateActivity);
  app.put("/api/activities/:id", requireAuth, handleUpdateActivity);
  app.delete("/api/activities/:id", requireAuth, handleDeleteActivity);
  app.delete("/api/activities", requireAuth, handleBulkDeleteActivities);

  // Community routes
  app.get("/api/community/posts", handleGetPosts);
  app.post("/api/community/posts", requireAuth, handleCreatePost);
  app.post("/api/community/posts/:postId/like", requireAuth, handleToggleLike);
  app.get("/api/community/posts/:postId/comments", handleGetComments);
  app.post("/api/community/posts/:postId/comments", requireAuth, handleCreateComment);
  app.get("/api/community/challenges", handleGetChallenges);
  app.post("/api/community/challenges/:challengeId/join", requireAuth, handleJoinChallenge);
  app.get("/api/community/leaderboard", handleGetLeaderboard);

  // Error handling middleware
  app.use(
    (
      error: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
