// Notification utilities for the app

export interface NotificationPreferences {
  enableNotifications: boolean;
  dailyReminders: boolean;
  weeklyReports: boolean;
  achievementAlerts: boolean;
  marketingEmails: boolean;
}

export class NotificationService {
  private static readonly STORAGE_KEY = 'notification_preferences';

  // Request notification permission
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Send local notification
  static async sendNotification(title: string, message: string, icon?: string): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.warn('Notification permission denied');
      return;
    }

    try {
      const notification = new Notification(title, {
        body: message,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'snacktrack-notification'
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Save notification preferences
  static savePreferences(preferences: NotificationPreferences): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
  }

  // Load notification preferences
  static loadPreferences(): NotificationPreferences {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }

    // Default preferences
    return {
      enableNotifications: true,
      dailyReminders: true,
      weeklyReports: false,
      achievementAlerts: true,
      marketingEmails: false
    };
  }

  // Schedule daily reminder
  static scheduleDailyReminder(): void {
    const preferences = this.loadPreferences();
    
    if (!preferences.enableNotifications || !preferences.dailyReminders) {
      return;
    }

    // Set reminder for 7 PM every day
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(19, 0, 0, 0); // 7:00 PM

    // If it's already past 7 PM today, schedule for tomorrow
    if (now > reminderTime) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      this.sendNotification(
        'Log Your Meals! 🍽️',
        'Don\'t forget to track your daily consumption to earn points!'
      );
      
      // Schedule the next reminder
      this.scheduleDailyReminder();
    }, timeUntilReminder);
  }

  // Send achievement notification
  static sendAchievementNotification(achievement: string, points: number): void {
    const preferences = this.loadPreferences();
    
    if (preferences.enableNotifications && preferences.achievementAlerts) {
      this.sendNotification(
        '🎉 Achievement Unlocked!',
        `${achievement} - You earned ${points} points!`
      );
    }
  }

  // Initialize notification service
  static initialize(): void {
    // Request permission on first load
    this.requestPermission();
    
    // Schedule daily reminders
    this.scheduleDailyReminder();
  }
}