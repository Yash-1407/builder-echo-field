import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActivity, Activity } from "@/contexts/ActivityContext";
import { Car, Zap, Utensils, ShoppingBag } from "lucide-react";

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'transport' | 'energy' | 'food' | 'shopping';
}

const activityConfig = {
  transport: {
    icon: Car,
    title: "Log Transportation",
    description: "Track your commute or travel impact",
    fields: [
      { name: "vehicleType", label: "Vehicle Type", type: "select", options: ["Car", "Bus", "Train", "Bike", "Walking", "Plane", "Taxi"] },
      { name: "distance", label: "Distance (miles)", type: "number" },
    ],
    calculateImpact: (data: any) => {
      const factors: { [key: string]: number } = {
        Car: 0.4, Bus: 0.1, Train: 0.05, Bike: 0, Walking: 0, Plane: 0.9, Taxi: 0.5
      };
      return (data.distance || 0) * (factors[data.vehicleType] || 0.4);
    }
  },
  energy: {
    icon: Zap,
    title: "Log Energy Usage",
    description: "Record electricity or heating consumption",
    fields: [
      { name: "energySource", label: "Energy Source", type: "select", options: ["Grid Electricity", "Natural Gas", "Solar", "Wind", "Oil", "Coal"] },
      { name: "energyAmount", label: "Amount (kWh)", type: "number" },
    ],
    calculateImpact: (data: any) => {
      const factors: { [key: string]: number } = {
        "Grid Electricity": 0.5, "Natural Gas": 0.2, "Solar": 0, "Wind": 0, "Oil": 0.7, "Coal": 0.9
      };
      return (data.energyAmount || 0) * (factors[data.energySource] || 0.5);
    }
  },
  food: {
    icon: Utensils,
    title: "Log Food Impact",
    description: "Track the carbon footprint of your meals",
    fields: [
      { name: "mealType", label: "Meal Type", type: "select", options: ["Breakfast", "Lunch", "Dinner", "Snack"] },
      { name: "foodType", label: "Primary Food", type: "select", options: ["Beef", "Pork", "Chicken", "Fish", "Vegetarian", "Vegan", "Mixed"] },
    ],
    calculateImpact: (data: any) => {
      const factors: { [key: string]: number } = {
        Beef: 6.0, Pork: 3.0, Chicken: 1.5, Fish: 1.2, Vegetarian: 0.8, Vegan: 0.4, Mixed: 2.0
      };
      return factors[data.foodType] || 1.0;
    }
  },
  shopping: {
    icon: ShoppingBag,
    title: "Log Purchase",
    description: "Track the impact of your shopping",
    fields: [
      { name: "itemType", label: "Item Category", type: "select", options: ["Clothing", "Electronics", "Books", "Household", "Food", "Other"] },
      { name: "quantity", label: "Quantity", type: "number" },
    ],
    calculateImpact: (data: any) => {
      const factors: { [key: string]: number } = {
        Clothing: 2.0, Electronics: 5.0, Books: 0.5, Household: 1.5, Food: 1.0, Other: 1.0
      };
      return (data.quantity || 1) * (factors[data.itemType] || 1.0);
    }
  }
};

export default function ActivityFormModal({ isOpen, onClose, type }: ActivityFormModalProps) {
  const { addActivity } = useActivity();
  const [formData, setFormData] = useState<any>({});
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const config = activityConfig[type];
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const impact = config.calculateImpact(formData);
      const category = formData.vehicleType || formData.energySource || formData.foodType || formData.itemType || "General";

      const activity: Omit<Activity, 'id'> = {
        type,
        description: description || `${category} - ${impact.toFixed(1)} kg CO₂`,
        impact: Math.round(impact * 100) / 100,
        unit: "kg CO₂",
        date: new Date().toISOString(),
        category,
        details: formData,
      };

      addActivity(activity);
      
      // Reset form
      setFormData({});
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error adding activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: string | number) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "select" && field.options ? (
                <Select onValueChange={(value) => handleFieldChange(field.name, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
                  placeholder={field.label}
                />
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
