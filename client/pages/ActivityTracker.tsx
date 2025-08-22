import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useActivity } from "@/contexts/ActivityContext";
import RecentActivities from "@/components/RecentActivities";
import ActivityChart from "@/components/ActivityChart";
import {
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Plus,
  Calculator,
  Lightbulb,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

export default function ActivityTracker() {
  const { addActivity, getFootprintByCategory, state } = useActivity();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("transport");

  // Form states for each activity type
  const [transportForm, setTransportForm] = useState({
    vehicleType: "",
    distance: "",
    description: ""
  });

  const [energyForm, setEnergyForm] = useState({
    energySource: "",
    energyAmount: "",
    description: ""
  });

  const [foodForm, setFoodForm] = useState({
    mealType: "",
    foodType: "",
    description: ""
  });

  const [shoppingForm, setShoppingForm] = useState({
    itemType: "",
    quantity: "",
    description: ""
  });

  const calculateTransportImpact = (vehicleType: string, distance: number) => {
    const factors: { [key: string]: number } = {
      "Car": 0.4, "Bus": 0.1, "Train": 0.05, "Bike": 0, "Walking": 0, "Plane": 0.9, "Taxi": 0.5
    };
    return distance * (factors[vehicleType] || 0.4);
  };

  const calculateEnergyImpact = (energySource: string, amount: number) => {
    const factors: { [key: string]: number } = {
      "Grid Electricity": 0.5, "Natural Gas": 0.2, "Solar": 0, "Wind": 0, "Oil": 0.7, "Coal": 0.9
    };
    return amount * (factors[energySource] || 0.5);
  };

  const calculateFoodImpact = (foodType: string) => {
    const factors: { [key: string]: number } = {
      "Beef": 6.0, "Pork": 3.0, "Chicken": 1.5, "Fish": 1.2, "Vegetarian": 0.8, "Vegan": 0.4, "Mixed": 2.0
    };
    return factors[foodType] || 1.0;
  };

  const calculateShoppingImpact = (itemType: string, quantity: number) => {
    const factors: { [key: string]: number } = {
      "Clothing": 2.0, "Electronics": 5.0, "Books": 0.5, "Household": 1.5, "Food": 1.0, "Other": 1.0
    };
    return quantity * (factors[itemType] || 1.0);
  };

  const handleTransportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transportForm.vehicleType || !transportForm.distance) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      const distance = parseFloat(transportForm.distance);
      const impact = calculateTransportImpact(transportForm.vehicleType, distance);

      await addActivity({
        type: "transport",
        description: transportForm.description || `${distance} miles by ${transportForm.vehicleType}`,
        impact: Math.round(impact * 100) / 100,
        unit: "kg CO₂",
        date: new Date().toISOString(),
        category: transportForm.vehicleType,
        details: {
          vehicle_type: transportForm.vehicleType,
          distance: distance
        }
      });

      setTransportForm({ vehicleType: "", distance: "", description: "" });
    } catch (error) {
      console.error("Error adding transport activity:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to add activity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnergySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!energyForm.energySource || !energyForm.energyAmount) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      const amount = parseFloat(energyForm.energyAmount);
      const impact = calculateEnergyImpact(energyForm.energySource, amount);

      await addActivity({
        type: "energy",
        description: energyForm.description || `${amount} kWh from ${energyForm.energySource}`,
        impact: Math.round(impact * 100) / 100,
        unit: "kg CO₂",
        date: new Date().toISOString(),
        category: energyForm.energySource,
        details: {
          energy_source: energyForm.energySource,
          energy_amount: amount
        }
      });

      setEnergyForm({ energySource: "", energyAmount: "", description: "" });
    } catch (error) {
      console.error("Error adding energy activity:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to add activity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodForm.mealType || !foodForm.foodType) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      const impact = calculateFoodImpact(foodForm.foodType);

      await addActivity({
        type: "food",
        description: foodForm.description || `${foodForm.foodType} ${foodForm.mealType}`,
        impact: Math.round(impact * 100) / 100,
        unit: "kg CO₂",
        date: new Date().toISOString(),
        category: foodForm.foodType,
        details: {
          meal_type: foodForm.mealType,
          food_type: foodForm.foodType
        }
      });

      setFoodForm({ mealType: "", foodType: "", description: "" });
    } catch (error) {
      console.error("Error adding food activity:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to add activity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShoppingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shoppingForm.itemType || !shoppingForm.quantity) return;

    setIsLoading(true);
    try {
      const quantity = parseInt(shoppingForm.quantity);
      const impact = calculateShoppingImpact(shoppingForm.itemType, quantity);

      addActivity({
        type: "shopping",
        description: shoppingForm.description || `${quantity} ${shoppingForm.itemType} item${quantity > 1 ? 's' : ''}`,
        impact: Math.round(impact * 100) / 100,
        unit: "kg CO₂",
        date: new Date().toISOString(),
        category: shoppingForm.itemType,
        details: {
          itemType: shoppingForm.itemType,
          quantity: quantity
        }
      });

      setShoppingForm({ itemType: "", quantity: "", description: "" });
    } catch (error) {
      console.error("Error adding shopping activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const categoryData = getFootprintByCategory();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Activity Tracker</h1>
          <p className="text-muted-foreground mt-2">Log your daily activities and track their environmental impact</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{state.activities.length}</p>
                <p className="text-sm text-muted-foreground">Total Activities</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="text-center">
              <CardContent className="pt-6">
                <Calculator className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">{categoryData.reduce((sum, cat) => sum + cat.value, 0).toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Total CO₂ (kg)</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="text-center">
              <CardContent className="pt-6">
                <Lightbulb className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold">{state.activities.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}</p>
                <p className="text-sm text-muted-foreground">Today's Logs</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="text-center">
              <CardContent className="pt-6">
                <Plus className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-bold">{Math.max(0, 7 - state.activities.filter(a => {
                  const activityDate = new Date(a.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return activityDate >= weekAgo;
                }).length)}</p>
                <p className="text-sm text-muted-foreground">Weekly Goal</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Activity Forms */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Log New Activity
                  </CardTitle>
                  <CardDescription>
                    Select an activity type and fill in the details to track your carbon footprint
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="transport" className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Transport
                      </TabsTrigger>
                      <TabsTrigger value="energy" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Energy
                      </TabsTrigger>
                      <TabsTrigger value="food" className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        Food
                      </TabsTrigger>
                      <TabsTrigger value="shopping" className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Shopping
                      </TabsTrigger>
                    </TabsList>

                    {/* Transportation Form */}
                    <TabsContent value="transport" className="space-y-4">
                      <form onSubmit={handleTransportSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="vehicle-type">Vehicle Type</Label>
                            <Select value={transportForm.vehicleType} onValueChange={(value) => setTransportForm(prev => ({ ...prev, vehicleType: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Car">Car</SelectItem>
                                <SelectItem value="Bus">Bus</SelectItem>
                                <SelectItem value="Train">Train</SelectItem>
                                <SelectItem value="Bike">Bike</SelectItem>
                                <SelectItem value="Walking">Walking</SelectItem>
                                <SelectItem value="Plane">Plane</SelectItem>
                                <SelectItem value="Taxi">Taxi</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="distance">Distance (miles)</Label>
                            <Input
                              id="distance"
                              type="number"
                              value={transportForm.distance}
                              onChange={(e) => setTransportForm(prev => ({ ...prev, distance: e.target.value }))}
                              placeholder="0.0"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transport-description">Description (Optional)</Label>
                          <Textarea
                            id="transport-description"
                            value={transportForm.description}
                            onChange={(e) => setTransportForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Add details about your trip..."
                          />
                        </div>
                        {transportForm.vehicleType && transportForm.distance && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Estimated Impact:</p>
                            <p className="text-lg font-semibold text-foreground">
                              {calculateTransportImpact(transportForm.vehicleType, parseFloat(transportForm.distance) || 0).toFixed(2)} kg CO₂
                            </p>
                          </div>
                        )}
                        {submitError && (
                          <ErrorDisplay
                            error={submitError}
                            variant="minimal"
                            onRetry={() => setSubmitError(null)}
                          />
                        )}
                        <Button type="submit" disabled={isLoading || !transportForm.vehicleType || !transportForm.distance} className="w-full">
                          {isLoading && <Loading size="sm" className="mr-2" />}
                          {isLoading ? "Adding..." : "Add Transport Activity"}
                        </Button>
                      </form>
                    </TabsContent>

                    {/* Energy Form */}
                    <TabsContent value="energy" className="space-y-4">
                      <form onSubmit={handleEnergySubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="energy-source">Energy Source</Label>
                            <Select value={energyForm.energySource} onValueChange={(value) => setEnergyForm(prev => ({ ...prev, energySource: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Grid Electricity">Grid Electricity</SelectItem>
                                <SelectItem value="Natural Gas">Natural Gas</SelectItem>
                                <SelectItem value="Solar">Solar</SelectItem>
                                <SelectItem value="Wind">Wind</SelectItem>
                                <SelectItem value="Oil">Oil</SelectItem>
                                <SelectItem value="Coal">Coal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="energy-amount">Amount (kWh)</Label>
                            <Input
                              id="energy-amount"
                              type="number"
                              value={energyForm.energyAmount}
                              onChange={(e) => setEnergyForm(prev => ({ ...prev, energyAmount: e.target.value }))}
                              placeholder="0.0"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="energy-description">Description (Optional)</Label>
                          <Textarea
                            id="energy-description"
                            value={energyForm.description}
                            onChange={(e) => setEnergyForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Add details about energy usage..."
                          />
                        </div>
                        {energyForm.energySource && energyForm.energyAmount && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Estimated Impact:</p>
                            <p className="text-lg font-semibold text-foreground">
                              {calculateEnergyImpact(energyForm.energySource, parseFloat(energyForm.energyAmount) || 0).toFixed(2)} kg CO₂
                            </p>
                          </div>
                        )}
                        <Button type="submit" disabled={isLoading || !energyForm.energySource || !energyForm.energyAmount} className="w-full">
                          {isLoading ? "Adding..." : "Add Energy Activity"}
                        </Button>
                      </form>
                    </TabsContent>

                    {/* Food Form */}
                    <TabsContent value="food" className="space-y-4">
                      <form onSubmit={handleFoodSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="meal-type">Meal Type</Label>
                            <Select value={foodForm.mealType} onValueChange={(value) => setFoodForm(prev => ({ ...prev, mealType: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select meal" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Breakfast">Breakfast</SelectItem>
                                <SelectItem value="Lunch">Lunch</SelectItem>
                                <SelectItem value="Dinner">Dinner</SelectItem>
                                <SelectItem value="Snack">Snack</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="food-type">Primary Food</Label>
                            <Select value={foodForm.foodType} onValueChange={(value) => setFoodForm(prev => ({ ...prev, foodType: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select food type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beef">Beef</SelectItem>
                                <SelectItem value="Pork">Pork</SelectItem>
                                <SelectItem value="Chicken">Chicken</SelectItem>
                                <SelectItem value="Fish">Fish</SelectItem>
                                <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                                <SelectItem value="Vegan">Vegan</SelectItem>
                                <SelectItem value="Mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="food-description">Description (Optional)</Label>
                          <Textarea
                            id="food-description"
                            value={foodForm.description}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Add details about your meal..."
                          />
                        </div>
                        {foodForm.foodType && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Estimated Impact:</p>
                            <p className="text-lg font-semibold text-foreground">
                              {calculateFoodImpact(foodForm.foodType).toFixed(2)} kg CO₂
                            </p>
                          </div>
                        )}
                        <Button type="submit" disabled={isLoading || !foodForm.mealType || !foodForm.foodType} className="w-full">
                          {isLoading ? "Adding..." : "Add Food Activity"}
                        </Button>
                      </form>
                    </TabsContent>

                    {/* Shopping Form */}
                    <TabsContent value="shopping" className="space-y-4">
                      <form onSubmit={handleShoppingSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="item-type">Item Category</Label>
                            <Select value={shoppingForm.itemType} onValueChange={(value) => setShoppingForm(prev => ({ ...prev, itemType: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Clothing">Clothing</SelectItem>
                                <SelectItem value="Electronics">Electronics</SelectItem>
                                <SelectItem value="Books">Books</SelectItem>
                                <SelectItem value="Household">Household</SelectItem>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={shoppingForm.quantity}
                              onChange={(e) => setShoppingForm(prev => ({ ...prev, quantity: e.target.value }))}
                              placeholder="1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shopping-description">Description (Optional)</Label>
                          <Textarea
                            id="shopping-description"
                            value={shoppingForm.description}
                            onChange={(e) => setShoppingForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Add details about your purchase..."
                          />
                        </div>
                        {shoppingForm.itemType && shoppingForm.quantity && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Estimated Impact:</p>
                            <p className="text-lg font-semibold text-foreground">
                              {calculateShoppingImpact(shoppingForm.itemType, parseInt(shoppingForm.quantity) || 0).toFixed(2)} kg CO₂
                            </p>
                          </div>
                        )}
                        <Button type="submit" disabled={isLoading || !shoppingForm.itemType || !shoppingForm.quantity} className="w-full">
                          {isLoading ? "Adding..." : "Add Shopping Activity"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Month Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {categoryData.length > 0 && (
                <ActivityChart
                  title="This Month's Breakdown"
                  description="Your carbon footprint by category"
                  data={categoryData}
                  type="pie"
                  height={250}
                />
              )}
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Eco Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">🚲 Try cycling or walking for short trips</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">💡 Switch to LED bulbs to save energy</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">🥬 Try plant-based meals twice a week</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <RecentActivities />
        </motion.div>
      </div>
    </div>
  );
}
