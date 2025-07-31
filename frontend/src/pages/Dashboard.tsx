import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Plus,
  Gift,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { authUtils } from "@/lib/auth";
import { localDbOperations } from "@/lib/local-db";
import { User, ConsumptionLog } from "@/types/api";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recentLogs, setRecentLogs] = useState<ConsumptionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalPoints: 0,
    thisWeekLogs: 0,
    streak: 0,
    rank: 0,
  });
  const [dailyProgress, setDailyProgress] = useState<number[]>(
    Array(7).fill(0),
  );
  const [firstLogin, setFirstLogin] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("onboardingCompleted")) {
      navigate("/onboarding", { replace: true });
    }
    if (localStorage.getItem("firstLogin")) {
      setFirstLogin(true);
      localStorage.removeItem("firstLogin");
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await authUtils.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);

        // Load user's consumption logs
        const logs = await localDbOperations.getUserConsumptionLogs(
          currentUser.id,
        );
        setRecentLogs(logs.slice(0, 3)); // Get latest 3 logs

        // Calculate dashboard stats from logs
        const thisWeek = getThisWeekLogs(logs);
        const daily = Array(7).fill(0);
        thisWeek.forEach((l) => {
          const d = new Date(l.createdAt).getDay();
          daily[d] += 1;
        });
        setDailyProgress(daily);
        setDashboardStats({
          totalPoints: currentUser.points || 0,
          thisWeekLogs: thisWeek.length,
          streak: calculateStreak(logs),
          rank: await calculateUserRank(currentUser.id),
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getThisWeekLogs = (logs: ConsumptionLog[]) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return logs.filter((log) => new Date(log.createdAt) >= oneWeekAgo);
  };

  const calculateStreak = (logs: ConsumptionLog[]) => {
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

  const calculateUserRank = async (userId: string) => {
    try {
      const leaderboard = await localDbOperations.getLeaderboard();
      const index = leaderboard.findIndex((u) => u.id === userId);
      return index >= 0 ? index + 1 : leaderboard.length + 1;
    } catch (error) {
      return 0;
    }
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

  return (
    <div className="min-h-screen gradient-secondary">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            {firstLogin ? "Welcome" : "Welcome back"}, {user?.firstName || "there"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to log another delicious Naija meal?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Points
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {dashboardStats.totalPoints.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    This Week
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardStats.thisWeekLogs} logs
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Streak
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardStats.streak} days
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Rank
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    #{dashboardStats.rank || "-"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/log" className="lg:col-span-2">
            <Card className="gradient-primary text-white hover-glow hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Log New Naija Meal
                    </h3>
                    <p className="opacity-90">
                      Capture your latest Nigerian food experience
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Plus className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/rewards">
            <Card className="glass-card hover-glow hover:-translate-y-1 cursor-pointer transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">
                    View Rewards
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check available Nigerian rewards and redeem points
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Weekly Progress */}
        <Card className="glass-card hover-glow mb-8">
          <CardHeader>
            <CardTitle className="text-gradient">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Daily Goal Progress</span>
                  <span>{dashboardStats.thisWeekLogs}/14 logs this week</span>
                </div>
                <Progress
                  value={(dashboardStats.thisWeekLogs / 14) * 100}
                  className="h-3"
                />
              </div>
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, index) => {
                    const dayIndex = (index + 1) % 7; // Monday=1 ... Sunday=0
                    const count = dailyProgress[dayIndex];
                    const active = count > 0;
                    return (
                      <div key={day} className="text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            active
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {active ? "✓" : ""}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {day}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your recent activity...
                </div>
              ) : recentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 opacity-50">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <p>No meals logged yet</p>
                  <p className="text-sm">
                    Start by logging your first Nigerian meal!
                  </p>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 glass-effect rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                        {log.mediaUrl ? (
                          <Camera className="h-5 w-5 text-white" />
                        ) : (
                          <Plus className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {log.product}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {log.location && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {log.location}
                            </span>
                          )}
                          {log.companions && (
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {log.companions}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        {log.category}
                      </Badge>
                      <p className="text-sm font-semibold text-primary">
                        +{log.points} points
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
