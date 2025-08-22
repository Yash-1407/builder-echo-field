import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Zap, Utensils, ShoppingBag, Calendar, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useActivity, Activity } from "@/contexts/ActivityContext";

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInHours < 48) return "Yesterday";

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "transport":
      return Car;
    case "energy":
      return Zap;
    case "food":
      return Utensils;
    case "shopping":
      return ShoppingBag;
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
  const { state } = useActivity();
  const recentActivities = state.activities.slice(0, 5); // Show only the 5 most recent

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
        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No activities logged yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Start tracking your carbon footprint by logging an activity!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
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
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.date)}</p>
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
        )}
      </CardContent>
    </Card>
  );
}
