import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
  trend?: number[];
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  trend
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-carbon-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeIcon = () => {
    if (changeType === "positive") return "↗";
    if (changeType === "negative") return "↙";
    return "→";
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
          {change && (
            <div className={`text-xs flex items-center space-x-1 ${getChangeColor()}`}>
              <span>{getChangeIcon()}</span>
              <span>{change}</span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
          {trend && (
            <div className="mt-4">
              <div className="flex items-end space-x-1 h-8">
                {trend.map((value, index) => (
                  <div
                    key={index}
                    className="bg-carbon-200 rounded-sm flex-1"
                    style={{ height: `${(value / Math.max(...trend)) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
