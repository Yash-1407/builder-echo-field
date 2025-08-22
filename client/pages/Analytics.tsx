import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ActivityChart from "@/components/ActivityChart";
import StatsCard from "@/components/StatsCard";
import { useActivity } from "@/contexts/ActivityContext";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Globe,
  Users,
  Award,
  Lightbulb,
  Download,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";

export default function Analytics() {
  const { state, getTotalFootprint, getFootprintByCategory, getTrendData } = useActivity();
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Calculate various metrics
  const currentMonthFootprint = getTotalFootprint('month');
  const currentWeekFootprint = getTotalFootprint('week');
  const categoryData = getFootprintByCategory();
  const trendData = getTrendData();

  // Calculate comparisons with averages
  const nationalAverage = 5.2; // tons CO2 per month
  const globalAverage = 4.8; // tons CO2 per month
  const friendsAverage = 4.2; // simulated friends average

  // Weekly data for the current month
  const getWeeklyData = () => {
    const weeks = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekActivities = state.activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= weekStart && activityDate <= weekEnd;
      });
      
      const weekTotal = weekActivities.reduce((sum, activity) => sum + activity.impact, 0);
      weeks.push({ 
        name: `Week ${4-i}`, 
        value: Math.round(weekTotal * 100) / 100 
      });
    }
    return weeks;
  };

  // Daily data for the current week
  const getDailyData = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayActivities = state.activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate.toDateString() === date.toDateString();
      });
      
      const dayTotal = dayActivities.reduce((sum, activity) => sum + activity.impact, 0);
      days.push({ 
        name: dayName, 
        value: Math.round(dayTotal * 100) / 100 
      });
    }
    return days;
  };

  const weeklyData = getWeeklyData();
  const dailyData = getDailyData();

  // Comparison data
  const comparisonData = [
    { name: "You", value: currentMonthFootprint, color: "#16a34a" },
    { name: "National Avg", value: nationalAverage, color: "#f59e0b" },
    { name: "Global Avg", value: globalAverage, color: "#3b82f6" },
    { name: "Friends Avg", value: friendsAverage, color: "#8b5cf6" },
  ];

  // Calculate improvement percentage
  const improvementVsNational = ((nationalAverage - currentMonthFootprint) / nationalAverage * 100);
  const improvementVsGlobal = ((globalAverage - currentMonthFootprint) / globalAverage * 100);

  // Generate insights
  const generateInsights = () => {
    const insights = [];
    
    if (currentMonthFootprint < nationalAverage) {
      insights.push({
        type: "positive",
        title: "Below National Average",
        description: `You're ${Math.abs(improvementVsNational).toFixed(1)}% below the national average. Great work!`,
        icon: "🌟"
      });
    }
    
    if (currentMonthFootprint < globalAverage) {
      insights.push({
        type: "positive", 
        title: "Below Global Average",
        description: `You're ${Math.abs(improvementVsGlobal).toFixed(1)}% below the global average.`,
        icon: "🌍"
      });
    }

    const transportCategory = categoryData.find(cat => cat.name === "Transportation");
    if (transportCategory && transportCategory.value > 0) {
      insights.push({
        type: "suggestion",
        title: "Transportation Impact",
        description: "Transportation is your largest emission source. Consider public transport or cycling.",
        icon: "🚲"
      });
    }

    const energyCategory = categoryData.find(cat => cat.name === "Energy");
    if (energyCategory && energyCategory.value > 2) {
      insights.push({
        type: "suggestion",
        title: "Energy Usage",
        description: "High energy usage detected. Switch to renewable energy or reduce consumption.",
        icon: "⚡"
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Detailed insights into your carbon footprint and sustainability trends</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
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

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Monthly Total"
            value={`${currentMonthFootprint.toFixed(1)} tons`}
            change={improvementVsNational > 0 ? `${improvementVsNational.toFixed(1)}% below national avg` : `${Math.abs(improvementVsNational).toFixed(1)}% above national avg`}
            changeType={improvementVsNational > 0 ? "positive" : "negative"}
            icon={BarChart3}
            description="CO₂ equivalent this month"
          />
          <StatsCard
            title="Weekly Average"
            value={`${(currentMonthFootprint / 4).toFixed(2)} tons`}
            change={"vs last week"}
            changeType="positive"
            icon={Calendar}
            description="Average weekly emissions"
          />
          <StatsCard
            title="Global Ranking"
            value={currentMonthFootprint < globalAverage ? "Top 30%" : "Top 60%"}
            change={improvementVsGlobal > 0 ? "Better than average" : "Room for improvement"}
            changeType={improvementVsGlobal > 0 ? "positive" : "negative"}
            icon={Globe}
            description="Compared to global users"
          />
          <StatsCard
            title="Reduction Trend"
            value={trendData.length > 1 && trendData[trendData.length-1].value < trendData[trendData.length-2].value ? "Improving" : "Stable"}
            change={trendData.length > 1 ? `${Math.abs(((trendData[trendData.length-1].value - trendData[trendData.length-2].value) / trendData[trendData.length-2].value * 100)).toFixed(1)}%` : "0%"}
            changeType={trendData.length > 1 && trendData[trendData.length-1].value < trendData[trendData.length-2].value ? "positive" : "negative"}
            icon={TrendingDown}
            description="Month-over-month change"
          />
        </motion.div>

        {/* Main Charts */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Trend Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Tabs defaultValue="monthly" className="w-full">
                <TabsList>
                  <TabsTrigger value="monthly">6-Month Trend</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly Breakdown</TabsTrigger>
                  <TabsTrigger value="daily">Daily This Week</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly">
                  <ActivityChart
                    title="Carbon Emissions Trend"
                    description="Your emissions over the last 6 months"
                    data={trendData}
                    type="line"
                    height={350}
                  />
                </TabsContent>
                <TabsContent value="weekly">
                  <ActivityChart
                    title="Weekly Breakdown"
                    description="Weekly emissions for this month"
                    data={weeklyData}
                    type="bar"
                    height={350}
                  />
                </TabsContent>
                <TabsContent value="daily">
                  <ActivityChart
                    title="Daily Emissions"
                    description="Daily breakdown for this week"
                    data={dailyData}
                    type="bar"
                    height={350}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ActivityChart
                title="Comparison with Averages"
                description="How you compare with national, global, and friends' averages"
                data={comparisonData}
                type="bar"
                height={300}
              />
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ActivityChart
                title="Category Breakdown"
                description="This month's emissions by category"
                data={categoryData}
                type="pie"
                height={280}
              />
            </motion.div>

            {/* Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    AI Insights
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations based on your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      insight.type === 'positive' ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : 
                      'bg-blue-50 border-blue-200 dark:bg-blue-950/20'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{insight.icon}</span>
                        <div>
                          <h4 className={`font-medium text-sm ${
                            insight.type === 'positive' ? 'text-green-800 dark:text-green-200' : 
                            'text-blue-800 dark:text-blue-200'
                          }`}>
                            {insight.title}
                          </h4>
                          <p className={`text-xs mt-1 ${
                            insight.type === 'positive' ? 'text-green-600 dark:text-green-400' : 
                            'text-blue-600 dark:text-blue-400'
                          }`}>
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Goals Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Monthly Goals
                  </CardTitle>
                  <CardDescription>
                    Track your progress towards sustainability targets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Carbon Target</span>
                      <Badge variant={currentMonthFootprint <= (state.user?.monthlyTarget || 4.5) ? "default" : "destructive"}>
                        {currentMonthFootprint.toFixed(1)}/{state.user?.monthlyTarget || 4.5} tons
                      </Badge>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          currentMonthFootprint <= (state.user?.monthlyTarget || 4.5) ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min((currentMonthFootprint / (state.user?.monthlyTarget || 4.5)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Weekly Activities</span>
                      <Badge variant="outline">
                        {state.activities.filter(a => {
                          const activityDate = new Date(a.date);
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return activityDate >= weekAgo;
                        }).length}/7 logged
                      </Badge>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min((state.activities.filter(a => {
                          const activityDate = new Date(a.date);
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return activityDate >= weekAgo;
                        }).length / 7) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Impact Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Environmental Impact Summary</CardTitle>
              <CardDescription>
                See the positive impact of your sustainable choices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.max(0, (nationalAverage - currentMonthFootprint) * 12).toFixed(1)}
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Tons CO₂ saved annually vs national average
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round(Math.max(0, (nationalAverage - currentMonthFootprint) * 2.5))}
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Trees equivalent planted per month
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round(Math.max(0, (nationalAverage - currentMonthFootprint) * 500))}
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Liters of water saved monthly
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
