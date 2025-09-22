import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/Task';

const TASKS_STORAGE_KEY = 'tasks';

export class StorageService {
  static async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (tasksJson) {
        return JSON.parse(tasksJson);
      }
      return [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw new Error('Could not load tasks');
    }
  }

  static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      const tasksJson = JSON.stringify(tasks);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, tasksJson);
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw new Error('Could not save tasks');
    }
  }

  static async addTask(task: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      tasks.push(task);
      await this.saveTasks(tasks);
    } catch (error) {
      console.error('Error adding task:', error);
      throw new Error('Could not save task');
    }
  }

  static async updateTask(updatedTask: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const index = tasks.findIndex(task => task.id === updatedTask.id);
      if (index === -1) {
        throw new Error('Task not found');
      }
      tasks[index] = updatedTask;
      await this.saveTasks(tasks);
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Could not update task');
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      await this.saveTasks(filteredTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Could not delete task');
    }
  }

  static async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const tasks = await this.getTasks();
      return tasks.find(task => task.id === taskId) || null;
    } catch (error) {
      console.error('Error getting task by id:', error);
      return null;
    }
  }
}
