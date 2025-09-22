# Simplified To-Do App — Design Document

## Overview
This is a **simplified to-do list mobile application** built with **Expo (React Native)**.  
The app is **completely offline** and stores all user data in **local storage**.  

It supports:
- Creating, editing, deleting, and completing tasks.  
- Local notifications based on configurable reminders.  
- A clean UI with two main lists: **To-Do** and **Completed**.  
- Search functionality across all tasks.  
- Basic repeat rules for recurring tasks.  

---

## Requirements

### Core Features
- **Local storage only** (no online APIs).  
- **Task attributes**:
  - `title` (required)
  - `description` (optional; may contain plain text or URL links)
  - `dueDateTime` (optional; date + time)
  - `notificationOffsets` (optional; multiple reminders, e.g. `10min`, `1hr`, `1day`)
  - `repeatPattern` (none, daily, weekly, monthly)
  - `createdAt` (auto-generated timestamp)
  - `completedAt` (nullable)
  - `id` (UUID, unique identifier)

- **Tabs (Lists)**:
  - **To-Do**: all active + recently completed tasks (completed ≤ 1 day ago).
  - **Completed**: all tasks completed > 0 days ago (sorted by completion date).

- **Task completion logic**:
  - A completed task remains visible in the To-Do tab (strikethrough style) for 24 hours.
  - Immediately after completion, it also appears in the Completed tab.
  - After 24 hours, it disappears from To-Do and only remains in Completed.

- **Notifications**:
  - System-level local notifications.
  - Trigger based on selected offsets relative to the due date & time.
  - Handle edge case: due date already passed → no notifications scheduled.

---

## User Interface

### Global UI
- **Header / Toolbar (sticky)**:
  - Search bar (filters tasks in both lists).
  - Add (`+`) button (opens task creation form).

- **Bottom Tabs Navigation**:
  - **To-Do Tab**
  - **Completed Tab**

---

### To-Do Tab
- Scrollable list of tasks.
- Each item shows:
  - Task title
  - Due date/time (if present)
  - Completion state (checkbox or strikethrough for completed tasks)
- **Sorting**:
  - Tasks with due dates → sorted ascending (earliest first).
  - Tasks without due dates → sorted by `createdAt` (oldest first).
  - Completed tasks (within 24h) → shown at the bottom, strikethrough.

**Interactions**:
- **Tap** → open task detail view.
- **Long press** → show contextual menu (edit ✏️, delete ❌).
- **Swipe left** (optional enhancement) → quick complete/uncomplete toggle.

---

### Completed Tab
- Scrollable list of tasks completed > 0 days ago.
- Each item shows:
  - Task title (strikethrough).
  - Completion date/time.
- **Sorting**:
  - By `completedAt` descending (newest first).
- Search applies here too.

---

### Task Detail View
- Displays all fields:  
  - Title  
  - Description (URLs clickable)  
  - Due date & time  
  - Notifications (list of offsets)  
  - Repeat pattern  
- Actions:  
  - **Mark as completed** (button, disabled if already completed).  
  - **Edit** (navigates to form).  
  - **Delete** (with confirmation dialog).  

---

### Task Form (Create / Edit)
- Fields:
  - Title (required, text input)
  - Description (optional, text area)
  - Due date picker (optional)
  - Time picker (optional if date selected)
  - Notification offsets (multi-select dropdown)
  - Repeat pattern (dropdown: none/daily/weekly/monthly)
- Buttons:
  - **Save** → create/update task
  - **Cancel** → discard changes
- **Edit Mode**:
  - Pre-fill with existing values.
  - Updates the existing task in storage.

---

### Deletion Flow
- Long press → select task → tap delete (❌).
- Confirmation dialog:  
  `"Are you sure you want to delete {task.title}?"`
- On confirm → remove from storage.

---

## Data Model

```ts
type Task = {
  id: string;
  title: string;
  description?: string;
  dueDateTime?: string; // ISO 8601
  notificationOffsets?: number[]; // minutes before due date
  repeatPattern: "none" | "daily" | "weekly" | "monthly";
  createdAt: string; // ISO 8601
  completedAt?: string; // ISO 8601, null if not completed
};
```

---

## Local Storage

- Use **AsyncStorage** to persist data.  
- Key structure:
  - `"tasks"` → JSON array of `Task` objects.  

**Operations**:
- `getTasks()`: load tasks from storage.  
- `saveTasks(tasks)`: overwrite tasks array.  
- `addTask(task)`: append task, then save.  
- `updateTask(task)`: replace by `id`, then save.  
- `deleteTask(id)`: filter out task, then save.  

---

## Notifications

- Use `expo-notifications`.  
- For each task with `dueDateTime` + `notificationOffsets`:  
  - Schedule a local notification at `dueDateTime - offset`.  
  - Cancel scheduled notifications when:
    - Task is deleted.
    - Task is completed (optional, configurable).
    - Task’s due date or notifications are changed.  
- Handle edge cases:
  - If notification time < current time, skip scheduling.

---

## Repeat Pattern Handling
- When a task with repeat pattern is completed:
  - Automatically generate a new task with:
    - New `dueDateTime` shifted by repeat interval.
    - Same title, description, notifications, repeatPattern.
    - New `id`, new `createdAt`.
  - Preserve task history in Completed list.

---

## Search Functionality
- Search bar filters tasks in **both lists** by:
  - Case-insensitive substring match in `title` or `description`.
  - Real-time filtering as user types.

---

## Error Handling
- **Storage failures** → show error banner (`"Could not save task"`).  
- **Notification failures** → show toast (`"Notification could not be scheduled"`).  
- **Form validation** → require non-empty title.  

---

## Future Enhancements (Optional, Out of Scope)
- Tagging / categorization.  
- Sort / filter options.  
- Dark mode.  
- Export / import tasks.  

---

## Example User Flows

### Add a To-Do
1. Tap `+`.  
2. Fill in title, description, due date, etc.  
3. Save → new task appears in To-Do list.  

### Complete a Task
1. Tap task → open detail view.  
2. Tap “Mark as Completed”.  
3. Task becomes strikethrough in To-Do list.  
4. Task also appears in Completed tab.  
5. After 24h → removed from To-Do tab, remains in Completed.  

### Edit a Task
1. Long press → select edit ✏️.  
2. Form opens pre-filled.  
3. Update fields, save.  
4. Task list refreshes.  

### Delete a Task
1. Long press → delete ❌.  
2. Confirm → task removed from storage and UI.  
