import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActivity } from "@/contexts/ActivityContext";
import {
  Users,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Clock,
  Leaf,
} from "lucide-react";
import { motion } from "framer-motion";

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    ecoScore: number;
    level: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  tags: string[];
  isLiked: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  participants: number;
  duration: string;
  reward: string;
  icon: string;
  progress?: number;
  isJoined: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  change: number;
  badge: string;
}

export default function CommunityHub() {
  const { state } = useActivity();
  const [newPostContent, setNewPostContent] = useState("");
  const [isPostingLoading, setIsPostingLoading] = useState(false);

  // Sample posts data
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: {
        name: "Sarah Green",
        avatar: "/placeholder.svg",
        ecoScore: 892,
        level: "Eco Champion",
      },
      content:
        "Just completed my first week of cycling to work instead of driving! 🚲 Saved 12.5 kg of CO₂ and feeling amazing. The morning ride through the park is actually therapeutic. Who else is making the switch to sustainable commuting?",
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: "2 hours ago",
      tags: ["cycling", "commute", "transport"],
      isLiked: false,
    },
    {
      id: "2",
      author: {
        name: "Marcus Johnson",
        avatar: "/placeholder.svg",
        ecoScore: 756,
        level: "Green Guardian",
      },
      content:
        "Meal prep Sunday with a twist! 🌱 Made 5 plant-based meals for the week. The lentil curry and quinoa salad are my new favorites. Small changes, big impact - cutting my food emissions by 40% this month!",
      likes: 31,
      comments: 12,
      shares: 7,
      timestamp: "5 hours ago",
      tags: ["food", "plant-based", "meal-prep"],
      isLiked: true,
    },
    {
      id: "3",
      author: {
        name: "Elena Rodriguez",
        avatar: "/placeholder.svg",
        ecoScore: 634,
        level: "Eco Explorer",
      },
      content:
        "Our family just hit 3 months of zero food waste! 🎉 Composting, meal planning, and using every ingredient creatively. The kids are now sustainability superheroes at school. Teaching the next generation starts at home! 💚",
      likes: 45,
      comments: 15,
      shares: 12,
      timestamp: "1 day ago",
      tags: ["zero-waste", "family", "food"],
      isLiked: false,
    },
  ]);

  // Sample challenges data
  const challenges: Challenge[] = [
    {
      id: "1",
      title: "Meatless Monday",
      description: "Go plant-based every Monday for a month",
      difficulty: "Easy",
      participants: 1247,
      duration: "4 weeks",
      reward: "50 EcoPoints + Plant Badge",
      icon: "🌱",
      progress: 75,
      isJoined: true,
    },
    {
      id: "2",
      title: "Car-Free Week",
      description: "Use only public transport, cycling, or walking",
      difficulty: "Medium",
      participants: 892,
      duration: "1 week",
      reward: "100 EcoPoints + Transport Hero Badge",
      icon: "🚲",
      isJoined: false,
    },
    {
      id: "3",
      title: "Zero Waste Challenge",
      description: "Produce zero waste for 30 days",
      difficulty: "Hard",
      participants: 456,
      duration: "30 days",
      reward: "200 EcoPoints + Zero Waste Master Badge",
      icon: "♻️",
      isJoined: false,
    },
    {
      id: "4",
      title: "Energy Saver",
      description: "Reduce home energy consumption by 25%",
      difficulty: "Medium",
      participants: 723,
      duration: "1 month",
      reward: "75 EcoPoints + Energy Efficiency Badge",
      icon: "⚡",
      isJoined: true,
    },
  ];

  // Sample leaderboard data
  const leaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      name: "Alex Thompson",
      avatar: "/placeholder.svg",
      score: 1245,
      change: 12,
      badge: "🏆",
    },
    {
      rank: 2,
      name: "Maria Santos",
      avatar: "/placeholder.svg",
      score: 1198,
      change: 8,
      badge: "🥈",
    },
    {
      rank: 3,
      name: "David Kim",
      avatar: "/placeholder.svg",
      score: 1156,
      change: -3,
      badge: "🥉",
    },
    {
      rank: 4,
      name: "Sophie Chen",
      avatar: "/placeholder.svg",
      score: 1089,
      change: 15,
      badge: "🌟",
    },
    {
      rank: 5,
      name: state.user?.name || "You",
      avatar: "/placeholder.svg",
      score: 842,
      change: 5,
      badge: "🌱",
    },
  ];

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post,
      ),
    );
  };

  const handleNewPost = async () => {
    if (!newPostContent.trim()) return;

    setIsPostingLoading(true);
    try {
      const newPost: Post = {
        id: Date.now().toString(),
        author: {
          name: state.user?.name || "You",
          avatar: "/placeholder.svg",
          ecoScore: 842,
          level: "Eco Explorer",
        },
        content: newPostContent,
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: "Just now",
        tags: [],
        isLiked: false,
      };

      setPosts([newPost, ...posts]);
      setNewPostContent("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPostingLoading(false);
    }
  };

  const joinChallenge = (challengeId: string) => {
    // In a real app, this would make an API call
    console.log(`Joined challenge: ${challengeId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Community Hub</h1>
          <p className="text-muted-foreground mt-2">
            Connect with eco-warriors and share your sustainability journey
          </p>
        </div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold">12.5K</p>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold">45</p>
              <p className="text-sm text-muted-foreground">Active Challenges</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Leaf className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">2.3M</p>
              <p className="text-sm text-muted-foreground">Tons CO₂ Saved</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Flame className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold">
                {
                  state.activities.filter((a) => {
                    const activityDate = new Date(a.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return activityDate >= weekAgo;
                  }).length
                }
              </p>
              <p className="text-sm text-muted-foreground">Your Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Share Your Eco Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What sustainable action did you take today? Share your wins, tips, or ask for advice..."
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge variant="outline">#sustainability</Badge>
                      <Badge variant="outline">#eco-tips</Badge>
                    </div>
                    <Button
                      onClick={handleNewPost}
                      disabled={isPostingLoading || !newPostContent.trim()}
                    >
                      {isPostingLoading ? "Posting..." : "Share"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Posts Feed */}
            <Tabs defaultValue="feed" className="w-full">
              <TabsList>
                <TabsTrigger value="feed">Community Feed</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>
                              {post.author.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {post.author.name}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {post.author.level}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>EcoScore: {post.author.ecoScore}</span>
                              <span>•</span>
                              <span>{post.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-foreground leading-relaxed">
                          {post.content}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(post.id)}
                              className={`gap-2 ${post.isLiked ? "text-red-500" : ""}`}
                            >
                              <Heart
                                className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`}
                              />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <MessageCircle className="h-4 w-4" />
                              {post.comments}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Share2 className="h-4 w-4" />
                              {post.shares}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="trending">
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Trending posts coming soon!
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="following">
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Follow other eco-warriors to see their posts here!
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Active Challenges
                  </CardTitle>
                  <CardDescription>
                    Join challenges to earn points and badges
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {challenges.slice(0, 3).map((challenge, index) => (
                    <div key={challenge.id} className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{challenge.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">
                              {challenge.title}
                            </h4>
                            <Badge
                              variant={
                                challenge.difficulty === "Easy"
                                  ? "default"
                                  : challenge.difficulty === "Medium"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {challenge.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {challenge.participants} joined
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {challenge.duration}
                            </span>
                          </div>
                          {challenge.isJoined && challenge.progress && (
                            <div className="mt-2">
                              <div className="w-full bg-secondary rounded-full h-1">
                                <div
                                  className="h-1 rounded-full bg-green-500 transition-all duration-500"
                                  style={{ width: `${challenge.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {challenge.progress}% complete
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {!challenge.isJoined && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => joinChallenge(challenge.id)}
                        >
                          Join Challenge
                        </Button>
                      )}
                      {index < 2 && <div className="border-t" />}
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full" size="sm">
                    View All Challenges
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Weekly Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Top sustainability champions this week
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        entry.name === (state.user?.name || "You")
                          ? "bg-accent"
                          : ""
                      }`}
                    >
                      <span className="text-lg">{entry.badge}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>
                          {entry.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.score} points
                        </p>
                      </div>
                      <div
                        className={`text-xs ${entry.change > 0 ? "text-green-600" : entry.change < 0 ? "text-red-600" : "text-gray-600"}`}
                      >
                        {entry.change > 0 ? "+" : ""}
                        {entry.change}
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full" size="sm">
                    View Full Leaderboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-center">
                      <div className="text-sm font-bold text-primary">DEC</div>
                      <div className="text-lg font-bold">15</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Earth Day Cleanup</h4>
                      <p className="text-xs text-muted-foreground">
                        Join local cleanup event
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        Online Event
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-center">
                      <div className="text-sm font-bold text-primary">DEC</div>
                      <div className="text-lg font-bold">22</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">
                        Sustainable Living Workshop
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Learn zero-waste tips
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        Webinar
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
