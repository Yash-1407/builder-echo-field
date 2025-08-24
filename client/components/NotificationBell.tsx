import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealtime } from "@/contexts/RealtimeContext";
import { Bell, Check, CheckCheck, Trophy, Info, AlertTriangle, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'achievement':
      return <Trophy className="h-4 w-4 text-yellow-600" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    case 'success':
      return <Star className="h-4 w-4 text-green-600" />;
    default:
      return <Info className="h-4 w-4 text-blue-600" />;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export default function NotificationBell() {
  const { state, markAsRead, markAllAsRead } = useRealtime();
  const [isOpen, setIsOpen] = useState(false);

  const recentNotifications = state.notifications.slice(0, 10);

  const handleNotificationClick = (notificationId: string) => {
    if (!state.notifications.find(n => n.id === notificationId)?.read) {
      markAsRead(notificationId);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 px-0">
          <motion.div
            animate={state.unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3, repeat: state.unreadCount > 0 ? Infinity : 0, repeatDelay: 3 }}
          >
            <Bell className="h-4 w-4" />
          </motion.div>
          <AnimatePresence>
            {state.unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {state.unreadCount > 9 ? '9+' : state.unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            <motion.div
              className={`h-2 w-2 rounded-full ${state.isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              animate={state.isConnected ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-muted-foreground">
              {state.isConnected ? 'Live' : 'Offline'}
            </span>
            {state.unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-6 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-1">
              {recentNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`relative ${!notification.read ? 'bg-accent/50' : ''}`}
                >
                  <DropdownMenuItem
                    className="flex flex-col items-start p-3 cursor-pointer"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                          {notification.action && (
                            <Link
                              to={notification.action.href}
                              className="text-xs text-primary hover:underline"
                              onClick={() => setIsOpen(false)}
                            >
                              {notification.action.label}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
        {recentNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center">
              <Link 
                to="/notifications" 
                className="text-sm text-primary hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
