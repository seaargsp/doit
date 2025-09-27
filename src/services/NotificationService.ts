import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types/Task';

// Check if notifications are supported (fallback for Expo Go)
let isNotificationSupported = true;

// Configure notification behavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const isAlarm = notification.request.content.data?.isAlarm === true;
      
      return {
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        // Enhanced settings for alarm notifications
        ...(isAlarm && {
          priority: Notifications.AndroidNotificationPriority.MAX,
          autoDismiss: false,
        }),
      };
    },
  });

  // Set up notification channels for Android
  if (Platform.OS === 'android') {
    // Regular notification channel
    Notifications.setNotificationChannelAsync('default', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    // Alarm notification channel with maximum priority
    Notifications.setNotificationChannelAsync('alarm', {
      name: 'Task Alarms',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 1000, 500, 1000, 500, 1000],
      lightColor: '#FF0000',
      sound: 'default', // Uses system default alarm sound
      enableLights: true,
      enableVibrate: true,
      bypassDnd: true, // Bypass Do Not Disturb mode
      showBadge: true,
    });
  }
} catch (error) {
  // Notifications not supported
  isNotificationSupported = false;
}

export class NotificationService {
  /**
   * Initialize notification service - should be called at app startup
   * Only requests notification permissions, other permissions are requested on-demand
   */
  static async initialize(): Promise<void> {
    if (!isNotificationSupported) {
      return;
    }

    try {
      // Request only notification permissions at startup
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    } catch (error) {
      console.warn('Failed to initialize notifications:', error);
    }
  }

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    if (!isNotificationSupported) {
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      return false;
    }
  }

  /**
   * Schedule notifications for a task
   */
  static async scheduleTaskNotifications(task: Task): Promise<void> {
    if (!isNotificationSupported) {
      return;
    }

    // Handle alarm-only tasks (hasAlarm but no notification offsets)
    if (task.hasAlarm && task.dueDateTime && (!task.notificationOffsets || task.notificationOffsets.length === 0)) {
      await this.scheduleAlarmNotification(task, 0); // Alarm at due time
      return;
    }

    if (!task.dueDateTime || !task.notificationOffsets || task.notificationOffsets.length === 0) {
      return;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return;
      }

      const dueDate = new Date(task.dueDateTime);
      const now = new Date();

      for (const offsetMinutes of task.notificationOffsets) {
        const notificationTime = new Date(dueDate.getTime() - offsetMinutes * 60 * 1000);
        
        // Don't schedule notifications for past times
        if (notificationTime <= now) {
          continue;
        }

        // Calculate precise seconds for scheduling
        const secondsUntilNotification = Math.max(1, Math.floor((notificationTime.getTime() - now.getTime()) / 1000));
        
        // Schedule regular notification
        const identifier = `${task.id}_${offsetMinutes}`;
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: 'Task Reminder',
            body: `"${task.title}" is due in ${this.formatOffset(offsetMinutes)}`,
            data: { taskId: task.id, type: 'reminder' },
            // Use default channel on Android
            ...(Platform.OS === 'android' && {
              channelId: 'default',
            }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsUntilNotification,
            repeats: false,
          },
        });

        // Schedule alarm notification if hasAlarm is enabled\n        // Note: This creates the initial alarm trigger, AlarmService handles the continuous sound\n        if (task.hasAlarm) {\n          await this.scheduleAlarmNotification(task, offsetMinutes);\n        }
      }
    } catch (error) {
      // Silent error handling
      throw new Error('Notification could not be scheduled');
    }
  }

  /**
   * Schedule an alarm-style notification with enhanced sound and persistence
   */
  private static async scheduleAlarmNotification(task: Task, offsetMinutes: number): Promise<void> {
    if (!task.dueDateTime) return;

    const dueDate = new Date(task.dueDateTime);
    const now = new Date();
    const notificationTime = new Date(dueDate.getTime() - offsetMinutes * 60 * 1000);
    
    // Don't schedule alarms for past times
    if (notificationTime <= now) {
      return;
    }

    const alarmIdentifier = `${task.id}_alarm_${offsetMinutes}`;
    
    try {
      // Calculate precise seconds for alarm scheduling
      const secondsUntilAlarm = Math.max(1, Math.floor((notificationTime.getTime() - now.getTime()) / 1000));
      
      await Notifications.scheduleNotificationAsync({
        identifier: alarmIdentifier,
        content: {
          title: `${task.title}`,
          body: offsetMinutes === 0 
            ? `"${task.title}" is due now!` 
            : `"${task.title}" alarm - due in ${this.formatOffset(offsetMinutes)}`,
          data: { taskId: task.id, type: 'alarm', isAlarm: true },
          sound: true, // Force sound
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: false,
          // Use alarm channel on Android for enhanced sound
          ...(Platform.OS === 'android' && {
            channelId: 'alarm',
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilAlarm,
          repeats: false,
        },
      });
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Cancel all notifications for a task
   */
  static async cancelTaskNotifications(taskId: string): Promise<void> {
    if (!isNotificationSupported) {
      return;
    }

    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const taskNotifications = scheduledNotifications.filter(notification => 
        notification.identifier.startsWith(taskId)
      );

      for (const notification of taskNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Update notifications for a task (cancel old ones and schedule new ones)
   */
  static async updateTaskNotifications(task: Task): Promise<void> {
    if (!isNotificationSupported) {
      return;
    }
    
    await this.cancelTaskNotifications(task.id);
    await this.scheduleTaskNotifications(task);
  }

  /**
   * Cancel all notifications for completed task (optional)
   */
  static async handleTaskCompletion(taskId: string, cancelNotifications: boolean = true): Promise<void> {
    if (!isNotificationSupported) {
      return;
    }
    
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

  /**
   * Schedule an immediate alarm notification (for continuous alarm system)
   */
  static async scheduleImmediateAlarm(task: Task): Promise<void> {
    if (!isNotificationSupported) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `${task.id}_immediate_alarm`,
        content: {
          title: `${task.title}`,
          body: `"${task.title}" requires your attention!`,
          data: { taskId: task.id, type: 'alarm', isAlarm: true, immediate: true },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: true,
          ...(Platform.OS === 'android' && {
            channelId: 'alarm',
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          repeats: false,
        },
      });
    } catch (error) {
      console.warn('Failed to schedule immediate alarm:', error);
    }
  }

  /**
   * Play alarm sound immediately (used by continuous alarm system)
   */
  static async playAlarmSound(): Promise<void> {
    if (!isNotificationSupported) {
      return;
    }

    try {
      // Create a minimal notification just for the sound
      await Notifications.scheduleNotificationAsync({
        identifier: `alarm_sound_${Date.now()}`,
        content: {
          title: '🔊',
          body: '',
          data: { type: 'sound_only' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' && {
            channelId: 'alarm',
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          repeats: false,
        },
      });
    } catch (error) {
      // Silent error handling
    }
  }
}
