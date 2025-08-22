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
import { useActivity } from "@/contexts/ActivityContext";
import ActivityChart from "@/components/ActivityChart";
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
  Leaf,
  Trophy,
  Star,
  Save,
  Edit,
} from "lucide-react";
import { motion } from "framer-motion";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: "transport" | "energy" | "food" | "general";
  rarity: "common" | "rare" | "legendary";
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
}

export default function Profile() {
  const { state, getTotalFootprint, getFootprintByCategory } = useActivity();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: state.user?.name || "",
    email: state.user?.email || "",
    bio: "Passionate about sustainable living and reducing my carbon footprint. Always looking for new ways to make a positive environmental impact!",
    location: "San Francisco, CA",
    website: "https://myecojourney.com",
    monthlyTarget: state.user?.monthlyTarget || 4.5,
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    achievementAlerts: true,
    publicProfile: true,
    dataSharing: false,
    darkMode: false,
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
    },
    {
      id: "5",
      title: "Plant Power",
      description: "Log 20 plant-based meals",
      icon: "🌿",
      earned: false,
      category: "food",
      rarity: "common",
    },
    {
      id: "6",
      title: "Energy Saver",
      description: "Reduce energy consumption by 30%",
      icon: "⚡",
      earned: false,
      category: "energy",
      rarity: "rare",
    },
    {
      id: "7",
      title: "Sustainability Legend",
      description: "Maintain top 1% carbon footprint for 6 months",
      icon: "👑",
      earned: false,
      category: "general",
      rarity: "legendary",
    },
  ];

  // Sample goals data
  const goals: Goal[] = [
    {
      id: "1",
      title: "Monthly Carbon Target",
      description: "Stay under monthly CO₂ limit",
      target: profileForm.monthlyTarget,
      current: getTotalFootprint("month"),
      unit: "tons CO₂",
      deadline: "2024-12-31",
      category: "emissions",
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
    },
  ];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
      console.log("Profile saved:", profileForm);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const earnedAchievements = achievements.filter((a) => a.earned);
  const totalPoints = earnedAchievements.length * 50; // 50 points per achievement
  const userLevel =
    totalPoints >= 500
      ? "Eco Legend"
      : totalPoints >= 300
        ? "Green Guardian"
        : totalPoints >= 150
          ? "Eco Warrior"
          : "Eco Explorer";

  const categoryData = getFootprintByCategory();
  const monthlyFootprint = getTotalFootprint("month");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Profile & Goals
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, track achievements, and set sustainability
            goals
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="relative mx-auto">
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
                    className="absolute -bottom-2 right-1/2 transform translate-x-1/2"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">{state.user?.name}</h2>
                  <Badge variant="secondary" className="text-sm">
                    {userLevel}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {profileForm.bio}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {earnedAchievements.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Achievements
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalPoints}
                    </p>
                    <p className="text-xs text-muted-foreground">EcoPoints</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {state.activities.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Activities</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {monthlyFootprint.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CO₂ This Month
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Progress</span>
                    <span>
                      {Math.min(
                        100,
                        (monthlyFootprint / profileForm.monthlyTarget) * 100,
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        monthlyFootprint <= profileForm.monthlyTarget
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(100, (monthlyFootprint / profileForm.monthlyTarget) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {monthlyFootprint <= profileForm.monthlyTarget
                      ? `${(profileForm.monthlyTarget - monthlyFootprint).toFixed(1)} tons remaining`
                      : `${(monthlyFootprint - profileForm.monthlyTarget).toFixed(1)} tons over target`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="achievements">Awards</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Your Impact Overview
                      </CardTitle>
                      <CardDescription>
                        Summary of your sustainability journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {categoryData.length > 0 && (
                        <ActivityChart
                          title="This Month's Emissions"
                          description="Breakdown by category"
                          data={categoryData}
                          type="pie"
                          height={300}
                        />
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Recent Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {earnedAchievements.slice(0, 3).map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex items-center gap-3"
                          >
                            <span className="text-2xl">{achievement.icon}</span>
                            <div>
                              <p className="font-medium text-sm">
                                {achievement.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full">
                          View All Achievements
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle className="text-lg">Active Goals</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {goals.slice(0, 3).map((goal) => (
                          <div key={goal.id} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                {goal.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {goal.current}/{goal.target} {goal.unit}
                              </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1">
                              <div
                                className="h-1 rounded-full bg-blue-500 transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, (goal.current / goal.target) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full">
                          View All Goals
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Goals Tab */}
                <TabsContent value="goals" className="space-y-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Sustainability Goals
                      </CardTitle>
                      <CardDescription>
                        Track your progress towards environmental targets
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {goals.map((goal) => (
                        <div
                          key={goal.id}
                          className="space-y-3 p-4 rounded-lg border bg-card"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{goal.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {goal.description}
                              </p>
                            </div>
                            <Badge
                              variant={
                                goal.current >= goal.target
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {goal.category}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                {goal.current}/{goal.target} {goal.unit}
                              </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  goal.current >= goal.target
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, (goal.current / goal.target) * 100)}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                {Math.round((goal.current / goal.target) * 100)}
                                % complete
                              </span>
                              <span>
                                Due:{" "}
                                {new Date(goal.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="space-y-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Achievements & Badges
                      </CardTitle>
                      <CardDescription>
                        Unlock badges by completing sustainability milestones
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {achievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className={`p-4 rounded-lg border transition-all ${
                              achievement.earned
                                ? "bg-green-50 border-green-200 dark:bg-green-950/20"
                                : "bg-gray-50 border-gray-200 dark:bg-gray-950/20 opacity-60"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`text-3xl ${achievement.earned ? "" : "grayscale"}`}
                              >
                                {achievement.icon}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">
                                    {achievement.title}
                                  </h4>
                                  <Badge
                                    variant={
                                      achievement.rarity === "legendary"
                                        ? "destructive"
                                        : achievement.rarity === "rare"
                                          ? "secondary"
                                          : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {achievement.rarity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {achievement.description}
                                </p>
                                {achievement.earned &&
                                  achievement.earnedDate && (
                                    <p className="text-xs text-green-600 mt-1">
                                      Earned:{" "}
                                      {new Date(
                                        achievement.earnedDate,
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                          </CardTitle>
                          <CardDescription>
                            Update your personal information and preferences
                          </CardDescription>
                        </div>
                        <Button
                          variant={isEditing ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            isEditing ? setIsEditing(false) : setIsEditing(true)
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {isEditing ? "Cancel" : "Edit"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      {isEditing && (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                          >
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
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Account Settings
                      </CardTitle>
                      <CardDescription>
                        Manage notifications and privacy preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Notifications
                        </h4>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                Email Notifications
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Receive updates via email
                              </p>
                            </div>
                            <Switch
                              checked={settings.emailNotifications}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  emailNotifications: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                Push Notifications
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Get real-time updates
                              </p>
                            </div>
                            <Switch
                              checked={settings.pushNotifications}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  pushNotifications: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                Weekly Reports
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Summary of your progress
                              </p>
                            </div>
                            <Switch
                              checked={settings.weeklyReports}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  weeklyReports: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                Achievement Alerts
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Notifications for badges and milestones
                              </p>
                            </div>
                            <Switch
                              checked={settings.achievementAlerts}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  achievementAlerts: checked,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Privacy
                        </h4>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                Public Profile
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Allow others to see your profile
                              </p>
                            </div>
                            <Switch
                              checked={settings.publicProfile}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  publicProfile: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                Data Sharing
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Share anonymized data for research
                              </p>
                            </div>
                            <Switch
                              checked={settings.dataSharing}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  dataSharing: checked,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Data Export</h4>
                        <p className="text-sm text-muted-foreground">
                          Download your activity data and reports
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Data (CSV)
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report (PDF)
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
