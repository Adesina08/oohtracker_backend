import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gift,
  Star,
  Trophy,
  Crown,
  Zap,
  Smartphone,
  Coffee,
  ShoppingBag,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { authUtils } from "@/lib/auth";
import { localDbOperations } from "@/lib/local-db";
import { User, Reward, ConsumptionLog } from "@/types/api";

const Rewards = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<
    Array<{ id: string; name: string; points: number }>
  >([]);

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      const currentUser = await authUtils.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setUserPoints(currentUser.points || 0);

        const logs = await localDbOperations.getUserConsumptionLogs(
          currentUser.id,
        );
        setAchievements(calculateAchievements(logs, currentUser));
      }

      // Load available rewards from database
      const availableRewards = await localDbOperations.getRewards();
      setRewards(availableRewards);

      const board = await localDbOperations.getLeaderboard();
      setLeaderboard(board);
    } catch (error) {
      console.error("Error loading rewards data:", error);
      // Fallback to static rewards if API fails
      setRewards(staticRewardItems);
    } finally {
      setIsLoading(false);
    }
  };

  const redeemReward = async (
    cost: number,
    reward: string,
    rewardId?: string,
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (userPoints >= cost) {
      try {
        if (rewardId) {
          // reward redemption handled locally
        }

        const newPoints = userPoints - cost;
        setUserPoints(newPoints);

        // Update user points in the database
        await localDbOperations.updateUserPoints(user.id, -cost);

        toast({
          title: "Reward Redeemed! 🎉",
          description: `You have successfully redeemed ${reward}`,
        });
      } catch (error) {
        console.error("Error redeeming reward:", error);
        toast({
          title: "Redemption Failed",
          description:
            "Could not process your reward redemption. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Insufficient Points",
        description: `You need ${cost - userPoints} more points to redeem this reward.`,
        variant: "destructive",
      });
    }
  };

  // Static fallback rewards if API fails
  const staticRewardItems: (Reward & {
    cost?: number;
    icon?: any;
    popular?: boolean;
  })[] = [
    {
      id: "1",
      name: "₦500 MTN Airtime",
      description: "Mobile recharge for MTN network",
      pointsRequired: 500,
      cost: 500,
      icon: Smartphone,
      category: "airtime",
      popular: false,
      isActive: true,
    },
    {
      id: "2",
      name: "₦1000 Airtel Data",
      description: "1GB data bundle for Airtel",
      pointsRequired: 800,
      cost: 800,
      icon: Smartphone,
      category: "data",
      popular: true,
      isActive: true,
    },
    {
      id: "3",
      name: "₦2000 9mobile Airtime",
      description: "Mobile recharge for 9mobile network",
      pointsRequired: 1000,
      cost: 1000,
      icon: Smartphone,
      category: "airtime",
      popular: false,
      isActive: true,
    },
    {
      id: "4",
      name: "Jumia Voucher",
      description: "₦5000 Jumia shopping voucher",
      pointsRequired: 2000,
      cost: 2000,
      icon: ShoppingBag,
      category: "voucher",
      popular: true,
      isActive: true,
    },
    {
      id: "5",
      name: "Dominos Pizza",
      description: "Free medium pizza from Dominos Nigeria",
      pointsRequired: 1500,
      cost: 1500,
      icon: Gift,
      category: "food",
      popular: false,
      isActive: true,
    },
    {
      id: "6",
      name: "Netflix Naija",
      description: "1 month Netflix Nigeria subscription",
      pointsRequired: 1200,
      cost: 1200,
      icon: Zap,
      category: "entertainment",
      popular: true,
      isActive: true,
    },
    {
      id: "7",
      name: "Konga Voucher",
      description: "₦3000 Konga shopping voucher",
      pointsRequired: 1300,
      cost: 1300,
      icon: ShoppingBag,
      category: "voucher",
      popular: false,
      isActive: true,
    },
    {
      id: "8",
      name: "Glo Data Bundle",
      description: "2GB data bundle for Glo network",
      pointsRequired: 900,
      cost: 900,
      icon: Smartphone,
      category: "data",
      popular: true,
      isActive: true,
    },
  ];

  // Use database rewards if available, otherwise fallback to static
  const displayRewards = rewards.length > 0 ? rewards : staticRewardItems;

  const calculateAchievements = (
    logs: ConsumptionLog[],
    user: User,
  ): Achievement[] => {
    const videoCount = logs.filter((l) => l.mediaType === "video").length;
    const friendLogs = logs.filter(
      (l) => l.companions && l.companions.trim(),
    ).length;
    const uniqueLocations = new Set(logs.map((l) => l.location).filter(Boolean))
      .size;
    const streak = (() => {
      if (logs.length === 0) return 0;
      const sorted = logs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      let s = 0;
      let current = new Date();
      for (const log of sorted) {
        const d = new Date(log.createdAt);
        const diff = Math.floor(
          (current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diff <= s + 1) {
          s++;
          current = d;
        } else {
          break;
        }
      }
      return s;
    })();

    return [
      {
        id: 1,
        name: "First Taste",
        description: "Log your first Nigerian meal",
        icon: "🍲",
        unlocked: logs.length >= 1,
        progress: Math.min(100, logs.length > 0 ? 100 : 0),
      },
      {
        id: 2,
        name: "Media Guru",
        description: "Upload 10 videos of your meals",
        icon: "📹",
        unlocked: videoCount >= 10,
        progress: Math.min(100, (videoCount / 10) * 100),
      },
      {
        id: 3,
        name: "Naija Socialite",
        description: "Log 20 meals with friends",
        icon: "👥",
        unlocked: friendLogs >= 20,
        progress: Math.min(100, (friendLogs / 20) * 100),
      },
      {
        id: 4,
        name: "Daily Tracker",
        description: "Maintain a 30-day logging streak",
        icon: "🔥",
        unlocked: streak >= 30,
        progress: Math.min(100, (streak / 30) * 100),
      },
      {
        id: 5,
        name: "State Explorer",
        description: "Log meals in 5 different Nigerian states",
        icon: "🗺️",
        unlocked: uniqueLocations >= 5,
        progress: Math.min(100, (uniqueLocations / 5) * 100),
      },
      {
        id: 6,
        name: "Point Master",
        description: "Earn 5000 total points",
        icon: "💎",
        unlocked: (user.points || 0) >= 5000,
        progress: Math.min(100, ((user.points || 0) / 5000) * 100),
      },
    ];
  };

  interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
  }

  const [achievements, setAchievements] = useState<Achievement[]>([]);

  return (
    <div className="min-h-screen gradient-secondary pb-20 lg:pb-0">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Naija Rewards & Achievements
          </h1>
          <p className="text-muted-foreground">
            Redeem your points for Nigerian rewards and track your progress
          </p>
        </div>

        {/* Points Overview */}
        <Card className="gradient-hero text-white mb-8 hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Points</h2>
                <p className="text-3xl font-bold">
                  {userPoints.toLocaleString()}
                </p>
                <p className="opacity-90 mt-2">
                  Keep logging your Naija meals to earn more!
                </p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="redeem" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass-effect">
            <TabsTrigger value="redeem">Redeem Points</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="redeem">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading rewards...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayRewards.map((reward) => {
                  // Handle both database rewards and static rewards
                  const rewardCost =
                    reward.pointsRequired || (reward as any).cost || 0;
                  const rewardIcon = (reward as any).icon || Smartphone;
                  const isPopular = (reward as any).popular || false;

                  return (
                    <Card
                      key={reward.id}
                      className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover-glow"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                            {typeof rewardIcon === "function" ? (
                              React.createElement(rewardIcon, {
                                className: "h-6 w-6 text-white",
                              })
                            ) : (
                              <Gift className="h-6 w-6 text-white" />
                            )}
                          </div>
                          {isPopular && (
                            <Badge className="bg-green-600 text-white">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {reward.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-blue-600 font-bold">
                            <Star className="h-4 w-4 mr-1" />
                            {rewardCost} pts
                          </div>
                          <Button
                            onClick={() =>
                              redeemReward(rewardCost, reward.name, reward.id)
                            }
                            disabled={
                              userPoints < rewardCost || !reward.isActive
                            }
                            className={
                              userPoints >= rewardCost && reward.isActive
                                ? "gradient-primary hover-glow text-white"
                                : ""
                            }
                            size="sm"
                          >
                            {!reward.isActive
                              ? "Unavailable"
                              : userPoints >= rewardCost
                                ? "Redeem"
                                : "Need More"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Naija Points Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    const isUserEntry = user && entry.id === user.id;
                    const medal =
                      rank === 1
                        ? "👑"
                        : rank === 2
                          ? "🥈"
                          : rank === 3
                            ? "🥉"
                            : rank;
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          isUserEntry
                            ? "gradient-accent border-2 border-blue-300"
                            : "bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                              rank === 1
                                ? "bg-yellow-500 text-white"
                                : rank === 2
                                  ? "bg-gray-400 text-white"
                                  : rank === 3
                                    ? "bg-orange-500 text-white"
                                    : "bg-blue-200 text-blue-700"
                            }`}
                          >
                            {medal}
                          </div>
                          <div>
                            <p
                              className={`font-semibold ${isUserEntry ? "text-blue-700" : "text-gray-800"}`}
                            >
                              {entry.name}
                              {isUserEntry && " (You)"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Rank #{rank}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${isUserEntry ? "text-blue-600" : "text-gray-800"}`}
                          >
                            {entry.points.toLocaleString()} pts
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`glass-card hover-glow ${
                    achievement.unlocked ? "ring-2 ring-green-300" : "grayscale opacity-60"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-800">
                            {achievement.name}
                          </h3>
                          {achievement.unlocked && (
                            <Badge className="bg-green-500 text-white">
                              <Crown className="h-3 w-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {achievement.description}
                        </p>
                        {!achievement.unlocked && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="text-blue-600 font-medium">
                                {achievement.progress}%
                              </span>
                            </div>
                            <Progress
                              value={achievement.progress}
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Rewards;
