
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, Award, Database, Download, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import { localDbOperations } from "@/lib/local-db";
import ActivityCalendar from 'react-activity-calendar';
import { ConsumptionLog } from "@/types/api";

interface AdminStats {
  totalUsers: number;
  totalLogs: number;
  totalPoints: number;
  recentActivity: ConsumptionLog[];
}

interface ActivityData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalLogs: 0,
    totalPoints: 0,
    recentActivity: []
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Load consumption logs for analytics
      const logs = await localDbOperations.getAllConsumptionLogs();
      const analytics = await localDbOperations.getConsumptionAnalytics();
      
      // Calculate stats
      const totalLogs = logs.length;
      const totalPoints = logs.reduce((sum: number, log: ConsumptionLog) => sum + (log.points || 0), 0);
      const uniqueUsers = new Set(logs.map((log: ConsumptionLog) => log.userId)).size;
      
      setStats({
        totalUsers: uniqueUsers,
        totalLogs,
        totalPoints,
        recentActivity: logs.slice(0, 10)
      });

      // Generate activity heatmap data (last 365 days)
      const heatmapData = generateActivityHeatmap(analytics);
      setActivityData(heatmapData);
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      // Set fallback activity data to prevent empty array error
      setActivityData(generateFallbackActivityData());
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackActivityData = (): ActivityData[] => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 365);
    
    const data: ActivityData[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      data.push({
        date: dateStr,
        count: 0,
        level: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  const generateActivityHeatmap = (analytics: ConsumptionLog[]): ActivityData[] => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 365);
    
    const activityMap = new Map<string, number>();
    
    // Count activities per day
    analytics.forEach(log => {
      const date = new Date(log.createdAt).toISOString().split('T')[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });
    
    // Generate data for each day
    const data: ActivityData[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = activityMap.get(dateStr) || 0;
      
      // Convert count to level (0-4)
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count > 0) level = 1;
      if (count > 2) level = 2;
      if (count > 5) level = 3;
      if (count > 10) level = 4;
      
      data.push({
        date: dateStr,
        count,
        level
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  const exportData = async () => {
    try {
      const logs = await localDbOperations.getAllConsumptionLogs();
      const csvContent = [
        'Date,User,Product,Brand,Category,Spend,Method,Points',
        ...logs.map(log => [
          new Date(log.createdAt).toLocaleDateString(),
          `${log.users?.firstName} ${log.users?.lastName}`,
          log.product,
          log.brand || '',
          log.category,
          log.spend || 0,
          log.captureMethod,
          log.points
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consumption-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-secondary">
        <Navigation />
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-secondary pb-20 lg:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor app activity and user engagement</p>
            </div>
            <Button onClick={exportData} className="gradient-primary hover-glow text-white">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-gradient">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
                  <p className="text-2xl font-bold text-gradient">{stats.totalLogs}</p>
                </div>
                <Database className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold text-gradient">{stats.totalPoints}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg/User</p>
                  <p className="text-2xl font-bold text-gradient">
                    {stats.totalUsers > 0 ? Math.round(stats.totalLogs / stats.totalUsers) : 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Heatmap */}
        <Card className="glass-card hover-glow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Activity Heatmap (Last 365 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityData.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <ActivityCalendar
                    data={activityData}
                    theme={{
                      light: ['#f0f9ff', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8']
                    }}
                    fontSize={12}
                    blockSize={12}
                    blockMargin={2}
                    showWeekdayLabels
                    renderBlock={(block, activity) => {
                      const colors = ['#f0f9ff', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'];
                      return (
                        <div
                          title={`${activity.date}: ${activity.count} logs`}
                          style={{
                            backgroundColor: colors[activity.level],
                            borderRadius: '2px',
                            width: '12px',
                            height: '12px'
                          }}
                        />
                      );
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <span>Less</span>
                  <div className="flex items-center space-x-1">
                    {[0, 1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className="w-3 h-3 rounded-sm"
                        style={{
                          backgroundColor: ['#f0f9ff', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'][level]
                        }}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>No activity data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card hover-glow">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-4 glass-effect rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{log.users?.firstName} {log.users?.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          Logged {log.product} • {log.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={log.captureMethod === 'ai' ? 'default' : 'secondary'}>
                        {log.captureMethod}
                      </Badge>
                      <span className="text-sm font-medium text-green-600">+{log.points} pts</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
