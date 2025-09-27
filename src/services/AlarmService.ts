import { Platform } from 'react-native';
import { Task } from '../types/Task';
import { NotificationService } from './NotificationService';

/**
 * AlarmService - Handles continuous alarm sounds like Android clock app
 * This creates actual alarm-style alerts that need manual dismissal
 */
export class AlarmService {
  private static activeAlarms: Map<string, NodeJS.Timeout> = new Map();
  
  /**
   * Schedule an alarm that will sound continuously for a task
   */
  static async scheduleAlarm(task: Task, offsetMinutes: number = 0): Promise<void> {
    if (!task.dueDateTime || !task.hasAlarm) {
      return;
    }

    const dueDate = new Date(task.dueDateTime);
    const now = new Date();
    const alarmTime = new Date(dueDate.getTime() - offsetMinutes * 60 * 1000);
    
    // Don't schedule alarms for past times
    if (alarmTime <= now) {
      return;
    }

    const alarmId = `${task.id}_alarm_${offsetMinutes}`;
    const delay = alarmTime.getTime() - now.getTime();
    
    // Schedule the alarm
    const timeoutId = setTimeout(() => {
      this.triggerAlarm(task, alarmId);
    }, delay);
    
    this.activeAlarms.set(alarmId, timeoutId);
  }

  /**
   * Trigger the actual alarm sound and notification
   */
  private static async triggerAlarm(task: Task, alarmId: string): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        // On Android we rely on OS-scheduled echo notifications for continuous sound
        // Just set auto-dismiss to clear timers and cancel pending notifications after 60s
        setTimeout(() => {
          this.dismissAlarm(alarmId);
        }, 60000);
      } else {
        // iOS: use immediate notification + JS-driven sound loop as best-effort
        await NotificationService.scheduleImmediateAlarm(task);
        this.startAlarmSound(alarmId);
        setTimeout(() => {
          this.dismissAlarm(alarmId);
        }, 60000);
      }
      
    } catch (error) {
      console.warn('Failed to trigger alarm:', error);
    }
  }

  /**
   * Start continuous alarm sound
   */
  private static startAlarmSound(alarmId: string): void {
    // For React Native, we'll use the notification system with repeated alerts
    // This creates a looping effect by scheduling multiple notifications
    let soundCount = 0;
    const maxSounds = 12; // 60 seconds worth at 5-second intervals
    
    const soundInterval = setInterval(() => {
      if (soundCount >= maxSounds || !this.activeAlarms.has(alarmId)) {
        clearInterval(soundInterval);
        return;
      }
      
      // Trigger immediate notification sound
      NotificationService.playAlarmSound();
      soundCount++;
    }, 5000); // Every 5 seconds
    
    // Store the interval so we can clear it
    this.activeAlarms.set(`${alarmId}_sound`, soundInterval as any);
  }

  /**
   * Dismiss an active alarm
   */
  static dismissAlarm(alarmId: string): void {
    // Clear the main alarm timeout
    const timeoutId = this.activeAlarms.get(alarmId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.activeAlarms.delete(alarmId);
    }
    
    // Clear the sound interval
    const soundInterval = this.activeAlarms.get(`${alarmId}_sound`);
    if (soundInterval) {
      clearInterval(soundInterval as NodeJS.Timeout);
      this.activeAlarms.delete(`${alarmId}_sound`);
    }

    // Also cancel any scheduled notifications/echoes for this task
    try {
      const taskId = alarmId.split('_alarm_')[0];
      void NotificationService.cancelTaskNotifications(taskId);
    } catch {}
  }

  /**
   * Cancel all alarms for a task
   */
  static cancelTaskAlarms(taskId: string): void {
    const alarmsToCancel: string[] = [];
    
    // Find all alarms for this task
    for (const [alarmId] of this.activeAlarms.entries()) {
      if (alarmId.startsWith(taskId)) {
        alarmsToCancel.push(alarmId);
      }
    }
    
    // Cancel each alarm
    alarmsToCancel.forEach(alarmId => {
      this.dismissAlarm(alarmId);
    });
  }

  /**
   * Update alarms for a task (cancel old ones and schedule new ones)
   */
  static async updateTaskAlarms(task: Task): Promise<void> {
    this.cancelTaskAlarms(task.id);
    
    if (task.hasAlarm && task.dueDateTime) {
      if (task.notificationOffsets && task.notificationOffsets.length > 0) {
        // Schedule alarm for each notification time
        for (const offset of task.notificationOffsets) {
          await this.scheduleAlarm(task, offset);
        }
      } else {
        // Schedule alarm at due time
        await this.scheduleAlarm(task, 0);
      }
    }
  }

  /**
   * Get count of active alarms (for debugging)
   */
  static getActiveAlarmCount(): number {
    return this.activeAlarms.size;
  }
}