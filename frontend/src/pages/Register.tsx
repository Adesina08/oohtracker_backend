import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { localDbOperations } from "@/lib/local-db";
import { authUtils } from "@/lib/auth";
import { NotificationService } from "@/lib/notifications";
import NotificationPrompt from "@/components/NotificationPrompt";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    agreeToMarketing: false,
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

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("registerForm");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("registerForm", JSON.stringify(formData));
  }, [formData]);

  // Clear saved form when visiting homepage
  useEffect(() => {
    if (location.pathname === "/") {
      localStorage.removeItem("registerForm");
    }
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const passwordHash = await authUtils.hashPassword(formData.password);
      const user = await localDbOperations.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        passwordHash,
      });

      if (user) {
        const token = await authUtils.generateToken(user);
        authUtils.setAuthToken(token);

        // Mark first login so the dashboard can greet the user properly
        localStorage.setItem("firstLogin", "true");

        localStorage.removeItem("registerForm"); // Clear saved form on success

        toast({
          title: "Account created successfully!",
          description:
            "Welcome to SnackTrack. You can now start logging your consumption.",
        });

        // TODO: create-onboarding-component-with-local-storage

        const finished = localStorage.getItem("onboardingCompleted");
        const path = finished ? "/dashboard" : "/onboarding";
        const hasPrefs = localStorage.getItem("notification_preferences");
        if (finished && !hasPrefs) {
          setNextPath(path);
          setShowNotificationPrompt(true);
        } else {
          navigate(path);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An error occurred during registration. Please try again.",
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
                Create Your Account
              </CardTitle>
              <p className="text-muted-foreground">
                Join the SnackTrack community
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-800">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                      className="border-blue-200 focus:border-blue-400 glass-effect"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-800">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                      className="border-blue-200 focus:border-blue-400 glass-effect"
                    />
                  </div>
                </div>

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
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-800">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    className="border-blue-200 focus:border-blue-400 glass-effect"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-800">
                    Password
                  </Label>
                  <div className="relative">
                    <PasswordInput
                      id="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="border-blue-200 focus:border-blue-400 glass-effect"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-800">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <PasswordInput
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className="border-blue-200 focus:border-blue-400 glass-effect"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          agreeToTerms: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-800">
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Terms and Conditions
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={formData.agreeToMarketing}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          agreeToMarketing: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="marketing" className="text-sm text-gray-800">
                      I want to receive marketing communications
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary hover-glow text-white shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Sign in here
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

export default Register;
