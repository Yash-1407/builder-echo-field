import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Zap, Utensils, Calendar, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface Activity {
  id: string;
  type: "transport" | "energy" | "food" | "shopping";
  description: string;
  impact: number;
  unit: string;
  date: string;
  category: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "transport",
    description: "15 mile car commute",
    impact: 8.2,
    unit: "kg CO₂",
    date: "2 hours ago",
    category: "Daily Commute"
  },
  {
    id: "2", 
    type: "energy",
    description: "Home electricity usage",
    impact: 12.5,
    unit: "kg CO₂",
    date: "4 hours ago",
    category: "Energy"
  },
  {
    id: "3",
    type: "food",
    description: "Beef lunch at restaurant",
    impact: 6.8,
    unit: "kg CO₂",
    date: "6 hours ago",
    category: "Dining"
  },
  {
    id: "4",
    type: "transport",
    description: "Bus ride to downtown",
    impact: 1.2,
    unit: "kg CO₂",
    date: "Yesterday",
    category: "Public Transport"
  }
];

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "transport":
      return Car;
    case "energy":
      return Zap;
    case "food":
      return Utensils;
    default:
      return Car;
  }
};

const getImpactColor = (impact: number) => {
  if (impact <= 2) return "bg-green-100 text-green-800";
  if (impact <= 5) return "bg-yellow-100 text-yellow-800";
  if (impact <= 10) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

export default function RecentActivities() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Your latest logged activities and their carbon impact
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{activity.category}</p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getImpactColor(activity.impact)}>
                    {activity.impact} {activity.unit}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
