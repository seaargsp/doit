import * as Notifications from 'expo-notifications';
import { Task } from '../types/Task';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule notifications for a task
   */
  static async scheduleTaskNotifications(task: Task): Promise<void> {
    if (!task.dueDateTime || !task.notificationOffsets || task.notificationOffsets.length === 0) {
      return;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      const dueDate = new Date(task.dueDateTime);
      const now = new Date();

      for (const offsetMinutes of task.notificationOffsets) {
        const notificationTime = new Date(dueDate.getTime() - offsetMinutes * 60 * 1000);
        
        // Don't schedule notifications for past times
        if (notificationTime <= now) {
          continue;
        }

        const identifier = `${task.id}_${offsetMinutes}`;
        
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: 'Task Reminder',
            body: `"${task.title}" is due in ${this.formatOffset(offsetMinutes)}`,
            data: { taskId: task.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: Math.floor((notificationTime.getTime() - now.getTime()) / 1000),
            repeats: false,
          },
        });
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      throw new Error('Notification could not be scheduled');
    }
  }

  /**
   * Cancel all notifications for a task
   */
  static async cancelTaskNotifications(taskId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const taskNotifications = scheduledNotifications.filter(notification => 
        notification.identifier.startsWith(taskId)
      );

      for (const notification of taskNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  /**
   * Update notifications for a task (cancel old ones and schedule new ones)
   */
  static async updateTaskNotifications(task: Task): Promise<void> {
    await this.cancelTaskNotifications(task.id);
    await this.scheduleTaskNotifications(task);
  }

  /**
   * Cancel all notifications for completed task (optional)
   */
  static async handleTaskCompletion(taskId: string, cancelNotifications: boolean = true): Promise<void> {
    if (cancelNotifications) {
      await this.cancelTaskNotifications(taskId);
    }
  }

  /**
   * Format notification offset for display
   */
  private static formatOffset(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Get all scheduled notifications for debugging
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}
