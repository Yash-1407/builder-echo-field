import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthModal from "@/components/AuthModal";
import { useActivity } from "@/contexts/ActivityContext";
import {
  Leaf,
  TrendingDown,
  Users,
  Award,
  BarChart3,
  Target,
  Globe,
  Zap,
  ChevronRight,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";

export default function Index() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { state, logout } = useActivity();

  const features = [
    {
      icon: BarChart3,
      title: "Smart Tracking",
      description: "AI-powered carbon footprint monitoring across all your daily activities"
    },
    {
      icon: TrendingDown,
      title: "Reduction Analytics", 
      description: "Detailed insights and personalized recommendations to minimize your impact"
    },
    {
      icon: Users,
      title: "Community Challenges",
      description: "Join eco-challenges and compete with friends for a sustainable future"
    },
    {
      icon: Award,
      title: "Gamification",
      description: "Earn badges, unlock achievements, and climb the sustainability leaderboard"
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set and track personal carbon reduction targets with expert guidance"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "See how your actions contribute to worldwide sustainability efforts"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Environmental Advocate",
      avatar: "/placeholder.svg",
      content: "CarbonMeter transformed how I think about daily choices. I've reduced my footprint by 40% in just 3 months!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Sustainability Manager",
      avatar: "/placeholder.svg", 
      content: "The analytics are incredible. Finally, a tool that makes carbon tracking simple and engaging for our entire team.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Eco Enthusiast",
      avatar: "/placeholder.svg",
      content: "Love the community features! Competing in eco-challenges with friends makes sustainability fun and social.",
      rating: 5
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "2.5M", label: "CO₂ Tons Saved" },
    { number: "180+", label: "Countries" },
    { number: "4.9/5", label: "User Rating" }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Track Activities",
      description: "Log your daily activities like commuting, energy use, and consumption"
    },
    {
      step: 2,
      title: "Get Insights",
      description: "Receive AI-powered analysis and personalized sustainability recommendations"
    },
    {
      step: 3,
      title: "Take Action",
      description: "Implement changes, join challenges, and watch your carbon footprint shrink"
    },
    {
      step: 4,
      title: "Share Impact",
      description: "Celebrate achievements with the community and inspire others to join"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-carbon-600"
            >
              <Leaf className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-carbon-800">CarbonMeter</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-carbon-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-carbon-600 transition-colors">
              How it Works
            </a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-carbon-600 transition-colors">
              Testimonials
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {state.isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden md:inline">
                  Welcome, {state.user?.name}!
                </span>
                <Button asChild size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsAuthModalOpen(true)}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => setIsAuthModalOpen(true)}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4">
                <Zap className="h-3 w-3 mr-1" />
                Track. Reduce. Sustain.
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-carbon-900 mb-6 leading-tight">
                Your Personal
                <span className="block text-carbon-600">Carbon Footprint</span>
                Tracker
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join millions taking control of their environmental impact. Track daily activities, 
                get AI-powered insights, and build sustainable habits that matter.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {state.isAuthenticated ? (
                  <Button size="lg" asChild className="bg-carbon-600 hover:bg-carbon-700">
                    <Link to="/dashboard" className="flex items-center">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="bg-carbon-600 hover:bg-carbon-700" onClick={() => setIsAuthModalOpen(true)}>
                    Start Tracking Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={() => setIsVideoPlaying(true)}>
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-carbon-600 mr-1" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-carbon-600 mr-1" />
                  Free forever plan
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-carbon-800">Your Impact This Month</h3>
                  <Badge className="bg-carbon-100 text-carbon-800">-32% vs last month</Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transportation</span>
                    <span className="text-sm font-medium">2.1 tons CO₂</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-carbon-600 h-2 rounded-full w-3/4"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Energy</span>
                    <span className="text-sm font-medium">1.8 tons CO₂</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-eco-500 h-2 rounded-full w-2/3"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Food</span>
                    <span className="text-sm font-medium">1.2 tons CO₂</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-eco-400 h-2 rounded-full w-1/2"></div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-carbon-50 rounded-lg">
                  <p className="text-sm text-carbon-700">
                    <span className="font-semibold">Great progress!</span> You're on track to reach your goal of 4.5 tons this month.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-carbon-800 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-carbon-50 to-eco-50">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-carbon-900 mb-4">
              Everything You Need to Go Carbon Neutral
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools and insights to help you understand, reduce, and offset your environmental impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-carbon-100 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-carbon-600" />
                      </div>
                      <CardTitle className="text-carbon-800">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-carbon-900 mb-4">
              How CarbonMeter Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to start your sustainability journey today.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-carbon-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-carbon-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < howItWorks.length - 1 && (
                  <ChevronRight className="h-6 w-6 text-gray-400 mx-auto mt-4 hidden lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-eco-50 to-carbon-50">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-carbon-900 mb-4">
              Loved by Sustainability Champions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of users who are making a real difference for our planet.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-carbon-800">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-carbon-600">
        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-carbon-100 mb-8 max-w-2xl mx-auto">
              Start tracking your carbon footprint today and join the movement towards a sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {state.isAuthenticated ? (
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/dashboard" className="flex items-center">
                    View Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={() => setIsAuthModalOpen(true)}>
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-carbon-600">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-carbon-600" />
                <span className="text-lg font-bold text-carbon-800">CarbonMeter</span>
              </Link>
              <p className="text-gray-600 text-sm">
                Empowering individuals and communities to build a sustainable future through actionable carbon tracking.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-carbon-800 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/dashboard" className="hover:text-carbon-600">Dashboard</Link></li>
                <li><Link to="/activity" className="hover:text-carbon-600">Activity Tracker</Link></li>
                <li><Link to="/analytics" className="hover:text-carbon-600">Analytics</Link></li>
                <li><Link to="/community" className="hover:text-carbon-600">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-carbon-800 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-carbon-600">About</a></li>
                <li><a href="#" className="hover:text-carbon-600">Blog</a></li>
                <li><a href="#" className="hover:text-carbon-600">Careers</a></li>
                <li><a href="#" className="hover:text-carbon-600">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-carbon-800 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-carbon-600">Privacy</a></li>
                <li><a href="#" className="hover:text-carbon-600">Terms</a></li>
                <li><a href="#" className="hover:text-carbon-600">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 CarbonMeter. All rights reserved. Built for a sustainable future.</p>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
