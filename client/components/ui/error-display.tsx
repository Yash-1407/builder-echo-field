import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "./button";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  variant?: "default" | "network" | "minimal";
  className?: string;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  variant = "default",
  className 
}: ErrorDisplayProps) {
  const isNetworkError = error.toLowerCase().includes('network') || 
                        error.toLowerCase().includes('fetch') ||
                        error.toLowerCase().includes('connection');

  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("flex items-center gap-2 text-sm text-destructive", className)}
      >
        <AlertTriangle className="h-4 w-4" />
        <span>{error}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-6 px-2">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </motion.div>
    );
  }

  if (variant === "network") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("text-center py-8", className)}
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-4"
        >
          {isNetworkError ? (
            <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
          ) : (
            <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
          )}
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">
          {isNetworkError ? "Connection Issue" : "Something Went Wrong"}
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          {isNetworkError 
            ? "Please check your internet connection and try again."
            : error
          }
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("border border-destructive/20 rounded-lg p-4 bg-destructive/5", className)}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-destructive mb-1">Error</h4>
          <p className="text-sm text-destructive/80">{error}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Empty state component
interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  action, 
  icon: Icon = AlertTriangle,
  className 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("text-center py-12", className)}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Icon className="h-16 w-16 mx-auto text-muted-foreground/50" />
      </motion.div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
