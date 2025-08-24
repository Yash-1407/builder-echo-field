import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Car, Zap, Utensils, ShoppingBag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ActivityFormModal from "./ActivityFormModal";
import { useRealtime } from "@/contexts/RealtimeContext";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  type: "transport" | "energy" | "food" | "shopping";
}

const quickActions: QuickAction[] = [
  {
    icon: Car,
    label: "Log Commute",
    description: "Track your daily travel",
    color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    type: "transport",
  },
  {
    icon: Zap,
    label: "Energy Usage",
    description: "Record electricity consumption",
    color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
    type: "energy",
  },
  {
    icon: Utensils,
    label: "Diet Impact",
    description: "Track food choices",
    color: "bg-green-100 text-green-600 hover:bg-green-200",
    type: "food",
  },
  {
    icon: ShoppingBag,
    label: "Purchases",
    description: "Log shopping activities",
    color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
    type: "shopping",
  },
];

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<
    "transport" | "energy" | "food" | "shopping" | null
  >(null);
  const [celebrateIndex, setCelebrateIndex] = useState<number | null>(null);
  const { addNotification } = useRealtime();

  const handleActionClick = (
    type: "transport" | "energy" | "food" | "shopping",
  ) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);

    // Trigger celebration animation if modal was actually used to add activity
    if (activeModal) {
      const actionIndex = quickActions.findIndex(
        (action) => action.type === activeModal,
      );
      setCelebrateIndex(actionIndex);

      // Add real-time notification
      addNotification({
        type: "success",
        title: "Activity Added!",
        message: `Great job tracking your ${activeModal} activity. Every action counts! 🌱`,
        action: {
          label: "View Dashboard",
          href: "/dashboard",
        },
      });

      // Reset celebration after animation
      setTimeout(() => setCelebrateIndex(null), 2000);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Add Activity
          </CardTitle>
          <CardDescription>
            Quickly log your daily activities to track their carbon impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isoCelebrating = celebrateIndex === index;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <Button
                    variant="ghost"
                    className={`h-auto p-4 flex flex-col items-center gap-2 w-full ${action.color} relative overflow-hidden`}
                    onClick={() => handleActionClick(action.type)}
                  >
                    <motion.div
                      animate={
                        isoCelebrating
                          ? {
                              scale: [1, 1.2, 1],
                              rotate: [0, 5, -5, 0],
                            }
                          : {}
                      }
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className="text-xs opacity-75">
                        {action.description}
                      </div>
                    </div>

                    {/* Celebration sparkles */}
                    <AnimatePresence>
                      {isoCelebrating && (
                        <>
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute"
                              initial={{
                                opacity: 0,
                                scale: 0,
                                x: 0,
                                y: 0,
                              }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                x: Math.cos((i * 60 * Math.PI) / 180) * 30,
                                y: Math.sin((i * 60 * Math.PI) / 180) * 30,
                              }}
                              transition={{
                                duration: 1,
                                delay: i * 0.1,
                                ease: "easeOut",
                              }}
                              style={{
                                left: "50%",
                                top: "50%",
                              }}
                            >
                              <Sparkles className="h-3 w-3 text-yellow-500" />
                            </motion.div>
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activity Form Modals */}
      {activeModal && (
        <ActivityFormModal
          isOpen={true}
          onClose={closeModal}
          type={activeModal}
        />
      )}
    </>
  );
}
