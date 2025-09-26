import { Task } from '../types/Task';

export class TaskUtils {
  /**
   * Check if a task is completed
   */
  static isCompleted(task: Task): boolean {
    return !!task.completedAt;
  }

  /**
   * Check if a completed task was completed within the last 24 hours
   */
  static isRecentlyCompleted(task: Task): boolean {
    if (!task.completedAt) return false;
    
    const completedAt = new Date(task.completedAt);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return completedAt > twentyFourHoursAgo;
  }

  /**
   * Check if a task should be visible in the To-Do tab
   * (active tasks + recently completed tasks within 24 hours)
   */
  static shouldShowInTodoTab(task: Task): boolean {
    return !this.isCompleted(task) || this.isRecentlyCompleted(task);
  }

  /**
   * Check if a task should be visible in the Completed tab
   * (all completed tasks)
   */
  static shouldShowInCompletedTab(task: Task): boolean {
    return this.isCompleted(task);
  }

  /**
   * Sort tasks for the To-Do tab:
   * 1. Upcoming tasks (due within 24 hours, earliest first)
   * 2. Other incomplete tasks with due dates (earliest first)
   * 3. Incomplete tasks without due dates (oldest created first)
   * 4. Recently completed tasks (most recently completed first)
   */
  static sortForTodoTab(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      const aCompleted = this.isCompleted(a);
      const bCompleted = this.isCompleted(b);

      // Completed tasks go to the bottom
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;

      // Both completed - sort by completion date (most recent first)
      if (aCompleted && bCompleted) {
        const aCompletedAt = new Date(a.completedAt!).getTime();
        const bCompletedAt = new Date(b.completedAt!).getTime();
        return bCompletedAt - aCompletedAt;
      }

      // Both incomplete - prioritize upcoming tasks
      const aUpcoming = this.isUpcoming(a);
      const bUpcoming = this.isUpcoming(b);

      // Upcoming tasks come first
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;

      // Both upcoming - sort by due date (earliest first)
      if (aUpcoming && bUpcoming) {
        const aDueDate = new Date(a.dueDateTime!).getTime();
        const bDueDate = new Date(b.dueDateTime!).getTime();
        return aDueDate - bDueDate;
      }

      // Neither upcoming - continue with original logic
      const aDueDate = a.dueDateTime ? new Date(a.dueDateTime).getTime() : null;
      const bDueDate = b.dueDateTime ? new Date(b.dueDateTime).getTime() : null;

      // Tasks with due dates come first
      if (aDueDate && !bDueDate) return -1;
      if (!aDueDate && bDueDate) return 1;

      // Both have due dates - sort by due date (earliest first)
      if (aDueDate && bDueDate) {
        return aDueDate - bDueDate;
      }

      // Neither has due date - sort by creation date (oldest first)
      const aCreatedAt = new Date(a.createdAt).getTime();
      const bCreatedAt = new Date(b.createdAt).getTime();
      return aCreatedAt - bCreatedAt;
    });
  }

  /**
   * Sort tasks for the Completed tab:
   * By completion date (most recent first)
   */
  static sortForCompletedTab(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      const aCompletedAt = new Date(a.completedAt!).getTime();
      const bCompletedAt = new Date(b.completedAt!).getTime();
      return bCompletedAt - aCompletedAt;
    });
  }

  /**
   * Filter tasks based on search query
   * Searches in title and description (case-insensitive)
   */
  static filterBySearch(tasks: Task[], searchQuery: string): Task[] {
    if (!searchQuery.trim()) return tasks;

    const query = searchQuery.toLowerCase().trim();
    return tasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query) || false;
      return titleMatch || descriptionMatch;
    });
  }

  /**
   * Generate a unique ID for a new task
   */
  static generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the next due date for a repeating task
   */
  static getNextDueDate(task: Task): Date | null {
    if (!task.dueDateTime || task.repeatPattern === 'none') {
      return null;
    }

    const currentDue = new Date(task.dueDateTime);
    const nextDue = new Date(currentDue);

    switch (task.repeatPattern) {
      case 'daily':
        nextDue.setDate(nextDue.getDate() + 1);
        break;
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
    }

    return nextDue;
  }

  /**
   * Create a new task from a completed repeating task
   */
  static createRepeatingTask(completedTask: Task): Task {
    const nextDueDate = this.getNextDueDate(completedTask);
    
    return {
      id: this.generateId(),
      title: completedTask.title,
      description: completedTask.description,
      dueDateTime: nextDueDate?.toISOString(),
      notificationOffsets: completedTask.notificationOffsets,
      hasAlarm: completedTask.hasAlarm,
      repeatPattern: completedTask.repeatPattern,
      customDays: completedTask.customDays,
      attachedFile: completedTask.attachedFile,
      createdAt: new Date().toISOString(),
      // completedAt is undefined for new task
    };
  }

  /**
   * Format due date for display
   */
  static formatDueDate(dueDateTime: string): string {
    const due = new Date(dueDateTime);
    const now = new Date();
    
    // Check if it's today
    const isToday = due.toDateString() === now.toDateString();
    
    // Check if it's tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = due.toDateString() === tomorrow.toDateString();
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = due.toDateString() === yesterday.toDateString();

    const timeString = due.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (isToday) {
      return `Today at ${timeString}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${timeString}`;
    } else if (isYesterday) {
      return `Yesterday at ${timeString}`;
    } else {
      return due.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  /**
   * Check if a task is upcoming (due within the next 24 hours)
   */
  static isUpcoming(task: Task): boolean {
    if (!task.dueDateTime || this.isCompleted(task)) return false;
    
    const now = new Date();
    const dueDate = new Date(task.dueDateTime);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Task is upcoming if it's due within the next 24 hours and not overdue
    return dueDate <= twentyFourHoursFromNow && dueDate >= now;
  }

  /**
   * Check if a due date has passed
   */
  static isOverdue(dueDateTime: string): boolean {
    return new Date(dueDateTime) < new Date();
  }
}
