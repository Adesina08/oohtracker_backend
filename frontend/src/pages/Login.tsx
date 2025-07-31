import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { localDbOperations } from "@/lib/local-db";
import { authUtils } from "@/lib/auth";
import { NotificationService } from "@/lib/notifications";
import NotificationPrompt from "@/components/NotificationPrompt";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [nextPath, setNextPath] = useState<string>("/dashboard");

  const handleEnableNotifications = async () => {
    await NotificationService.requestPermission();
    NotificationService.savePreferences(NotificationService.loadPreferences());
    setShowNotificationPrompt(false);
    navigate(nextPath);
  };

  const handleClosePrompt = () => {
    setShowNotificationPrompt(false);
    navigate(nextPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      setIsLoading(true);

      const user = await localDbOperations.getUserByEmail(formData.email);
      if (
        user &&
        (await authUtils.verifyPassword(formData.password, user.passwordHash))
      ) {
        // Generate JWT token
        const token = await authUtils.generateToken(user);
        authUtils.setAuthToken(token);

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in to SnackTrack.",
        });

        const path = authUtils.isAdminUser(user) ? "/admin" : "/dashboard";

        const hasPrefs = localStorage.getItem("notification_preferences");
        if (!hasPrefs) {
          setNextPath(path);
          setShowNotificationPrompt(true);
        } else {
          navigate(path);
        }
      } else {
        toast({
          title: "Invalid credentials",
          description: "Email or password is incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen gradient-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link
              to="/"
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors hover-glow"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card className="glass-card hover-glow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 gradient-primary rounded-full mx-auto mb-4 shadow-lg"></div>
              <CardTitle className="text-2xl font-bold text-gradient">
                Welcome Back
              </CardTitle>
              <p className="text-muted-foreground">
                Sign in to your SnackTrack account
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-800">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="border-blue-200 focus:border-blue-400 glass-effect"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-800">
                    Password
                  </Label>
                  <PasswordInput
                    id="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="border-blue-200 focus:border-blue-400 glass-effect"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          rememberMe: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-800">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary hover-glow text-white shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-600">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50 glass-effect text-gray-700"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <NotificationPrompt
        open={showNotificationPrompt}
        onEnable={handleEnableNotifications}
        onClose={handleClosePrompt}
      />
    </>
  );
};

export default Login;
