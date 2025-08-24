import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActivity } from "@/contexts/ActivityContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import { apiCall } from "@/lib/supabase";
import {
  Users,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  Leaf,
  Calendar,
  Search,
  Filter,
  Share2,
  Heart,
  MessageCircle,
  UserPlus,
  Star,
  MapPin,
  Clock,
  Plus,
  Send,
  ThumbsUp,
  Eye,
  Zap,
  Globe,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "individual" | "team" | "global";
  category: "transport" | "energy" | "food" | "waste" | "lifestyle";
  target: number;
  unit: string;
  start_date: string;
  end_date: string;
  participants_count: number;
  user_progress?: number;
  is_joined: boolean;
  reward_points: number;
  difficulty: "easy" | "medium" | "hard";
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  type: "achievement" | "tip" | "question" | "challenge";
  likes: number;
  comments_count: number;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  is_liked?: boolean;
}

interface LeaderboardEntry {
  rank: number;
  user_name: string;
  total_carbon_saved: number;
  activities_count: number;
  streak_days: number;
  change_percentage: number;
}

export default function CommunityHub() {
  const { state } = useActivity();
  const { state: realtimeState, addNotification } = useRealtime();
  const [activeTab, setActiveTab] = useState("challenges");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Post creation
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    type: "tip" as const,
  });

  // Load data on mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Listen for realtime community updates
  useEffect(() => {
    if (realtimeState.communityActivity.length > 0) {
      const latestActivity = realtimeState.communityActivity[0];
      if (latestActivity.type === "community_post") {
        // Refresh posts when new community activity detected
        if (activeTab === "community") {
          loadPosts();
        }

        addNotification({
          type: "info",
          title: "New Community Activity! 👥",
          message: "Someone just shared a new post in the community.",
          action: {
            label: "View Community",
            href: "/community",
          },
        });
      }
    }
  }, [realtimeState.communityActivity, activeTab, addNotification]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case "challenges":
          await loadChallenges();
          break;
        case "community":
          await loadPosts();
          break;
        case "leaderboard":
          await loadLeaderboard();
          break;
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load community data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadChallenges = async () => {
    try {
      const response = await apiCall("/community/challenges");
      setChallenges(response.challenges || []);
    } catch (error) {
      // Use mock data if API fails
      setChallenges([
        {
          id: "1",
          title: "Zero Car Week",
          description:
            "Go a full week without using a car. Use walking, cycling, or public transport instead.",
          type: "individual",
          category: "transport",
          target: 7,
          unit: "days",
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          participants_count: 1247,
          user_progress: 42,
          is_joined: false,
          reward_points: 500,
          difficulty: "medium",
        },
        {
          id: "2",
          title: "Plant-Based Month",
          description:
            "Commit to a plant-based diet for 30 days and track your carbon footprint reduction.",
          type: "global",
          category: "food",
          target: 30,
          unit: "days",
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          participants_count: 3421,
          user_progress: 67,
          is_joined: true,
          reward_points: 1000,
          difficulty: "hard",
        },
        {
          id: "3",
          title: "Energy Saver Challenge",
          description: "Reduce your home energy consumption by 20% this month.",
          type: "team",
          category: "energy",
          target: 20,
          unit: "% reduction",
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          participants_count: 856,
          user_progress: 15,
          is_joined: false,
          reward_points: 750,
          difficulty: "easy",
        },
      ]);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await apiCall("/community/posts?limit=20");
      setPosts(response.posts || []);
    } catch (error) {
      // Use mock data if API fails
      setPosts([
        {
          id: "1",
          title: "Zero Waste Week Success!",
          content:
            "Just completed my first zero-waste week! Amazing how much plastic we use without thinking about it. Small changes, big impact! 🌍",
          type: "achievement",
          likes: 34,
          comments_count: 12,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: { name: "Sarah Chen", email: "sarah@example.com" },
          is_liked: false,
        },
        {
          id: "2",
          title: "Cycling to Work Benefits",
          content:
            "Switched to cycling for my daily commute. Not only am I reducing my carbon footprint by 3.2 kg CO₂ per day, but I feel so much healthier! Who else is part of the bike-to-work movement?",
          type: "tip",
          likes: 67,
          comments_count: 23,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          user: { name: "Marcus Johnson", email: "marcus@example.com" },
          is_liked: true,
        },
        {
          id: "3",
          title: "Home Vegetable Garden",
          content:
            "My vegetable garden is thriving! Growing your own food is incredibly rewarding and sustainable. Here's what I harvested this week 🥬🍅",
          type: "tip",
          likes: 45,
          comments_count: 18,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          user: { name: "Elena Rodriguez", email: "elena@example.com" },
          is_liked: false,
        },
      ]);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await apiCall("/community/leaderboard?period=month");
      setLeaderboard(response.leaderboard || []);
    } catch (error) {
      // Use mock data if API fails
      setLeaderboard([
        {
          rank: 1,
          user_name: "Alex Thompson",
          total_carbon_saved: 125.4,
          activities_count: 89,
          streak_days: 23,
          change_percentage: 12,
        },
        {
          rank: 2,
          user_name: "Maya Patel",
          total_carbon_saved: 118.7,
          activities_count: 76,
          streak_days: 18,
          change_percentage: -3,
        },
        {
          rank: 3,
          user_name: "Carlos Rivera",
          total_carbon_saved: 102.3,
          activities_count: 64,
          streak_days: 15,
          change_percentage: 8,
        },
        {
          rank: 4,
          user_name: state.user?.name || "You",
          total_carbon_saved: 87.2,
          activities_count: 52,
          streak_days: 12,
          change_percentage: 15,
        },
      ]);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiCall("/community/posts", {
        method: "POST",
        body: JSON.stringify(newPost),
      });

      setPosts([response.post, ...posts]);
      setNewPost({ title: "", content: "", type: "tip" });
      setShowCreatePost(false);

      toast({
        title: "Post Created! 🎉",
        description: "Your post has been shared with the community.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await apiCall(`/community/posts/${postId}/like`, {
        method: "POST",
      });

      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: post.is_liked ? post.likes - 1 : post.likes + 1,
                is_liked: !post.is_liked,
              }
            : post,
        ),
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await apiCall(`/community/challenges/${challengeId}/join`, {
        method: "POST",
      });

      setChallenges(
        challenges.map((challenge) =>
          challenge.id === challengeId
            ? {
                ...challenge,
                is_joined: true,
                participants_count: challenge.participants_count + 1,
              }
            : challenge,
        ),
      );

      toast({
        title: "Challenge Joined! 🎯",
        description: "You've successfully joined the challenge. Good luck!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);

    toast({
      title: "Refreshed! ✨",
      description: "Community data has been updated.",
    });
  };

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || challenge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "hard":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "transport":
        return "🚲";
      case "energy":
        return "⚡";
      case "food":
        return "🥬";
      case "waste":
        return "♻️";
      case "lifestyle":
        return "🌱";
      default:
        return "🌍";
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <Award className="h-4 w-4 text-yellow-600" />;
      case "tip":
        return <Leaf className="h-4 w-4 text-green-600" />;
      case "question":
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case "challenge":
        return <Target className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Users className="h-8 w-8 text-carbon-600" />
            </motion.div>
            Community Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect with eco-warriors worldwide and join sustainability
            challenges
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${realtimeState.isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`}
            />
            <span className="text-sm text-muted-foreground">
              {realtimeState.onlineUsers} online
            </span>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Community Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Members
                </p>
                <p className="text-2xl font-bold">
                  {(realtimeState.onlineUsers + 50143).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              +12% this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Challenges
                </p>
                <p className="text-2xl font-bold">{challenges.length + 1231}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              +3 new today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  CO₂ Saved
                </p>
                <p className="text-2xl font-bold">2.5M kg</p>
              </div>
              <Leaf className="h-8 w-8 text-eco-600" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              +840 kg today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Your Eco Score
                </p>
                <p className="text-2xl font-bold">847</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />+
              {realtimeState.achievementStreak} streak
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Find Challenges</CardTitle>
                <CardDescription>
                  Join sustainability challenges and compete with the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search challenges</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="md:w-48">
                    <Label>Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="energy">Energy</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="waste">Waste</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Challenges Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="h-80">
                        <CardContent className="p-6">
                          <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-2 bg-gray-200 rounded w-full"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  : filteredChallenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card
                          className={`h-full ${challenge.is_joined ? "ring-2 ring-primary" : ""}`}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <Badge
                                className={getDifficultyColor(
                                  challenge.difficulty,
                                )}
                              >
                                {challenge.difficulty}
                              </Badge>
                              <span className="text-2xl">
                                {getCategoryIcon(challenge.category)}
                              </span>
                            </div>
                            <CardTitle className="text-lg">
                              {challenge.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {challenge.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {challenge.user_progress !== undefined && (
                              <>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Your Progress
                                  </span>
                                  <span className="font-medium">
                                    {challenge.user_progress}%
                                  </span>
                                </div>
                                <Progress
                                  value={challenge.user_progress}
                                  className="h-2"
                                />
                              </>
                            )}

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>
                                  {challenge.participants_count.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(challenge.end_date),
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Reward
                                </p>
                                <div className="flex items-center gap-1">
                                  <Trophy className="h-4 w-4 text-yellow-600" />
                                  <span className="font-medium">
                                    {challenge.reward_points} pts
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant={
                                  challenge.is_joined ? "outline" : "default"
                                }
                                size="sm"
                                onClick={() =>
                                  !challenge.is_joined &&
                                  handleJoinChallenge(challenge.id)
                                }
                                disabled={challenge.is_joined}
                              >
                                {challenge.is_joined ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Joined
                                  </>
                                ) : (
                                  "Join Challenge"
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Create Post Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {state.user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Dialog
                      open={showCreatePost}
                      onOpenChange={setShowCreatePost}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Share your eco-journey...
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create a Post</DialogTitle>
                          <DialogDescription>
                            Share your sustainability journey with the community
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="post-type">Post Type</Label>
                            <Select
                              value={newPost.type}
                              onValueChange={(value) =>
                                setNewPost((prev) => ({
                                  ...prev,
                                  type: value as any,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tip">💡 Tip</SelectItem>
                                <SelectItem value="achievement">
                                  🏆 Achievement
                                </SelectItem>
                                <SelectItem value="question">
                                  ❓ Question
                                </SelectItem>
                                <SelectItem value="challenge">
                                  🎯 Challenge
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="post-title">Title</Label>
                            <Input
                              id="post-title"
                              placeholder="Enter a catchy title..."
                              value={newPost.title}
                              onChange={(e) =>
                                setNewPost((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="post-content">Content</Label>
                            <Textarea
                              id="post-content"
                              placeholder="Share your story, tips, or ask questions..."
                              value={newPost.content}
                              onChange={(e) =>
                                setNewPost((prev) => ({
                                  ...prev,
                                  content: e.target.value,
                                }))
                              }
                              rows={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowCreatePost(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleCreatePost}>
                            <Send className="h-4 w-4 mr-2" />
                            Post
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Posts */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="animate-pulse space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-full"></div>
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  : posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start gap-4">
                                <Avatar>
                                  <AvatarFallback>
                                    {post.user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">
                                      {post.user.name}
                                    </h4>
                                    {getPostTypeIcon(post.type)}
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {post.type}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(
                                        new Date(post.created_at),
                                      )}{" "}
                                      ago
                                    </span>
                                  </div>
                                  <h3 className="font-medium mb-2">
                                    {post.title}
                                  </h3>
                                  <p className="text-muted-foreground">
                                    {post.content}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLikePost(post.id)}
                                    className={`gap-1 ${post.is_liked ? "text-red-600" : ""}`}
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${post.is_liked ? "fill-current" : ""}`}
                                    />
                                    {post.likes}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    {post.comments_count}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1"
                                  >
                                    <Share2 className="h-4 w-4" />
                                    Share
                                  </Button>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Global Eco Champions</CardTitle>
                <CardDescription>
                  Top sustainability leaders in our community this month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                    ))
                  : leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-lg ${
                          entry.user_name === state.user?.name
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              entry.rank <= 3
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {entry.rank <= 3 ? (
                              <Trophy className="h-4 w-4" />
                            ) : (
                              entry.rank
                            )}
                          </div>
                          <Avatar>
                            <AvatarFallback>
                              {entry.user_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{entry.user_name}</h4>
                            {entry.user_name === state.user?.name && (
                              <Badge variant="secondary">You</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.activities_count} activities •{" "}
                            {entry.streak_days} day streak
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {entry.total_carbon_saved.toFixed(1)} kg
                          </p>
                          <div
                            className={`text-sm flex items-center gap-1 ${
                              entry.change_percentage > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {entry.change_percentage > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {entry.change_percentage > 0 ? "+" : ""}
                            {entry.change_percentage}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center p-8">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Groups Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Connect with like-minded individuals in your area and form
                eco-friendly groups. This feature is currently in development.
              </p>
              <Button
                onClick={() =>
                  toast({
                    title: "Thanks!",
                    description:
                      "You'll be notified when groups are available!",
                  })
                }
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Get Notified
              </Button>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
