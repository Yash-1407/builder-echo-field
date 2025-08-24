import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useActivity } from "@/contexts/ActivityContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import {
  Car,
  Zap,
  UtensilsCrossed,
  ShoppingBag,
  Calculator,
  Save,
  Trash2,
  Edit,
  Plus,
  TrendingUp,
  Leaf,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Fuel,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface ActivityForm {
  type: "transport" | "energy" | "food" | "shopping";
  description: string;
  impact: number;
  unit: string;
  date: string;
  category: string;
  details: {
    distance?: number;
    vehicleType?: string;
    energyAmount?: number;
    energySource?: string;
    mealType?: string;
    foodType?: string;
    itemType?: string;
    quantity?: number;
  };
}

const ActivityTracker = () => {
  const { addActivity, state } = useActivity();
  const { broadcastActivity } = useRealtime();
  const [activeTab, setActiveTab] = useState<
    "transport" | "energy" | "food" | "shopping"
  >("transport");
  const [isCalculating, setIsCalculating] = useState(false);
  const [form, setForm] = useState<ActivityForm>({
    type: "transport",
    description: "",
    impact: 0,
    unit: "kg CO₂",
    date: new Date().toISOString().split("T")[0],
    category: "",
    details: {},
  });

  // Real-time calculation updates
  useEffect(() => {
    const calculateImpact = () => {
      setIsCalculating(true);

      setTimeout(() => {
        let calculatedImpact = 0;
        let description = "";
        let category = "";

        switch (activeTab) {
          case "transport":
            calculatedImpact = calculateTransportImpact(form.details);
            description = generateTransportDescription(form.details);
            category = form.details.vehicleType || "Unknown";
            break;
          case "energy":
            calculatedImpact = calculateEnergyImpact(form.details);
            description = generateEnergyDescription(form.details);
            category = form.details.energySource || "Unknown";
            break;
          case "food":
            calculatedImpact = calculateFoodImpact(form.details);
            description = generateFoodDescription(form.details);
            category = form.details.foodType || "Unknown";
            break;
          case "shopping":
            calculatedImpact = calculateShoppingImpact(form.details);
            description = generateShoppingDescription(form.details);
            category = form.details.itemType || "Unknown";
            break;
        }

        setForm((prev) => ({
          ...prev,
          type: activeTab,
          impact: calculatedImpact,
          description,
          category,
        }));
        setIsCalculating(false);
      }, 500);
    };

    if (Object.keys(form.details).length > 0) {
      calculateImpact();
    }
  }, [form.details, activeTab]);

  // Calculation functions
  const calculateTransportImpact = (details: any) => {
    const distance = details.distance || 0;
    const vehicleType = details.vehicleType;

    const emissionFactors: Record<string, number> = {
      Car: 0.4, // kg CO₂ per km
      Bus: 0.1,
      Train: 0.05,
      Bicycle: 0,
      Walking: 0,
      Motorcycle: 0.3,
      Plane: 0.25,
      "Electric Car": 0.1,
    };

    return (
      Math.round(distance * (emissionFactors[vehicleType] || 0.4) * 100) / 100
    );
  };

  const calculateEnergyImpact = (details: any) => {
    const amount = details.energyAmount || 0;
    const source = details.energySource;

    const emissionFactors: Record<string, number> = {
      "Grid Electricity": 0.5, // kg CO₂ per kWh
      "Natural Gas": 0.2,
      Coal: 0.9,
      Solar: 0.05,
      Wind: 0.02,
      Nuclear: 0.01,
      Hydro: 0.02,
    };

    return Math.round(amount * (emissionFactors[source] || 0.5) * 100) / 100;
  };

  const calculateFoodImpact = (details: any) => {
    const mealType = details.mealType;
    const foodType = details.foodType;

    const baseMealEmissions: Record<string, number> = {
      Breakfast: 1.0,
      Lunch: 2.0,
      Dinner: 2.5,
      Snack: 0.5,
    };

    const foodMultipliers: Record<string, number> = {
      Beef: 3.0,
      Pork: 2.0,
      Chicken: 1.5,
      Fish: 1.2,
      Vegetarian: 0.5,
      Vegan: 0.3,
      Dairy: 1.0,
    };

    const baseMeal = baseMealEmissions[mealType] || 1.0;
    const multiplier = foodMultipliers[foodType] || 1.0;

    return Math.round(baseMeal * multiplier * 100) / 100;
  };

  const calculateShoppingImpact = (details: any) => {
    const quantity = details.quantity || 1;
    const itemType = details.itemType;

    const itemEmissions: Record<string, number> = {
      Electronics: 5.0, // per item
      Clothing: 2.0,
      Books: 0.5,
      Furniture: 15.0,
      Appliances: 20.0,
      Toys: 1.0,
      Cosmetics: 1.5,
    };

    return Math.round(quantity * (itemEmissions[itemType] || 2.0) * 100) / 100;
  };

  // Description generators
  const generateTransportDescription = (details: any) => {
    const { distance, vehicleType } = details;
    return `${distance || 0} km by ${vehicleType || "Vehicle"}`;
  };

  const generateEnergyDescription = (details: any) => {
    const { energyAmount, energySource } = details;
    return `${energyAmount || 0} kWh from ${energySource || "Energy Source"}`;
  };

  const generateFoodDescription = (details: any) => {
    const { mealType, foodType } = details;
    return `${foodType || "Food"} ${(mealType || "Meal").toLowerCase()}`;
  };

  const generateShoppingDescription = (details: any) => {
    const { quantity, itemType } = details;
    return `${quantity || 1} ${itemType || "Item"}${(quantity || 1) > 1 ? "s" : ""}`;
  };

  const updateDetail = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!form.description || form.impact <= 0) {
      toast({
        title: "Invalid Activity",
        description:
          "Please fill in all required fields and ensure impact is greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addActivity({
        type: form.type,
        description: form.description,
        impact: form.impact,
        unit: form.unit,
        date: new Date(form.date).toISOString(),
        category: form.category,
        details: form.details,
      });

      // Broadcast to community (realtime)
      broadcastActivity({
        type: form.type,
        impact: form.impact,
        category: form.category,
      });

      // Reset form
      setForm({
        type: activeTab,
        description: "",
        impact: 0,
        unit: "kg CO₂",
        date: new Date().toISOString().split("T")[0],
        category: "",
        details: {},
      });

      toast({
        title: "Activity Logged! 🌱",
        description: `${form.description} - ${form.impact} ${form.unit} saved to your tracker`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const tabIcons = {
    transport: Car,
    energy: Zap,
    food: UtensilsCrossed,
    shopping: ShoppingBag,
  };

  const getImpactColor = (impact: number) => {
    if (impact <= 1) return "text-green-600";
    if (impact <= 5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Calculator className="h-8 w-8 text-carbon-600" />
            </motion.div>
            Activity Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Log your daily activities and calculate their environmental impact
          </p>
        </div>

        {/* Current Impact Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 md:mt-0"
        >
          <Card className="bg-gradient-to-r from-carbon-50 to-green-50 border-carbon-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full">
                  <Leaf className="h-6 w-6 text-carbon-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Current Impact
                  </div>
                  <div
                    className={`text-2xl font-bold ${getImpactColor(form.impact)}`}
                  >
                    {isCalculating ? (
                      <span className="animate-pulse">Calculating...</span>
                    ) : (
                      `${form.impact} ${form.unit}`
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Activity Tracker Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-carbon-600" />
              Log New Activity
            </CardTitle>
            <CardDescription>
              Select an activity type and enter details to calculate your carbon
              footprint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as any)}
            >
              <TabsList className="grid w-full grid-cols-4">
                {Object.entries(tabIcons).map(([key, Icon]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Transport Tab */}
              <TabsContent value="transport" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-type">Vehicle Type</Label>
                    <Select
                      value={form.details.vehicleType || ""}
                      onValueChange={(value) =>
                        updateDetail("vehicleType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Car">🚗 Car</SelectItem>
                        <SelectItem value="Electric Car">
                          ⚡ Electric Car
                        </SelectItem>
                        <SelectItem value="Bus">🚌 Bus</SelectItem>
                        <SelectItem value="Train">🚊 Train</SelectItem>
                        <SelectItem value="Motorcycle">
                          🏍️ Motorcycle
                        </SelectItem>
                        <SelectItem value="Bicycle">🚲 Bicycle</SelectItem>
                        <SelectItem value="Walking">🚶 Walking</SelectItem>
                        <SelectItem value="Plane">✈️ Plane</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km)</Label>
                    <Input
                      id="distance"
                      type="number"
                      placeholder="Enter distance"
                      value={form.details.distance || ""}
                      onChange={(e) =>
                        updateDetail(
                          "distance",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </motion.div>

                {form.details.vehicleType && form.details.distance && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-2 text-blue-700">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Trip Calculation</span>
                    </div>
                    <p className="text-blue-600 mt-1">
                      {form.details.distance} km by {form.details.vehicleType} ={" "}
                      {form.impact} kg CO₂
                    </p>
                  </motion.div>
                )}
              </TabsContent>

              {/* Energy Tab */}
              <TabsContent value="energy" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <div className="space-y-2">
                    <Label htmlFor="energy-source">Energy Source</Label>
                    <Select
                      value={form.details.energySource || ""}
                      onValueChange={(value) =>
                        updateDetail("energySource", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select energy source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grid Electricity">
                          ⚡ Grid Electricity
                        </SelectItem>
                        <SelectItem value="Solar">☀️ Solar</SelectItem>
                        <SelectItem value="Wind">💨 Wind</SelectItem>
                        <SelectItem value="Nuclear">⚛️ Nuclear</SelectItem>
                        <SelectItem value="Hydro">💧 Hydro</SelectItem>
                        <SelectItem value="Natural Gas">
                          🔥 Natural Gas
                        </SelectItem>
                        <SelectItem value="Coal">🪨 Coal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="energy-amount">Energy Amount (kWh)</Label>
                    <Input
                      id="energy-amount"
                      type="number"
                      placeholder="Enter kWh used"
                      value={form.details.energyAmount || ""}
                      onChange={(e) =>
                        updateDetail(
                          "energyAmount",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </motion.div>

                {form.details.energySource && form.details.energyAmount && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 p-4 rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-center gap-2 text-yellow-700">
                      <Fuel className="h-4 w-4" />
                      <span className="font-medium">Energy Calculation</span>
                    </div>
                    <p className="text-yellow-600 mt-1">
                      {form.details.energyAmount} kWh from{" "}
                      {form.details.energySource} = {form.impact} kg CO₂
                    </p>
                  </motion.div>
                )}
              </TabsContent>

              {/* Food Tab */}
              <TabsContent value="food" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <div className="space-y-2">
                    <Label htmlFor="meal-type">Meal Type</Label>
                    <Select
                      value={form.details.mealType || ""}
                      onValueChange={(value) => updateDetail("mealType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Breakfast">🌅 Breakfast</SelectItem>
                        <SelectItem value="Lunch">🌞 Lunch</SelectItem>
                        <SelectItem value="Dinner">🌙 Dinner</SelectItem>
                        <SelectItem value="Snack">🍎 Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="food-type">Food Type</Label>
                    <Select
                      value={form.details.foodType || ""}
                      onValueChange={(value) => updateDetail("foodType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select food type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beef">🥩 Beef</SelectItem>
                        <SelectItem value="Pork">🐷 Pork</SelectItem>
                        <SelectItem value="Chicken">🐔 Chicken</SelectItem>
                        <SelectItem value="Fish">🐟 Fish</SelectItem>
                        <SelectItem value="Vegetarian">
                          🥬 Vegetarian
                        </SelectItem>
                        <SelectItem value="Vegan">🌱 Vegan</SelectItem>
                        <SelectItem value="Dairy">🥛 Dairy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                {form.details.mealType && form.details.foodType && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 p-4 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-2 text-green-700">
                      <UtensilsCrossed className="h-4 w-4" />
                      <span className="font-medium">Meal Calculation</span>
                    </div>
                    <p className="text-green-600 mt-1">
                      {form.details.foodType}{" "}
                      {form.details.mealType.toLowerCase()} = {form.impact} kg
                      CO₂
                    </p>
                  </motion.div>
                )}
              </TabsContent>

              {/* Shopping Tab */}
              <TabsContent value="shopping" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <div className="space-y-2">
                    <Label htmlFor="item-type">Item Type</Label>
                    <Select
                      value={form.details.itemType || ""}
                      onValueChange={(value) => updateDetail("itemType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">
                          📱 Electronics
                        </SelectItem>
                        <SelectItem value="Clothing">👕 Clothing</SelectItem>
                        <SelectItem value="Books">📚 Books</SelectItem>
                        <SelectItem value="Furniture">🛋️ Furniture</SelectItem>
                        <SelectItem value="Appliances">
                          🏠 Appliances
                        </SelectItem>
                        <SelectItem value="Toys">🧸 Toys</SelectItem>
                        <SelectItem value="Cosmetics">💄 Cosmetics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Number of items"
                      value={form.details.quantity || ""}
                      onChange={(e) =>
                        updateDetail("quantity", parseInt(e.target.value) || 1)
                      }
                      min="1"
                    />
                  </div>
                </motion.div>

                {form.details.itemType && form.details.quantity && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-50 p-4 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center gap-2 text-purple-700">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="font-medium">Purchase Calculation</span>
                    </div>
                    <p className="text-purple-600 mt-1">
                      {form.details.quantity} {form.details.itemType} item
                      {form.details.quantity > 1 ? "s" : ""} = {form.impact} kg
                      CO₂
                    </p>
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>

            {/* Date and Action Buttons */}
            <Separator className="my-6" />

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity-date">Date</Label>
                <Input
                  id="activity-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full md:w-48"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !form.description || form.impact <= 0 || state.isLoading
                  }
                  className="flex items-center gap-2"
                >
                  {state.isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Save className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Log Activity
                </Button>
              </div>
            </div>

            {/* Activity Summary */}
            {form.description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-muted rounded-lg"
              >
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Activity Summary
                </h4>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Description:</span>{" "}
                    {form.description}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impact:</span>
                    <span
                      className={`font-bold ml-1 ${getImpactColor(form.impact)}`}
                    >
                      {form.impact} {form.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {format(new Date(form.date), "PPP")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    {form.category}
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ActivityTracker;
