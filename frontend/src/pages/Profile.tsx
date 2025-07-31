import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Camera,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { authUtils } from "@/lib/auth";
import { User as UserType } from "@/types/api";
import {
  NotificationService,
  NotificationPreferences,
} from "@/lib/notifications";
import { localDbOperations } from "@/lib/local-db";

const Profile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    enableNotifications: true,
    dailyReminders: true,
    weeklyReports: false,
    achievementAlerts: true,
    marketingEmails: false,
  });

  useEffect(() => {
    loadUserData();
    loadNotificationPreferences();
    loadUserStats();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await authUtils.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setFormData({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          phone: currentUser.phone || "",
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationPreferences = () => {
    const prefs = NotificationService.loadPreferences();
    setNotifications(prefs);
  };

  const loadUserStats = async () => {
    try {
      const currentUser = await authUtils.getCurrentUser();
      if (currentUser) {
        // Load user's consumption logs to calculate stats
        const logs = await localDbOperations.getUserConsumptionLogs(
          currentUser.id,
        );

        // Calculate streak
        const streak = calculateStreak(logs);

        // Update stats
        setUserStats([
          {
            label: "Total Points",
            value: (currentUser.points || 0).toLocaleString(),
            icon: Star,
            color: "text-primary",
          },
          {
            label: "Total Logs",
            value: logs.length.toString(),
            icon: TrendingUp,
            color: "text-blue-600",
          },
          {
            label: "Current Streak",
            value: `${streak} days`,
            icon: TrendingUp,
            color: "text-blue-600",
          },
          { label: "Rank", value: "#-", icon: Star, color: "text-purple-600" },
        ]);

        // Set recent activity from logs
        const recentLogs = logs.slice(0, 4).map((log) => ({
          action: `Logged ${log.product}`,
          time: formatTimeAgo(log.createdAt),
          points: `+${log.points}`,
        }));
        setRecentActivity(recentLogs);
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const calculateStreak = (logs: any[]) => {
    if (logs.length === 0) return 0;

    const sortedLogs = logs.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    let streak = 0;
    let currentDate = new Date();

    for (const log of sortedLogs) {
      const logDate = new Date(log.createdAt);
      const daysDiff = Math.floor(
        (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = logDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update user profile in database
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };

      // In a real app, you'd have an updateUser function in dbOperations
      // For now, we'll simulate the update
      setUser(updatedUser);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    const updatedPrefs = { ...notifications, [key]: value };
    setNotifications(updatedPrefs);
    NotificationService.savePreferences(updatedPrefs);

    toast({
      title: "Preferences updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const [userStats, setUserStats] = useState([
    { label: "Total Points", value: "0", icon: Star, color: "text-primary" },
    {
      label: "Total Logs",
      value: "0",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      label: "Current Streak",
      value: "0 days",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    { label: "Rank", value: "#-", icon: Star, color: "text-purple-600" },
  ]);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  return (
    <div className="min-h-screen gradient-secondary pb-20 lg:pb-0">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">
              My Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="glass-card hover-glow">
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src="/placeholder.svg"
                        alt="User profile photo"
                      />
                      <AvatarFallback className="gradient-primary text-white text-2xl">
                        AO
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white hover-glow">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-muted-foreground mb-4">{user?.email}</p>
                  <Badge className="gradient-primary text-white">
                    Active Naija Foodie
                  </Badge>
                </CardContent>
              </Card>

              {/* User Stats */}
              <Card className="glass-card hover-glow">
                <CardHeader>
                  <CardTitle className="text-gradient">Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userStats.map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 glass-effect rounded-lg flex items-center justify-center">
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          </div>
                          <span className="text-muted-foreground">
                            {stat.label}
                          </span>
                        </div>
                        <span className={`font-semibold ${stat.color}`}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Settings */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-gradient">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-800">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="glass-effect"
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
                        className="glass-effect"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-800">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="glass-effect pl-10 opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-800">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="glass-effect pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-gray-800">
                      Location in Nigeria
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value="Nigeria"
                        disabled
                        className="glass-effect pl-10 opacity-60"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="gradient-primary hover-glow text-white"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="glass-card hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-gradient">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        Enable Notifications
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Allow app to send notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.enableNotifications}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("enableNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        Daily Reminders
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Get daily meal logging reminders
                      </p>
                    </div>
                    <Switch
                      checked={notifications.dailyReminders}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("dailyReminders", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        Weekly Reports
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly consumption insights
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("weeklyReports", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        Achievement Alerts
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new achievements
                      </p>
                    </div>
                    <Switch
                      checked={notifications.achievementAlerts}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("achievementAlerts", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        Marketing Emails
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional content and updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("marketingEmails", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card hover-glow">
                <CardHeader>
                  <CardTitle className="text-gradient">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="w-16 h-16 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 opacity-50">
                          <Star className="h-8 w-8 text-white" />
                        </div>
                        <p>No recent activity</p>
                        <p className="text-sm">
                          Start logging meals to see your activity here!
                        </p>
                      </div>
                    ) : (
                      recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 glass-effect rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {activity.action}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.time}
                            </p>
                          </div>
                          <Badge
                            variant={
                              activity.points.startsWith("+")
                                ? "default"
                                : "secondary"
                            }
                          >
                            {activity.points} pts
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
