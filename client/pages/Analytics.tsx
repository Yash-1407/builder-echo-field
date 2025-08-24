import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useActivity } from "@/contexts/ActivityContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Target,
  Award,
  Zap,
  Leaf,
  Globe,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Share,
  Filter,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  format,
  subDays,
  subMonths,
  subWeeks,
  startOfDay,
  endOfDay,
} from "date-fns";

const Analytics = () => {
  const { state, getTotalFootprint, getFootprintByCategory, getTrendData } =
    useActivity();
  const { state: realtimeState } = useRealtime();
  const [timeRange, setTimeRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [selectedMetric, setSelectedMetric] = useState<
    "emissions" | "activities" | "categories"
  >("emissions");
  const [comparisonMode, setComparisonMode] = useState<
    "target" | "previous" | "average"
  >("target");

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const currentPeriodFootprint = getTotalFootprint(timeRange);
    const monthlyTarget = state.user?.monthlyTarget || 4.5;

    // Previous period comparison
    const previousPeriodFootprint =
      timeRange === "month"
        ? getTotalFootprint("month") * 0.9 // Simulated previous period (10% less)
        : getTotalFootprint("month") * 0.8;

    // Category breakdown
    const categoryData = getFootprintByCategory();

    // Trend data with more granular periods
    const trendData = getTrendData();

    // Weekly breakdown for current month
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = subWeeks(new Date(), i);
      const weekActivities = state.activities.filter((activity) => {
        const activityDate = new Date(activity.date);
        const weekEnd = endOfDay(subDays(weekStart, -6));
        return activityDate >= startOfDay(weekStart) && activityDate <= weekEnd;
      });

      const weekTotal = weekActivities.reduce(
        (total, activity) => total + activity.impact,
        0,
      );
      weeklyData.push({
        week: `Week ${4 - i}`,
        emissions: Math.round(weekTotal * 100) / 100,
        activities: weekActivities.length,
        date: format(weekStart, "MMM dd"),
      });
    }

    // Daily data for last 30 days
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const dayActivities = state.activities.filter((activity) => {
        const activityDate = new Date(activity.date);
        return format(activityDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
      });

      const dayTotal = dayActivities.reduce(
        (total, activity) => total + activity.impact,
        0,
      );
      dailyData.push({
        day: format(day, "MMM dd"),
        emissions: Math.round(dayTotal * 100) / 100,
        activities: dayActivities.length,
        target: monthlyTarget / 30, // Daily target
      });
    }

    // Activity type distribution over time
    const typeDistribution = state.activities.reduce(
      (acc, activity) => {
        const month = format(new Date(activity.date), "MMM");
        if (!acc[month]) {
          acc[month] = { transport: 0, energy: 0, food: 0, shopping: 0 };
        }
        acc[month][activity.type] += activity.impact;
        return acc;
      },
      {} as Record<string, Record<string, number>>,
    );

    const typeDistributionArray = Object.entries(typeDistribution).map(
      ([month, data]) => ({
        month,
        ...data,
      }),
    );

    // Efficiency metrics
    const efficiency = {
      averagePerActivity:
        state.activities.length > 0
          ? currentPeriodFootprint / state.activities.length
          : 0,
      bestDay: dailyData.reduce(
        (best, day) => (day.emissions < best.emissions ? day : best),
        dailyData[0] || { emissions: Infinity },
      ),
      worstDay: dailyData.reduce(
        (worst, day) => (day.emissions > worst.emissions ? day : worst),
        dailyData[0] || { emissions: 0 },
      ),
      streak: calculateLowEmissionStreak(dailyData),
      improvement:
        ((previousPeriodFootprint - currentPeriodFootprint) /
          previousPeriodFootprint) *
        100,
    };

    return {
      currentPeriodFootprint,
      previousPeriodFootprint,
      monthlyTarget,
      categoryData,
      trendData,
      weeklyData,
      dailyData,
      typeDistributionArray,
      efficiency,
    };
  }, [
    state.activities,
    timeRange,
    state.user?.monthlyTarget,
    getTotalFootprint,
    getFootprintByCategory,
    getTrendData,
  ]);

  const calculateLowEmissionStreak = (dailyData: any[]) => {
    let streak = 0;
    const dailyTarget = (state.user?.monthlyTarget || 4.5) / 30;

    for (let i = dailyData.length - 1; i >= 0; i--) {
      if (dailyData[i].emissions <= dailyTarget) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getInsights = () => {
    const { efficiency, currentPeriodFootprint, monthlyTarget, categoryData } =
      analyticsData;
    const insights = [];

    // Performance insights
    if (currentPeriodFootprint < monthlyTarget) {
      insights.push({
        type: "success",
        title: "🎯 On Track!",
        description: `You're ${(((monthlyTarget - currentPeriodFootprint) / monthlyTarget) * 100).toFixed(0)}% below your target.`,
        action: "Keep up the great work!",
      });
    } else {
      insights.push({
        type: "warning",
        title: "⚠️ Above Target",
        description: `You're ${(((currentPeriodFootprint - monthlyTarget) / monthlyTarget) * 100).toFixed(0)}% above your monthly target.`,
        action: "Consider reducing high-impact activities.",
      });
    }

    // Category insights
    const highestCategory = categoryData.reduce(
      (max, cat) => (cat.value > max.value ? cat : max),
      categoryData[0],
    );
    if (highestCategory) {
      insights.push({
        type: "info",
        title: "📊 Top Impact Category",
        description: `${highestCategory.name} accounts for ${((highestCategory.value / currentPeriodFootprint) * 100).toFixed(0)}% of your emissions.`,
        action: `Focus on reducing ${highestCategory.name.toLowerCase()} activities.`,
      });
    }

    // Improvement insights
    if (efficiency.improvement > 0) {
      insights.push({
        type: "success",
        title: "📈 Improvement Detected",
        description: `Your emissions decreased by ${efficiency.improvement.toFixed(1)}% compared to last period.`,
        action: "You're making progress!",
      });
    } else if (efficiency.improvement < -10) {
      insights.push({
        type: "warning",
        title: "📉 Increase Detected",
        description: `Your emissions increased by ${Math.abs(efficiency.improvement).toFixed(1)}% compared to last period.`,
        action: "Review recent activities for optimization opportunities.",
      });
    }

    // Streak insights
    if (efficiency.streak >= 7) {
      insights.push({
        type: "success",
        title: "🔥 Streak Achievement",
        description: `You've maintained low emissions for ${efficiency.streak} consecutive days!`,
        action: "Maintain this momentum!",
      });
    }

    return insights;
  };

  const exportData = () => {
    const data = {
      user: state.user?.name,
      period: timeRange,
      currentFootprint: analyticsData.currentPeriodFootprint,
      target: analyticsData.monthlyTarget,
      activities: state.activities.length,
      categories: analyticsData.categoryData,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carbon-analytics-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported! 📊",
      description: "Your analytics data has been downloaded.",
    });
  };

  const insights = getInsights();

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
              <BarChart3 className="h-8 w-8 text-carbon-600" />
            </motion.div>
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into your environmental impact and progress trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as any)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={exportData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
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
                  Total Emissions
                </p>
                <p className="text-2xl font-bold text-carbon-600">
                  {analyticsData.currentPeriodFootprint.toFixed(1)} kg CO₂
                </p>
              </div>
              <Leaf className="h-8 w-8 text-carbon-600" />
            </div>
            <div className="mt-4">
              <Progress
                value={Math.min(
                  100,
                  (analyticsData.currentPeriodFootprint /
                    analyticsData.monthlyTarget) *
                    100,
                )}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {(
                  (analyticsData.currentPeriodFootprint /
                    analyticsData.monthlyTarget) *
                  100
                ).toFixed(0)}
                % of target
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Activities Logged
                </p>
                <p className="text-2xl font-bold">{state.activities.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {analyticsData.efficiency.improvement > 0 ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
              <span className="text-xs text-muted-foreground">
                {Math.abs(analyticsData.efficiency.improvement).toFixed(1)}% vs
                last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg per Activity
                </p>
                <p className="text-2xl font-bold">
                  {analyticsData.efficiency.averagePerActivity.toFixed(2)} kg
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Badge
                variant={
                  analyticsData.efficiency.averagePerActivity < 2
                    ? "default"
                    : "destructive"
                }
              >
                {analyticsData.efficiency.averagePerActivity < 2
                  ? "Efficient"
                  : "High Impact"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Low-Emission Streak
                </p>
                <p className="text-2xl font-bold">
                  {analyticsData.efficiency.streak} days
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-4 flex items-center gap-1">
              <Badge variant="secondary">
                {realtimeState.achievementStreak} total streak
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {insights.map((insight, index) => (
          <Card
            key={index}
            className={`border-l-4 ${
              insight.type === "success"
                ? "border-l-green-500 bg-green-50"
                : insight.type === "warning"
                  ? "border-l-orange-500 bg-orange-50"
                  : "border-l-blue-500 bg-blue-50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-1 rounded-full ${
                    insight.type === "success"
                      ? "bg-green-100"
                      : insight.type === "warning"
                        ? "bg-orange-100"
                        : "bg-blue-100"
                  }`}
                >
                  {insight.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : insight.type === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                  <p className="text-xs font-medium mt-2">{insight.action}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Daily Emissions</CardTitle>
                  <CardDescription>
                    Your carbon footprint over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} kg CO₂`,
                            name === "emissions" ? "Emissions" : "Target",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="emissions"
                          stroke="#16a34a"
                          fill="#16a34a"
                          fillOpacity={0.3}
                        />
                        <Line
                          type="monotone"
                          dataKey="target"
                          stroke="#ef4444"
                          strokeDasharray="5 5"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Summary</CardTitle>
                  <CardDescription>
                    Emissions and activity count by week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="emissions"
                          fill="#16a34a"
                          name="Emissions (kg CO₂)"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="activities"
                          fill="#3b82f6"
                          name="Activities"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
                <CardDescription>
                  Long-term emission trends over 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} kg CO₂`, "Emissions"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={{ fill: "#16a34a", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>
                    Your emissions by activity category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${value} kg CO₂`,
                            "Emissions",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Category Trends</CardTitle>
                  <CardDescription>
                    How each category has changed over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.typeDistributionArray}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="transport"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                        />
                        <Area
                          type="monotone"
                          dataKey="energy"
                          stackId="1"
                          stroke="#10b981"
                          fill="#10b981"
                        />
                        <Area
                          type="monotone"
                          dataKey="food"
                          stackId="1"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                        />
                        <Area
                          type="monotone"
                          dataKey="shopping"
                          stackId="1"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Category Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  Detailed breakdown of each category's impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {analyticsData.categoryData.map((category, index) => {
                    const percentage =
                      (category.value / analyticsData.currentPeriodFootprint) *
                      100;
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {category.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {category.value.toFixed(1)} kg
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(0)}% of total
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance Comparison</CardTitle>
                    <CardDescription>
                      How you're doing compared to targets and benchmarks
                    </CardDescription>
                  </div>
                  <Select
                    value={comparisonMode}
                    onValueChange={(value) => setComparisonMode(value as any)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="target">vs Target</SelectItem>
                      <SelectItem value="previous">vs Previous</SelectItem>
                      <SelectItem value="average">vs Average</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Period</h4>
                    <div className="text-3xl font-bold text-carbon-600">
                      {analyticsData.currentPeriodFootprint.toFixed(1)} kg CO₂
                    </div>
                    <Progress
                      value={Math.min(
                        100,
                        (analyticsData.currentPeriodFootprint /
                          analyticsData.monthlyTarget) *
                          100,
                      )}
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">
                      {comparisonMode === "target"
                        ? "Monthly Target"
                        : comparisonMode === "previous"
                          ? "Previous Period"
                          : "Global Average"}
                    </h4>
                    <div className="text-3xl font-bold text-muted-foreground">
                      {comparisonMode === "target"
                        ? analyticsData.monthlyTarget.toFixed(1)
                        : comparisonMode === "previous"
                          ? analyticsData.previousPeriodFootprint.toFixed(1)
                          : "4.2"}{" "}
                      kg CO₂
                    </div>
                    <Progress value={100} className="h-3" />
                  </div>
                </div>

                {/* Comparison insights */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {analyticsData.efficiency.improvement > 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    )}
                    <span className="font-medium">
                      {analyticsData.efficiency.improvement > 0
                        ? "Great Progress!"
                        : "Room for Improvement"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analyticsData.efficiency.improvement > 0
                      ? `You've reduced your emissions by ${analyticsData.efficiency.improvement.toFixed(1)}% compared to the previous period.`
                      : `Your emissions increased by ${Math.abs(analyticsData.efficiency.improvement).toFixed(1)}% compared to the previous period.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Goal Tracking</CardTitle>
                <CardDescription>
                  Monitor your progress towards sustainability goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Monthly Goal */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Monthly Carbon Target</span>
                      <span className="text-sm text-muted-foreground">
                        {analyticsData.currentPeriodFootprint.toFixed(1)} /{" "}
                        {analyticsData.monthlyTarget} kg CO₂
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        100,
                        (analyticsData.currentPeriodFootprint /
                          analyticsData.monthlyTarget) *
                          100,
                      )}
                      className="h-3"
                    />
                  </div>

                  {/* User goals */}
                  {state.user?.goals && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Carbon Reduction Goal
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {state.user.goals.carbonReduction}%
                          </span>
                        </div>
                        <Progress
                          value={state.user.goals.carbonReduction}
                          className="h-3"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Transport Reduction Goal
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {state.user.goals.transportReduction}%
                          </span>
                        </div>
                        <Progress
                          value={state.user.goals.transportReduction}
                          className="h-3"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Renewable Energy Goal
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {state.user.goals.renewableEnergy}%
                          </span>
                        </div>
                        <Progress
                          value={state.user.goals.renewableEnergy}
                          className="h-3"
                        />
                      </div>
                    </>
                  )}

                  {/* Streak goal */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Low-Emission Streak</span>
                      <span className="text-sm text-muted-foreground">
                        {analyticsData.efficiency.streak} / 30 days
                      </span>
                    </div>
                    <Progress
                      value={(analyticsData.efficiency.streak / 30) * 100}
                      className="h-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
