import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Car, Zap, Utensils, ShoppingBag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ActivityFormModal from "./ActivityFormModal";
import { useRealtime } from "@/contexts/RealtimeContext";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  type: 'transport' | 'energy' | 'food' | 'shopping';
}

const quickActions: QuickAction[] = [
  {
    icon: Car,
    label: "Log Commute",
    description: "Track your daily travel",
    color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    type: "transport"
  },
  {
    icon: Zap,
    label: "Energy Usage",
    description: "Record electricity consumption",
    color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
    type: "energy"
  },
  {
    icon: Utensils,
    label: "Diet Impact",
    description: "Track food choices",
    color: "bg-green-100 text-green-600 hover:bg-green-200",
    type: "food"
  },
  {
    icon: ShoppingBag,
    label: "Purchases",
    description: "Log shopping activities",
    color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
    type: "shopping"
  }
];

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<'transport' | 'energy' | 'food' | 'shopping' | null>(null);

  const handleActionClick = (type: 'transport' | 'energy' | 'food' | 'shopping') => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
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
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className={`h-auto p-4 flex flex-col items-center gap-2 w-full ${action.color}`}
                    onClick={() => handleActionClick(action.type)}
                  >
                    <Icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className="text-xs opacity-75">{action.description}</div>
                    </div>
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
