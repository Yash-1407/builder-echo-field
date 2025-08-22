import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2, Leaf } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "pulse" | "carbon";
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8", 
  lg: "h-12 w-12"
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg"
};

export function Loading({ 
  size = "md", 
  variant = "spinner", 
  text, 
  className 
}: LoadingProps) {
  if (variant === "carbon") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={cn("text-carbon-600", sizeClasses[size])}
        >
          <Leaf className="w-full h-full" />
        </motion.div>
        {text && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn("text-muted-foreground", textSizeClasses[size])}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={cn("bg-primary rounded-full", sizeClasses[size])}
        />
        {text && (
          <p className={cn("text-muted-foreground", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className={cn("text-muted-foreground", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
}

// Skeleton loading components
export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="border rounded-lg p-6">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
      <div className="h-64 bg-gray-100 rounded animate-pulse" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6">
          <div className="h-8 w-8 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
