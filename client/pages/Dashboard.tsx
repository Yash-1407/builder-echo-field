import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import ActivityChart from "@/components/ActivityChart";
import QuickActions from "@/components/QuickActions";
import RecentActivities from "@/components/RecentActivities";
import { useActivity } from "@/contexts/ActivityContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import {
  TrendingDown,
  Target,
  Award,
  Leaf,
  Car,
  Zap,
  Utensils,
  Calendar,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const { getTotalFootprint, getFootprintByCategory, getTrendData, state } = useActivity();

  // Get real data from context
  const totalFootprint = getTotalFootprint('month');
  const dailyAverage = totalFootprint / 30;
  const carbonFootprintData = getFootprintByCategory();
  const trendData = getTrendData();

  // Calculate goal progress
  const monthlyTarget = state.user?.monthlyTarget || 4.5;
  const goalProgress = Math.min((1 - totalFootprint / monthlyTarget) * 100, 100);

  // Calculate eco score based on activities and goals
  const ecoScore = Math.max(500 + Math.round((monthlyTarget - totalFootprint) * 100), 0);

  const monthlyData = [
    { name: "Week 1", value: 1.4 },
    { name: "Week 2", value: 1.6 },
    { name: "Week 3", value: 1.2 },
    { name: "Week 4", value: 1.8 },
  ];

  const transportEmissions = carbonFootprintData.find(item => item.name === "Transportation")?.value || 0;
  const energyEmissions = carbonFootprintData.find(item => item.name === "Energy")?.value || 0;

  const goals = [
    {
      title: "Monthly CO₂ Target",
      current: totalFootprint,
      target: monthlyTarget,
      unit: "tons",
      progress: Math.min((totalFootprint / monthlyTarget) * 100, 100),
      status: totalFootprint <= monthlyTarget ? "on-track" as const : "behind" as const
    },
    {
      title: "Transportation Reduction",
      current: Math.max(0, Math.round(((3.0 - transportEmissions) / 3.0) * 100)),
      target: 30,
      unit: "%",
      progress: Math.max(0, Math.round(((3.0 - transportEmissions) / 3.0) * 100)),
      status: transportEmissions < 2.1 ? "on-track" as const : "behind" as const
    },
    {
      title: "Renewable Energy Usage",
      current: energyEmissions < 1.5 ? 80 : 60,
      target: 80,
      unit: "%",
      progress: energyEmissions < 1.5 ? 100 : 75,
      status: energyEmissions < 1.5 ? "on-track" as const : "behind" as const
    }
  ];

  const achievements = [
    { title: "First Week Complete", icon: "🌱", date: "2 days ago" },
    { title: "Carbon Saver", icon: "🏆", date: "1 week ago" },
    { title: "Green Commuter", icon: "🚲", date: "2 weeks ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Track your carbon footprint and sustainability goals</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`${totalFootprint < monthlyTarget ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {totalFootprint < monthlyTarget ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <p className={`font-medium ${totalFootprint < monthlyTarget ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>
                    {totalFootprint < monthlyTarget
                      ? `Great progress! You're ${Math.round(((monthlyTarget - totalFootprint) / monthlyTarget) * 100)}% below your carbon target this month.`
                      : `You're ${Math.round(((totalFootprint - monthlyTarget) / monthlyTarget) * 100)}% above your target. Let's get back on track!`
                    }
                  </p>
                  <p className={`text-sm ${totalFootprint < monthlyTarget ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {totalFootprint < monthlyTarget
                      ? `Keep up the sustainable choices to reach your goal of ${monthlyTarget} tons CO₂.`
                      : `Consider logging more eco-friendly activities to meet your ${monthlyTarget} tons CO₂ goal.`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Footprint"
            value={`${totalFootprint.toFixed(1)} tons`}
            change={totalFootprint < monthlyTarget ? "-15% vs last month" : "+5% vs last month"}
            changeType={totalFootprint < monthlyTarget ? "positive" : "negative"}
            icon={Leaf}
            description="CO₂ equivalent this month"
          />
          <StatsCard
            title="Daily Average"
            value={`${dailyAverage.toFixed(2)} tons`}
            change={dailyAverage < 0.15 ? "-8% vs last week" : "+3% vs last week"}
            changeType={dailyAverage < 0.15 ? "positive" : "negative"}
            icon={TrendingDown}
            description="CO₂ per day"
          />
          <StatsCard
            title="Goal Progress"
            value={`${Math.round(goalProgress)}%`}
            change={goalProgress > 50 ? "On track" : "Needs attention"}
            changeType={goalProgress > 50 ? "positive" : "negative"}
            icon={Target}
            description="Monthly reduction target"
          />
          <StatsCard
            title="Eco Score"
            value={ecoScore.toString()}
            change={ecoScore > 600 ? "+12 points" : "-5 points"}
            changeType={ecoScore > 600 ? "positive" : "negative"}
            icon={Award}
            description="Sustainability rating"
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carbon Footprint Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ActivityChart
                title="Carbon Footprint Breakdown"
                description="Your emissions by category this month"
                data={carbonFootprintData}
                type="pie"
                height={350}
              />
            </motion.div>

            {/* Trend Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Tabs defaultValue="trend" className="w-full">
                <TabsList>
                  <TabsTrigger value="trend">6-Month Trend</TabsTrigger>
                  <TabsTrigger value="monthly">This Month</TabsTrigger>
                </TabsList>
                <TabsContent value="trend">
                  <ActivityChart
                    title="Carbon Emissions Trend"
                    description="Your carbon footprint over the last 6 months"
                    data={trendData}
                    type="line"
                    height={300}
                  />
                </TabsContent>
                <TabsContent value="monthly">
                  <ActivityChart
                    title="Weekly Breakdown"
                    description="Your weekly emissions this month"
                    data={monthlyData}
                    type="bar"
                    height={300}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Right Column - Actions & Activities */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <QuickActions />
            </motion.div>

            {/* Goals Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Sustainability Goals
                  </CardTitle>
                  <CardDescription>
                    Track your progress towards carbon reduction targets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{goal.title}</span>
                        <Badge variant={goal.status === "on-track" ? "default" : "destructive"}>
                          {goal.current}/{goal.target} {goal.unit}
                        </Badge>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            goal.status === "on-track" ? "bg-green-500" : "bg-orange-500"
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                  <CardDescription>
                    Badges and milestones you've unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-accent/50">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View All Achievements
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <RecentActivities />
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Personalized tips to reduce your carbon footprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Transportation</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Try carpooling 2 days a week to reduce your transport emissions by 40%.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-sm">Energy</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Switch to LED bulbs and save 0.2 tons CO₂ annually.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Diet</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Try "Meatless Monday" to reduce food-related emissions by 15%.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Lifestyle</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Plant a tree to offset 0.04 tons CO₂ per year and earn eco-points!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
