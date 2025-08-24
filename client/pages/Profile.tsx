import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActivity } from "@/contexts/ActivityContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import {
  User,
  Settings,
  Award,
  Target,
  Bell,
  Shield,
  Download,
  Camera,
  Calendar,
  TrendingUp,
  TrendingDown,
  Leaf,
  Trophy,
  Star,
  Save,
  Edit,
  Upload,
  Trash2,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  X,
  Globe,
  MapPin,
  Link2,
  Mail,
  Smartphone,
  Home,
  Zap,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  BarChart3,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: "transport" | "energy" | "food" | "general";
  rarity: "common" | "rare" | "legendary";
  points: number;
  progress?: number;
  requirement?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  category: string;
  priority: "low" | "medium" | "high";
  isActive: boolean;
}

interface Streak {
  current: number;
  longest: number;
  lastActivity: string;
  type: "daily" | "weekly";
}

interface ActivitySummary {
  totalActivities: number;
  thisWeek: number;
  thisMonth: number;
  totalEmissions: number;
  emissionsSaved: number;
  averageDaily: number;
  categoryBreakdown: { [key: string]: number };
}

export default function Profile() {
  const {
    state,
    getTotalFootprint,
    getFootprintByCategory,
    updateProfile,
    logout,
  } = useActivity();
  const { state: realtimeState } = useRealtime();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: state.user?.name || "",
    email: state.user?.email || "",
    bio: "Passionate about sustainable living and reducing my carbon footprint. Always looking for new ways to make a positive environmental impact!",
    location: "San Francisco, CA",
    website: "https://myecojourney.com",
    phoneNumber: "+1 (555) 123-4567",
    monthlyTarget: state.user?.monthlyTarget || 4.5,
    goals: state.user?.goals || {
      carbonReduction: 30,
      transportReduction: 25,
      renewableEnergy: 80,
    },
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    achievementAlerts: true,
    communityUpdates: true,
    marketingEmails: false,
    publicProfile: true,
    dataSharing: false,
    analyticsSharing: true,
    darkMode: false,
    language: "en",
    timezone: "America/Los_Angeles",
    units: "metric",
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Calculate user statistics
  const [activitySummary, setActivitySummary] = useState<ActivitySummary>({
    totalActivities: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalEmissions: 0,
    emissionsSaved: 0,
    averageDaily: 0,
    categoryBreakdown: {},
  });

  // Streaks
  const [streaks] = useState<Streak>({
    current: realtimeState.achievementStreak,
    longest: 23,
    lastActivity: new Date().toISOString(),
    type: "daily",
  });

  // Sample achievements data
  const achievements: Achievement[] = [
    {
      id: "1",
      title: "First Steps",
      description: "Log your first activity",
      icon: "🌱",
      earned: true,
      earnedDate: "2024-01-15",
      category: "general",
      rarity: "common",
      points: 50,
      progress: 100,
    },
    {
      id: "2",
      title: "Eco Warrior",
      description: "Complete 30 days of logging",
      icon: "⚔️",
      earned: true,
      earnedDate: "2024-02-14",
      category: "general",
      rarity: "rare",
      points: 200,
      progress: 100,
    },
    {
      id: "3",
      title: "Carbon Crusher",
      description: "Reduce emissions by 25% in a month",
      icon: "💪",
      earned: true,
      earnedDate: "2024-03-10",
      category: "general",
      rarity: "rare",
      points: 300,
      progress: 100,
    },
    {
      id: "4",
      title: "Green Commuter",
      description: "Use sustainable transport for 2 weeks",
      icon: "🚲",
      earned: true,
      earnedDate: "2024-02-28",
      category: "transport",
      rarity: "common",
      points: 150,
      progress: 100,
    },
    {
      id: "5",
      title: "Plant Power",
      description: "Log 20 plant-based meals",
      icon: "🌿",
      earned: false,
      category: "food",
      rarity: "common",
      points: 100,
      progress: 65,
      requirement: "13/20 meals logged",
    },
    {
      id: "6",
      title: "Energy Saver",
      description: "Reduce energy consumption by 30%",
      icon: "⚡",
      earned: false,
      category: "energy",
      rarity: "rare",
      points: 250,
      progress: 45,
      requirement: "Currently 15% reduction",
    },
    {
      id: "7",
      title: "Sustainability Legend",
      description: "Maintain top 1% carbon footprint for 6 months",
      icon: "👑",
      earned: false,
      category: "general",
      rarity: "legendary",
      points: 1000,
      progress: 20,
      requirement: "2/6 months completed",
    },
  ];

  // Goals data
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Monthly Carbon Target",
      description: "Stay under monthly CO₂ limit",
      target: profileForm.monthlyTarget,
      current: getTotalFootprint("month"),
      unit: "tons CO₂",
      deadline: "2024-12-31",
      category: "emissions",
      priority: "high",
      isActive: true,
    },
    {
      id: "2",
      title: "Sustainable Commute",
      description: "Use eco-friendly transport 80% of time",
      target: 80,
      current: 65,
      unit: "%",
      deadline: "2024-12-31",
      category: "transport",
      priority: "medium",
      isActive: true,
    },
    {
      id: "3",
      title: "Plant-Based Meals",
      description: "Eat 50 plant-based meals this quarter",
      target: 50,
      current: 32,
      unit: "meals",
      deadline: "2024-12-31",
      category: "food",
      priority: "medium",
      isActive: true,
    },
    {
      id: "4",
      title: "Weekly Activity Logging",
      description: "Log activities 7 days per week",
      target: 7,
      current: state.activities.filter((a) => {
        const activityDate = new Date(a.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return activityDate >= weekAgo;
      }).length,
      unit: "days",
      deadline: "2024-12-31",
      category: "tracking",
      priority: "low",
      isActive: true,
    },
  ]);

  useEffect(() => {
    calculateActivitySummary();
  }, [state.activities]);

  const calculateActivitySummary = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekActivities = state.activities.filter(
      (a) => new Date(a.date) >= weekAgo,
    );
    const thisMonthActivities = state.activities.filter(
      (a) => new Date(a.date) >= monthAgo,
    );

    const totalEmissions = state.activities.reduce(
      (sum, a) => sum + a.impact,
      0,
    );
    const categoryBreakdown = getFootprintByCategory().reduce(
      (acc, cat) => {
        acc[cat.name] = cat.value;
        return acc;
      },
      {} as { [key: string]: number },
    );

    setActivitySummary({
      totalActivities: state.activities.length,
      thisWeek: thisWeekActivities.length,
      thisMonth: thisMonthActivities.length,
      totalEmissions,
      emissionsSaved: Math.max(
        0,
        profileForm.monthlyTarget * 12 - totalEmissions,
      ),
      averageDaily:
        thisMonthActivities.length > 0
          ? totalEmissions / thisMonthActivities.length
          : 0,
      categoryBreakdown,
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profileForm);
      setIsEditing(false);

      toast({
        title: "Profile Updated! ✅",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);

      toast({
        title: "Password Changed! 🔒",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      logout();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addNewGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: "New Goal",
      description: "Set your custom sustainability target",
      target: 100,
      current: 0,
      unit: "units",
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      category: "custom",
      priority: "medium",
      isActive: true,
    };
    setGoals([...goals, newGoal]);
  };

  const toggleGoal = (goalId: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === goalId ? { ...goal, isActive: !goal.isActive } : goal,
      ),
    );
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter((goal) => goal.id !== goalId));
  };

  const exportData = (format: "json" | "csv") => {
    const data = {
      profile: profileForm,
      activities: state.activities,
      achievements: achievements.filter((a) => a.earned),
      goals: goals,
      stats: activitySummary,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob(
      [format === "json" ? JSON.stringify(data, null, 2) : convertToCSV(data)],
      { type: format === "json" ? "application/json" : "text/csv" },
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carbonmeter-profile-${format(new Date(), "yyyy-MM-dd")}.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: `Data Exported! 📊`,
      description: `Your profile data has been exported as ${format.toUpperCase()}.`,
    });
  };

  const convertToCSV = (data: any) => {
    // Simple CSV conversion for activities
    const headers = [
      "Date",
      "Type",
      "Description",
      "Impact",
      "Unit",
      "Category",
    ];
    const rows = state.activities.map((activity) => [
      activity.date,
      activity.type,
      activity.description,
      activity.impact,
      activity.unit,
      activity.category,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const earnedAchievements = achievements.filter((a) => a.earned);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);
  const userLevel =
    totalPoints >= 1000
      ? "Eco Legend"
      : totalPoints >= 500
        ? "Green Guardian"
        : totalPoints >= 200
          ? "Eco Warrior"
          : "Eco Explorer";

  const monthlyFootprint = getTotalFootprint("month");
  const yearlyFootprint = getTotalFootprint("year");

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
              <User className="h-8 w-8 text-carbon-600" />
            </motion.div>
            Profile & Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, track achievements, and customize your
            experience
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            {userLevel}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {totalPoints} EcoPoints
          </Badge>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-2xl">
                      {(state.user?.name || "U")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>

                <div>
                  <h2 className="text-xl font-bold">{state.user?.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {profileForm.location}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {userLevel}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      {streaks.current}
                    </p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">
                      {earnedAchievements.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Achievements
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">
                      {activitySummary.totalActivities}
                    </p>
                    <p className="text-xs text-muted-foreground">Activities</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">
                      {monthlyFootprint.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">CO₂ (Month)</p>
                  </div>
                </div>

                {/* Monthly Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Goal</span>
                    <span>
                      {Math.min(
                        100,
                        (monthlyFootprint / profileForm.monthlyTarget) * 100,
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      (monthlyFootprint / profileForm.monthlyTarget) * 100,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {monthlyFootprint <= profileForm.monthlyTarget
                      ? `${(profileForm.monthlyTarget - monthlyFootprint).toFixed(1)} tons remaining`
                      : `${(monthlyFootprint - profileForm.monthlyTarget).toFixed(1)} tons over target`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goals
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  Awards
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            This Week
                          </p>
                          <p className="text-2xl font-bold">
                            {activitySummary.thisWeek}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            activities
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            This Month
                          </p>
                          <p className="text-2xl font-bold">
                            {monthlyFootprint.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            kg CO₂
                          </p>
                        </div>
                        <Leaf className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            CO₂ Saved
                          </p>
                          <p className="text-2xl font-bold">
                            {activitySummary.emissionsSaved.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            kg CO₂
                          </p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-eco-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Current Streak
                          </p>
                          <p className="text-2xl font-bold">
                            {streaks.current}
                          </p>
                          <p className="text-xs text-muted-foreground">days</p>
                        </div>
                        <Trophy className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Impact by Category</CardTitle>
                    <CardDescription>
                      Your carbon footprint breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {Object.entries(activitySummary.categoryBreakdown).map(
                          ([category, value]) => {
                            const percentage =
                              (value / monthlyFootprint) * 100 || 0;
                            const icon =
                              category === "Transportation"
                                ? Car
                                : category === "Energy"
                                  ? Zap
                                  : category === "Food"
                                    ? UtensilsCrossed
                                    : ShoppingBag;
                            const IconComponent = icon;

                            return (
                              <div key={category} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                      {category}
                                    </span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {value.toFixed(1)} kg
                                  </span>
                                </div>
                                <Progress value={percentage} className="h-2" />
                                <span className="text-xs text-muted-foreground">
                                  {percentage.toFixed(0)}% of total emissions
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Quick Insights</h4>
                        <div className="space-y-3">
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              You're{" "}
                              {monthlyFootprint <= profileForm.monthlyTarget
                                ? "on track"
                                : "over"}{" "}
                              your monthly target by{" "}
                              {Math.abs(
                                monthlyFootprint - profileForm.monthlyTarget,
                              ).toFixed(1)}{" "}
                              kg CO₂.
                            </AlertDescription>
                          </Alert>

                          <Alert>
                            <TrendingUp className="h-4 w-4" />
                            <AlertDescription>
                              Your{" "}
                              {Object.entries(activitySummary.categoryBreakdown)
                                .reduce((a, b) => (a[1] > b[1] ? a : b))[0]
                                .toLowerCase()}{" "}
                              activities have the highest impact this month.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest sustainability actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {state.activities.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded-full">
                              {activity.type === "transport" && (
                                <Car className="h-4 w-4" />
                              )}
                              {activity.type === "energy" && (
                                <Zap className="h-4 w-4" />
                              )}
                              {activity.type === "food" && (
                                <UtensilsCrossed className="h-4 w-4" />
                              )}
                              {activity.type === "shopping" && (
                                <ShoppingBag className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {activity.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(activity.date),
                                  "MMM dd, yyyy",
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {activity.impact} {activity.unit}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Sustainability Goals
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Track your progress towards environmental targets
                    </p>
                  </div>
                  <Button onClick={addNewGoal} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </div>

                <div className="grid gap-4">
                  <AnimatePresence>
                    {goals.map((goal) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Card
                          className={`${!goal.isActive ? "opacity-60" : ""}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{goal.title}</h4>
                                  <Badge
                                    variant={
                                      goal.priority === "high"
                                        ? "destructive"
                                        : goal.priority === "medium"
                                          ? "default"
                                          : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {goal.priority}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {goal.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {goal.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={goal.isActive}
                                  onCheckedChange={() => toggleGoal(goal.id)}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteGoal(goal.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>
                                  {goal.current}/{goal.target} {goal.unit}
                                </span>
                              </div>
                              <Progress
                                value={Math.min(
                                  100,
                                  (goal.current / goal.target) * 100,
                                )}
                                className="h-2"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  {Math.round(
                                    (goal.current / goal.target) * 100,
                                  )}
                                  % complete
                                </span>
                                <span>
                                  Due:{" "}
                                  {format(
                                    new Date(goal.deadline),
                                    "MMM dd, yyyy",
                                  )}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          className={`relative overflow-hidden ${
                            achievement.earned
                              ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                              : "bg-gray-50 border-gray-200 opacity-75"
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <span
                                className={`text-3xl ${achievement.earned ? "" : "grayscale"}`}
                              >
                                {achievement.icon}
                              </span>
                              <div className="text-right">
                                <Badge
                                  variant={
                                    achievement.rarity === "legendary"
                                      ? "destructive"
                                      : achievement.rarity === "rare"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {achievement.rarity}
                                </Badge>
                                <p className="text-sm font-semibold text-muted-foreground mt-1">
                                  {achievement.points} pts
                                </p>
                              </div>
                            </div>

                            <h4 className="font-semibold mb-1">
                              {achievement.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {achievement.description}
                            </p>

                            {achievement.earned ? (
                              achievement.earnedDate && (
                                <p className="text-xs text-green-600">
                                  Earned:{" "}
                                  {format(
                                    new Date(achievement.earnedDate),
                                    "MMM dd, yyyy",
                                  )}
                                </p>
                              )
                            ) : (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>{achievement.progress}%</span>
                                </div>
                                <Progress
                                  value={achievement.progress}
                                  className="h-1"
                                />
                                {achievement.requirement && (
                                  <p className="text-xs text-muted-foreground">
                                    {achievement.requirement}
                                  </p>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Update your personal information and preferences
                        </CardDescription>
                      </div>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditing ? "Cancel" : "Edit"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileForm.location}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profileForm.website}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              website: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileForm.phoneNumber}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              phoneNumber: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthlyTarget">
                          Monthly CO₂ Target (tons)
                        </Label>
                        <Input
                          id="monthlyTarget"
                          type="number"
                          step="0.1"
                          value={profileForm.monthlyTarget}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              monthlyTarget: parseFloat(e.target.value),
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {/* Goals Section */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Personal Goals (%)</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="carbonReduction">
                            Carbon Reduction
                          </Label>
                          <Input
                            id="carbonReduction"
                            type="number"
                            value={profileForm.goals.carbonReduction}
                            onChange={(e) =>
                              setProfileForm((prev) => ({
                                ...prev,
                                goals: {
                                  ...prev.goals,
                                  carbonReduction: parseInt(e.target.value),
                                },
                              }))
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transportReduction">
                            Transport Reduction
                          </Label>
                          <Input
                            id="transportReduction"
                            type="number"
                            value={profileForm.goals.transportReduction}
                            onChange={(e) =>
                              setProfileForm((prev) => ({
                                ...prev,
                                goals: {
                                  ...prev.goals,
                                  transportReduction: parseInt(e.target.value),
                                },
                              }))
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="renewableEnergy">
                            Renewable Energy
                          </Label>
                          <Input
                            id="renewableEnergy"
                            type="number"
                            value={profileForm.goals.renewableEnergy}
                            onChange={(e) =>
                              setProfileForm((prev) => ({
                                ...prev,
                                goals: {
                                  ...prev.goals,
                                  renewableEnergy: parseInt(e.target.value),
                                },
                              }))
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Security Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security
                    </CardTitle>
                    <CardDescription>
                      Manage your account security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-muted-foreground">
                          Last changed 2 months ago
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordChange(true)}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security
                        </p>
                      </div>
                      <Button variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="font-medium text-destructive">
                          Delete Account
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </CardTitle>
                    <CardDescription>
                      Choose what notifications you'd like to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {[
                        {
                          key: "emailNotifications",
                          label: "Email Notifications",
                          description: "Receive updates via email",
                        },
                        {
                          key: "pushNotifications",
                          label: "Push Notifications",
                          description: "Get real-time browser notifications",
                        },
                        {
                          key: "weeklyReports",
                          label: "Weekly Reports",
                          description: "Summary of your progress each week",
                        },
                        {
                          key: "achievementAlerts",
                          label: "Achievement Alerts",
                          description:
                            "Notifications for badges and milestones",
                        },
                        {
                          key: "communityUpdates",
                          label: "Community Updates",
                          description: "Updates from community activities",
                        },
                        {
                          key: "marketingEmails",
                          label: "Marketing Emails",
                          description:
                            "Product updates and sustainability tips",
                        },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {setting.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {setting.description}
                            </p>
                          </div>
                          <Switch
                            checked={
                              settings[
                                setting.key as keyof typeof settings
                              ] as boolean
                            }
                            onCheckedChange={(checked) =>
                              setSettings((prev) => ({
                                ...prev,
                                [setting.key]: checked,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Privacy
                    </CardTitle>
                    <CardDescription>
                      Control your privacy and data sharing preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {[
                        {
                          key: "publicProfile",
                          label: "Public Profile",
                          description:
                            "Allow others to see your profile and achievements",
                        },
                        {
                          key: "dataSharing",
                          label: "Data Sharing",
                          description:
                            "Share anonymized data for sustainability research",
                        },
                        {
                          key: "analyticsSharing",
                          label: "Analytics Sharing",
                          description:
                            "Help improve the app with usage analytics",
                        },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {setting.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {setting.description}
                            </p>
                          </div>
                          <Switch
                            checked={
                              settings[
                                setting.key as keyof typeof settings
                              ] as boolean
                            }
                            onCheckedChange={(checked) =>
                              setSettings((prev) => ({
                                ...prev,
                                [setting.key]: checked,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize your app experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={settings.language}
                          onValueChange={(value) =>
                            setSettings((prev) => ({
                              ...prev,
                              language: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={settings.timezone}
                          onValueChange={(value) =>
                            setSettings((prev) => ({
                              ...prev,
                              timezone: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Los_Angeles">
                              Pacific Time
                            </SelectItem>
                            <SelectItem value="America/New_York">
                              Eastern Time
                            </SelectItem>
                            <SelectItem value="Europe/London">GMT</SelectItem>
                            <SelectItem value="Europe/Paris">
                              Central European Time
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="units">Units</Label>
                        <Select
                          value={settings.units}
                          onValueChange={(value) =>
                            setSettings((prev) => ({ ...prev, units: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="metric">
                              Metric (kg, km)
                            </SelectItem>
                            <SelectItem value="imperial">
                              Imperial (lbs, miles)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Data Export
                    </CardTitle>
                    <CardDescription>
                      Download your activity data and reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => exportData("json")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => exportData("csv")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              All your activities, achievements, and profile data will be
              permanently lost.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
