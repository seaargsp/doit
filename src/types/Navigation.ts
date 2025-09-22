import { Task } from './Task';

export type RootStackParamList = {
  MainTabs: undefined;
  TaskDetail: { taskId: string };
  TaskForm: { taskId?: string; mode: 'create' | 'edit' };
};

export type MainTabParamList = {
  Todo: undefined;
  Completed: undefined;
};

export type TodoStackParamList = {
  TodoList: undefined;
  TaskDetail: { taskId: string };
  TaskForm: { taskId?: string; mode: 'create' | 'edit' };
};

export type CompletedStackParamList = {
  CompletedList: undefined;
  TaskDetail: { taskId: string };
  TaskForm: { taskId?: string; mode: 'create' | 'edit' };
};
