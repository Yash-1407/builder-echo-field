import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Leaf,
  Menu,
  Sun,
  Moon,
  BarChart3,
  Plus,
  TrendingUp,
  Users,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Track Activity", href: "/activity", icon: Plus },
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
    { name: "Community", href: "/community", icon: Users },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const isActivePage = (href: string) => location.pathname === href;

  return (
    <div className={`min-h-screen bg-background ${isDark ? "dark" : ""}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
            >
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-bold text-foreground">
              CarbonMeter
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex mx-6 flex-1">
            <div className="flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActivePage(item.href)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 px-0"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? "moon" : "sun"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden h-9 w-9 px-0"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link
                    to="/"
                    className="flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Leaf className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">CarbonMeter</span>
                  </Link>
                  <nav className="flex flex-col space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent ${
                            isActivePage(item.href)
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
