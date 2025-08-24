import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActivity } from "@/contexts/ActivityContext";
import {
  Leaf,
  Mail,
  Lock,
  User as UserIcon,
  Target,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, loginWithGoogle, state } = useActivity();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    monthlyTarget: "4.5",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearErrors = () => setErrors({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!loginForm.email || !loginForm.password) {
      setErrors({ form: "Please fill in all fields" });
      return;
    }

    try {
      await login({
        email: loginForm.email,
        password: loginForm.password,
      });

      onClose();
      setLoginForm({ email: "", password: "" });
    } catch (error: any) {
      setErrors({ form: error.message || "Login failed" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Validation
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setErrors({ form: "Please fill in all required fields" });
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    if (signupForm.password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }

    try {
      await register({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        monthlyTarget: parseFloat(signupForm.monthlyTarget),
      });

      onClose();
      setSignupForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        monthlyTarget: "4.5",
      });
    } catch (error: any) {
      setErrors({ form: error.message || "Registration failed" });
    }
  };

  const handleGoogleLogin = async () => {
    clearErrors();

    try {
      await loginWithGoogle();
      // Note: Google OAuth will redirect, so the modal close happens in callback
    } catch (error: any) {
      setErrors({ form: error.message || "Google login failed" });
    }
  };

  const handleDemoLogin = async () => {
    clearErrors();

    try {
      await login({
        email: "demo@carbonmeter.com",
        password: "demo123",
      });

      onClose();
    } catch (error: any) {
      // If demo user doesn't exist, create it
      try {
        await register({
          name: "Demo User",
          email: "demo@carbonmeter.com",
          password: "demo123",
          monthlyTarget: 4.5,
        });
        onClose();
      } catch (registerError: any) {
        setErrors({ form: "Demo login failed" });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Leaf className="h-6 w-6 text-carbon-600" />
            </motion.div>
            Welcome to CarbonMeter
          </DialogTitle>
          <DialogDescription className="text-center">
            Join thousands of users tracking their carbon footprint and building
            sustainable habits.
          </DialogDescription>
        </DialogHeader>

        {errors.form && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {errors.form}
          </div>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="login-email"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="your@email.com"
                  required
                  disabled={state.isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="login-password"
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="••••••••"
                  required
                  disabled={state.isLoading}
                />
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={state.isLoading}
                  className="w-full"
                >
                  {state.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={state.isLoading}
                    className="flex items-center gap-2"
                  >
                    {state.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDemoLogin}
                    disabled={state.isLoading}
                    className="w-full"
                  >
                    {state.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Demo"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="signup-name"
                  className="flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signupForm.name}
                  onChange={(e) =>
                    setSignupForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="John Doe"
                  required
                  disabled={state.isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="signup-email"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="your@email.com"
                  required
                  disabled={state.isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Password *
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    required
                    disabled={state.isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) =>
                      setSignupForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    required
                    disabled={state.isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="monthly-target"
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Monthly CO₂ Target (tons)
                </Label>
                <Input
                  id="monthly-target"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={signupForm.monthlyTarget}
                  onChange={(e) =>
                    setSignupForm((prev) => ({
                      ...prev,
                      monthlyTarget: e.target.value,
                    }))
                  }
                  placeholder="4.5"
                  disabled={state.isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Average person generates ~4.5 tons CO₂ per month
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={state.isLoading}
                  className="w-full"
                >
                  {state.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={state.isLoading}
                  className="w-full flex items-center gap-2"
                >
                  {state.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Continue with Google
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  );
}
