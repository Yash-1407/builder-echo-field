import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useActivity } from "@/contexts/ActivityContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import {
  Leaf,
  TrendingDown,
  TrendingUp,
  Calendar,
  Target,
  Users,
  Zap,
  Award,
  Activity,
  Globe,
  Heart,
  Sparkles,
  Flame,
  CheckCircle,
  Plus,
} from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import StatsCard from "@/components/StatsCard";
import RecentActivities from "@/components/RecentActivities";
import QuickActions from "@/components/QuickActions";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { state, getTotalFootprint, getFootprintByCategory, getTrendData } = useActivity();
  const { state: realtimeState, addNotification } = useRealtime();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [showCelebration, setShowCelebration] = useState(false);

  const monthlyTarget = state.user?.monthlyTarget || 4.5;
  const currentFootprint = getTotalFootprint(timeRange);
  const percentageOfTarget = (currentFootprint / monthlyTarget) * 100;
  const categoryData = getFootprintByCategory();
  const trendData = getTrendData();

  // Realtime goal achievement check
  useEffect(() => {
    if (realtimeState.dailyGoalProgress >= 100 && !showCelebration) {
      setShowCelebration(true);
      addNotification({
        type: "achievement",
        title: "🎉 Daily Goal Achieved!",
        message: "Congratulations! You've reached your daily sustainability goal!",
        action: {
          label: "View Progress",
          href: "/analytics",
        },
      });

      toast({
        title: "🎉 Achievement Unlocked!",
        description: "Daily sustainability goal completed!",
      });

      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [realtimeState.dailyGoalProgress, showCelebration, addNotification]);

  // Calculate insights
  const insights = {
    weeklyChange: trendData.length >= 2 
      ? ((trendData[trendData.length - 1].value - trendData[trendData.length - 2].value) / trendData[trendData.length - 2].value) * 100 
      : 0,
    bestCategory: categoryData.reduce((min, cat) => cat.value < min.value ? cat : min, categoryData[0]),
    worstCategory: categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, categoryData[0]),
    totalActivities: state.activities.length,
    reductionFromTarget: Math.max(0, monthlyTarget - currentFootprint),
  };

  const quickStats = [
    {
      title: "Carbon Footprint",
      value: `${currentFootprint.toFixed(1)} kg`,
      change: insights.weeklyChange,
      icon: Leaf,
      color: "text-carbon-600",
      bgColor: "bg-carbon-50",
    },
    {
      title: "Target Progress",
      value: `${Math.min(100, percentageOfTarget).toFixed(0)}%`,
      change: percentageOfTarget <= 100 ? -10 : 15,
      icon: Target,
      color: percentageOfTarget <= 100 ? "text-green-600" : "text-orange-600",
      bgColor: percentageOfTarget <= 100 ? "bg-green-50" : "bg-orange-50",
    },
    {
      title: "Activities Logged",
      value: insights.totalActivities.toString(),
      change: 8,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Reduction Achieved",
      value: `${insights.reductionFromTarget.toFixed(1)} kg`,
      change: 12,
      icon: TrendingDown,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header with welcome message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <motion.h1 
            className="text-3xl font-bold tracking-tight flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Leaf className="h-8 w-8 text-carbon-600" />
            </motion.div>
            Welcome back, {state.user?.name || "User"}! 🌱
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Track your environmental impact and build sustainable habits
          </motion.p>
        </div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 mt-4 md:mt-0"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${realtimeState.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm text-muted-foreground">
              {realtimeState.isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <Badge variant="secondary" className="animate-pulse">
            {realtimeState.onlineUsers} online
          </Badge>
        </motion.div>
      </motion.div>

      {/* Achievement Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="bg-gradient-to-r from-green-500 to-carbon-600 text-white p-6 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Award className="h-8 w-8" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold">🎉 Daily Goal Achieved!</h3>
                <p className="opacity-90">You're making a real difference for our planet!</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="transition-transform"
          >
            <StatsCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Target Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-carbon-600" />
                Monthly Target Progress
              </CardTitle>
              <CardDescription>
                Your carbon footprint vs. monthly target of {monthlyTarget} kg CO₂
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current: {currentFootprint.toFixed(1)} kg CO₂</span>
                  <span className={percentageOfTarget <= 100 ? "text-green-600" : "text-orange-600"}>
                    {percentageOfTarget.toFixed(0)}% of target
                  </span>
                </div>
                <Progress
                  value={Math.min(100, percentageOfTarget)}
                  className="h-3"
                />
              </div>

              {percentageOfTarget <= 100 ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Great job! You're {insights.reductionFromTarget.toFixed(1)} kg below your target.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    You're {(currentFootprint - monthlyTarget).toFixed(1)} kg over your target.
                  </span>
                </div>
              )}

              {/* Daily Progress */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Daily Goal Progress</span>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">{realtimeState.achievementStreak} day streak</span>
                  </div>
                </div>
                <Progress
                  value={realtimeState.dailyGoalProgress}
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground mt-1 block">
                  {realtimeState.dailyGoalProgress.toFixed(0)}% completed today
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-carbon-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Log activities and track your impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>
        </motion.div>

        {/* Carbon Footprint Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-carbon-600" />
                Impact Breakdown
              </CardTitle>
              <CardDescription>
                Your emissions by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} kg CO₂`, "Impact"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs">{category.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-carbon-600" />
                Footprint Trend
              </CardTitle>
              <CardDescription>
                Your carbon emissions over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kg CO₂`, "Emissions"]} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingDown className="h-4 w-4" />
                  <span>
                    {insights.weeklyChange < 0 ? "↓" : "↑"} {Math.abs(insights.weeklyChange).toFixed(1)}% from last month
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-carbon-600" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Your latest environmental impact entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivities limit={5} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights and Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Heart className="h-5 w-5" />
              Eco-Friendly Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              {insights.bestCategory ? 
                `Great job! Your ${insights.bestCategory.name.toLowerCase()} activities have the lowest impact (${insights.bestCategory.value} kg CO₂).` :
                "Keep logging activities to see personalized insights!"
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Zap className="h-5 w-5" />
              Improvement Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              {insights.worstCategory ? 
                `Consider reducing ${insights.worstCategory.name.toLowerCase()} activities - they account for ${insights.worstCategory.value} kg CO₂.` :
                "Your impact data will help identify improvement areas."
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Community Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card className="bg-gradient-to-r from-carbon-600 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{realtimeState.onlineUsers + 1247}</div>
                <div className="text-sm opacity-90">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">15.2k</div>
                <div className="text-sm opacity-90">kg CO₂ Saved Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm opacity-90">Active Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.8k</div>
                <div className="text-sm opacity-90">Trees Planted</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
