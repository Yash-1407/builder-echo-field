import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay, EmptyState } from "@/components/ui/error-display";
import { useActivity } from "@/contexts/ActivityContext";
import {
  Users,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Leaf,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  Share2,
  Heart,
  MessageCircle,
  UserPlus,
  Star,
  MapPin,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'global';
  category: 'transport' | 'energy' | 'food' | 'waste' | 'lifestyle';
  target: number;
  unit: string;
  duration: number; // days
  participants: number;
  startDate: string;
  endDate: string;
  progress: number;
  reward: {
    points: number;
    badge?: string;
    title?: string;
  };
  isJoined: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    ecoScore: number;
    location?: string;
  };
  content: string;
  achievement?: {
    type: string;
    description: string;
    impact: number;
  };
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
  tags: string[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  change: number;
  location?: string;
  achievements: string[];
}

export default function CommunityHub() {
  const { state } = useActivity();
  const [activeTab, setActiveTab] = useState("challenges");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from API
  const challenges: Challenge[] = [
    {
      id: "1",
      title: "Zero Car Week",
      description: "Go a full week without using a car. Use walking, cycling, or public transport instead.",
      type: "individual",
      category: "transport",
      target: 7,
      unit: "days",
      duration: 7,
      participants: 1247,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 42,
      reward: {
        points: 500,
        badge: "🚲",
        title: "Green Commuter"
      },
      isJoined: false,
      difficulty: "medium"
    },
    {
      id: "2",
      title: "Plant-Based Month",
      description: "Commit to a plant-based diet for 30 days and track your carbon footprint reduction.",
      type: "global",
      category: "food",
      target: 30,
      unit: "days",
      duration: 30,
      participants: 3421,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 67,
      reward: {
        points: 1000,
        badge: "🌱",
        title: "Plant Pioneer"
      },
      isJoined: true,
      difficulty: "hard"
    },
    {
      id: "3",
      title: "Energy Saver Challenge",
      description: "Reduce your home energy consumption by 20% this month.",
      type: "team",
      category: "energy",
      target: 20,
      unit: "% reduction",
      duration: 30,
      participants: 856,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 15,
      reward: {
        points: 750,
        badge: "⚡",
        title: "Energy Efficient"
      },
      isJoined: false,
      difficulty: "easy"
    }
  ];

  const communityPosts: CommunityPost[] = [
    {
      id: "1",
      author: {
        name: "Sarah Chen",
        avatar: "/placeholder.svg",
        ecoScore: 892,
        location: "San Francisco, CA"
      },
      content: "Just completed my first zero-waste week! Amazing how much plastic we use without thinking about it. Small changes, big impact! 🌍",
      achievement: {
        type: "Zero Waste Week",
        description: "Completed 7 days without generating waste",
        impact: 2.5
      },
      likes: 34,
      comments: 12,
      timestamp: "2 hours ago",
      isLiked: false,
      tags: ["zero-waste", "plastic-free", "lifestyle"]
    },
    {
      id: "2",
      author: {
        name: "Marcus Johnson",
        avatar: "/placeholder.svg",
        ecoScore: 756,
        location: "Portland, OR"
      },
      content: "Switched to cycling for my daily commute. Not only am I reducing my carbon footprint by 3.2 kg CO₂ per day, but I feel so much healthier! Who else is part of the bike-to-work movement?",
      likes: 67,
      comments: 23,
      timestamp: "5 hours ago",
      isLiked: true,
      tags: ["cycling", "commute", "health"]
    },
    {
      id: "3",
      author: {
        name: "Elena Rodriguez",
        avatar: "/placeholder.svg",
        ecoScore: 923,
        location: "Austin, TX"
      },
      content: "My vegetable garden is thriving! Growing your own food is incredibly rewarding and sustainable. Here's what I harvested this week 🥬🍅",
      likes: 45,
      comments: 18,
      timestamp: "1 day ago",
      isLiked: false,
      tags: ["gardening", "food", "sustainable"]
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      name: "Alex Thompson",
      avatar: "/placeholder.svg",
      score: 2547,
      change: 12,
      location: "Seattle, WA",
      achievements: ["🌱", "🚲", "⚡", "♻️"]
    },
    {
      rank: 2,
      name: "Maya Patel",
      avatar: "/placeholder.svg",
      score: 2398,
      change: -3,
      location: "Boulder, CO",
      achievements: ["🌱", "⚡", "♻️"]
    },
    {
      rank: 3,
      name: "Carlos Rivera",
      avatar: "/placeholder.svg",
      score: 2156,
      change: 8,
      location: "Portland, OR",
      achievements: ["🚲", "⚡", "♻️"]
    },
    {
      rank: 4,
      name: state.user?.name || "You",
      avatar: "/placeholder.svg",
      score: 1834,
      change: 15,
      location: "Your City",
      achievements: ["🌱", "🚲"]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return '🚲';
      case 'energy': return '⚡';
      case 'food': return '🥬';
      case 'waste': return '♻️';
      case 'lifestyle': return '🌱';
      default: return '🌍';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Loading variant="carbon" size="lg" text="Loading community..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">Community Hub</h1>
            <p className="text-muted-foreground">
              Connect with eco-warriors worldwide and join sustainability challenges
            </p>
          </motion.div>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold">50,247</p>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-sm text-muted-foreground">Active Challenges</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Leaf className="h-8 w-8 mx-auto text-eco-600 mb-2" />
              <p className="text-2xl font-bold">2.5M</p>
              <p className="text-sm text-muted-foreground">CO₂ Tons Saved</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold">847</p>
              <p className="text-sm text-muted-foreground">Your Eco Score</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
              transition={{ duration: 0.5 }}
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
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="all">All Categories</option>
                        <option value="transport">Transport</option>
                        <option value="energy">Energy</option>
                        <option value="food">Food</option>
                        <option value="waste">Waste</option>
                        <option value="lifestyle">Lifestyle</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Challenges Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="wait">
                  {filteredChallenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className={`h-full ${challenge.isJoined ? 'ring-2 ring-primary' : ''}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Badge className={getDifficultyColor(challenge.difficulty)}>
                              {challenge.difficulty}
                            </Badge>
                            <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                          </div>
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {challenge.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{challenge.progress}%</span>
                          </div>
                          <Progress value={challenge.progress} className="h-2" />
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{challenge.participants.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{challenge.duration} days</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Reward</p>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4 text-yellow-600" />
                                <span className="font-medium">{challenge.reward.points} pts</span>
                                {challenge.reward.badge && (
                                  <span className="text-lg">{challenge.reward.badge}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant={challenge.isJoined ? "outline" : "default"}
                              size="sm"
                            >
                              {challenge.isJoined ? "Joined" : "Join Challenge"}
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
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {communityPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>
                            {post.author.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{post.author.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {post.author.ecoScore} eco score
                            </Badge>
                            {post.author.location && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {post.author.location}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-foreground">{post.content}</p>
                          
                          {post.achievement && (
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-800 dark:text-green-200">
                                  Achievement Unlocked: {post.achievement.type}
                                </span>
                              </div>
                              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                {post.achievement.description} • Saved {post.achievement.impact} kg CO₂
                              </p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`gap-1 ${post.isLiked ? 'text-red-600' : ''}`}
                              >
                                <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {post.comments}
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Share2 className="h-4 w-4" />
                                Share
                              </Button>
                            </div>
                            <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Global Eco Champions</CardTitle>
                  <CardDescription>
                    Top sustainability leaders in our community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        entry.name === state.user?.name ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          entry.rank <= 3 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {entry.rank <= 3 ? (
                            <Trophy className="h-4 w-4" />
                          ) : (
                            entry.rank
                          )}
                        </div>
                        <Avatar>
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>
                            {entry.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{entry.name}</h4>
                          {entry.name === state.user?.name && (
                            <Badge variant="secondary">You</Badge>
                          )}
                        </div>
                        {entry.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {entry.location}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.score.toLocaleString()}</p>
                        <div className={`text-sm flex items-center gap-1 ${
                          entry.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className="h-3 w-3" />
                          {entry.change > 0 ? '+' : ''}{entry.change}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {entry.achievements.map((achievement, i) => (
                          <span key={i} className="text-lg" title="Achievement">
                            {achievement}
                          </span>
                        ))}
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
              transition={{ duration: 0.5 }}
            >
              <EmptyState
                title="Groups Coming Soon"
                description="Connect with like-minded individuals in your area and form eco-friendly groups. This feature is currently in development."
                action={{
                  label: "Get Notified",
                  onClick: () => alert("You'll be notified when groups are available!")
                }}
                icon={Users}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
