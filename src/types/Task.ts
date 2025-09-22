export type RepeatPattern = "none" | "daily" | "weekly" | "monthly";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDateTime?: string; // ISO 8601
  notificationOffsets?: number[]; // minutes before due date
  repeatPattern: RepeatPattern;
  createdAt: string; // ISO 8601
  completedAt?: string; // ISO 8601, null if not completed
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate?: Date;
  dueTime?: Date;
  notificationOffsets: number[];
  repeatPattern: RepeatPattern;
}

export type NotificationOffset = {
  label: string;
  value: number; // minutes
};

export const NOTIFICATION_OPTIONS: NotificationOffset[] = [
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "1 day", value: 1440 },
  { label: "2 days", value: 2880 },
  { label: "1 week", value: 10080 },
];

export const REPEAT_OPTIONS: { label: string; value: RepeatPattern }[] = [
  { label: "None", value: "none" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];
