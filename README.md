# DoIt - Advanced To-Do App — Complete Design Document

## Overview
**DoIt** is a **comprehensive to-do list mobile application** built with **Expo SDK 54.0.0 (React Native)** and **TypeScript**.  
The app is **completely offline-first** and stores all user data in **local storage** with **AsyncStorage**.  

### Key Features
✅ **Complete Task Management**: Create, edit, delete, and complete tasks with rich metadata  
✅ **Smart Visual Categorization**: Icon-based task categorization with urgent task prioritization  
✅ **Adaptive Theme System**: Automatic dark/light mode detection with manual override  
✅ **File Attachments**: Support for images and documents with local storage  
✅ **Local Notifications**: Configurable reminders compatible with Expo Go  
✅ **Advanced Search**: Real-time filtering across all tasks  
✅ **Repeat Patterns**: Automatic recurring task generation  
✅ **Context Menu Actions**: Long-press interactions for task management  
✅ **Dual List Architecture**: Active tasks and completed tasks with smart visibility rules  

---

## Technical Architecture

### Framework & Dependencies
- **Expo SDK 54.0.0** - React Native development platform
- **TypeScript** - Type-safe JavaScript development
- **React Navigation** - Bottom tabs + stack navigation with theme integration
- **AsyncStorage** - Local data persistence
- **expo-notifications** - Local notification scheduling (with Expo Go compatibility)
- **expo-image-picker** - Camera and photo library access
- **expo-document-picker** - Document selection functionality
- **Ionicons** - Icon library for UI elements

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── SearchHeader.tsx     # Search functionality with theme support
│   ├── TaskContextMenu.tsx  # Long-press context menu
│   └── TaskItem.tsx         # Task display with visual categorization
├── contexts/            # React Context providers
│   └── ThemeContext.tsx     # Adaptive theme management
├── screens/             # Navigation screens
│   ├── CompletedScreen.tsx  # Completed tasks list
│   ├── TaskDetailScreen.tsx # Task details and actions
│   ├── TaskFormScreen.tsx   # Create/edit task form
│   └── TodoScreen.tsx       # Active tasks list
├── services/            # Business logic services
│   ├── NotificationService.ts # Local notification management
│   └── StorageService.ts     # AsyncStorage operations
├── types/               # TypeScript type definitions
│   ├── Navigation.ts        # Navigation type definitions
│   ├── Task.ts             # Task data model
│   └── Theme.ts            # Theme system types
└── utils/               # Utility functions
    └── TaskUtils.ts         # Task operations and sorting logic
```

---

## Core Data Models

### Task Interface
```typescript
export interface Task {
  id: string;                    // UUID identifier
  title: string;                 // Required task title
  description?: string;          // Optional description (supports URLs)
  dueDateTime?: string;          // ISO 8601 datetime string
  notificationOffsets?: number[]; // Minutes before due date
  repeatPattern: RepeatPattern;   // "none" | "daily" | "weekly" | "monthly"
  createdAt: string;             // ISO 8601 creation timestamp
  completedAt?: string;          // ISO 8601 completion timestamp (nullable)
  attachedFile?: AttachedFile;   // Optional file attachment
}

export interface AttachedFile {
  uri: string;                   // Local file URI
  type: 'image' | 'document';    // File type categorization
  name: string;                  // Original filename
  size?: number;                 // File size in bytes
}
```

### Theme System
```typescript
export interface ThemeColors {
  // Core colors
  primary: string;               // Brand/accent color
  background: string;            // Main background
  surface: string;               // Card/surface background
  text: string;                  // Primary text
  textSecondary: string;         // Secondary text
  textMuted: string;             // Muted/disabled text
  border: string;                // Border colors
  
  // Semantic colors
  error: string;                 // Error states
  warning: string;               // Warning/urgent states
  success: string;               // Success states
  
  // Tab navigation
  tabBarBackground: string;      // Tab bar background
  tabBarActiveTint: string;      // Active tab color
  tabBarInactiveTint: string;    // Inactive tab color
}
```

---

## Advanced Features

### 1. Adaptive Theme System
**Automatic Detection**: The app automatically detects system dark/light mode preference using multiple API approaches for maximum compatibility.

**Detection Methods**:
- `Appearance.getColorScheme()` - Primary detection
- `useColorScheme()` hook - React Native hook fallback
- Default light mode - Graceful degradation

**Manual Override**: Users can manually toggle between light and dark modes, with preference stored in AsyncStorage.

**Theme Integration**: All components receive theme colors through React Context, ensuring consistent theming across the entire app.

### 2. Smart Visual Categorization
**Icon-Based System**: Tasks display category icons that provide instant visual context:
- ⚠️ **Urgent Tasks**: Active tasks due within 24 hours (high priority)
- 📅 **Scheduled Tasks**: Tasks with due dates (both active and completed)
- 📝 **Open Tasks**: Tasks without due dates (both active and completed)

**Completion Logic**: Completed tasks preserve their original category icon (📅 or 📝) and show strikethrough text only.

**No Redundant UI**: Removed traditional checkboxes for a cleaner, more modern interface.

### 3. File Attachment System
**Supported Types**:
- **Images**: Camera capture or photo library selection
- **Documents**: File system document picker

**Storage**: Files are stored locally with metadata including original filename, type, and size.

**Display**: File attachments show with appropriate icons and can be opened with system default applications.

### 4. Urgent Task Prioritization
**Smart Sorting**: Tasks are automatically sorted with urgent tasks (due within 24 hours) appearing first in the Todo list.

**Visual Indicators**: Urgent tasks display warning icons (⚠️) and warning text color to draw attention.

**Temporal Logic**: The urgency calculation uses `TaskUtils.isUpcoming()` method that considers current time vs due time.

### 5. Enhanced Notification System
**Expo Go Compatibility**: Graceful degradation for notification limitations in Expo Go environment.

**Multiple Reminders**: Support for multiple notification offsets (minutes before due date).

**Smart Scheduling**: Prevents scheduling notifications for past due dates.


---

## User Interface Design

### Navigation Architecture
**Bottom Tab Navigation**:
- **Todo Tab**: Active tasks with smart sorting and urgent task prioritization
- **Completed Tab**: Historical completed tasks with completion timestamps

**Stack Navigation**: Detailed screens for task creation, editing, and viewing.

**Theme Integration**: Navigation components automatically adapt to light/dark themes.

### Task Display Components

#### TaskItem.tsx - Core Task Display
**Visual Elements**:
- **Category Icon**: Prominent emoji-based categorization (⚠️📅📝)
- **Title**: Task title with conditional strikethrough for completed tasks
- **Description**: Optional description with URL support
- **Metadata Row**: Due date, repeat pattern, and file attachment indicators
- **Completion Date**: Shows completion timestamp for recently completed tasks

**Interaction Model**:
- **Tap**: Navigate to task detail screen
- **Long Press**: Open context menu for actions (edit/delete/complete)

**Conditional Styling**:
- Completed tasks: Strikethrough text + muted colors
- Overdue tasks: Red border accent
- Urgent tasks: Warning color text + warning icon

#### SearchHeader.tsx - Global Search
**Real-time Filtering**: Instant search across task titles and descriptions.

**Cross-Tab Search**: Search functionality works across both Todo and Completed tabs.

**Theme Responsive**: Search input adapts to current theme colors.

### Task Management Screens

#### TaskFormScreen.tsx - Task Creation/Editing
**Comprehensive Form Fields**:
- Title (required text input)
- Description (optional multiline text)
- Due Date Picker (optional)
- Time Picker (optional, enabled when date selected)
- Notification Offsets (multiple selection with preset options)
- Repeat Pattern (dropdown selection)
- File Attachment (camera/document picker integration)

**Smart Validation**: Form prevents submission without required title.

**Edit Mode**: Pre-populates all fields when editing existing tasks.

#### TaskDetailScreen.tsx - Task Information
**Complete Task Display**: Shows all task metadata in organized sections.

**Action Buttons**: Completion toggle, edit navigation, and delete confirmation.

**File Viewing**: Displays attached files with system integration for opening.

#### Context Menu System
**TaskContextMenu.tsx**: Modal-based action menu triggered by long-press.

**Available Actions**:
- Edit task (navigates to form)
- Delete task (with confirmation dialog)
- Complete/uncomplete toggle (respects completion rules)

---

## Advanced Logic Systems

### Task Sorting Algorithm (TaskUtils.sortForTodoTab)
```typescript
// Priority order for Todo tab:
1. Urgent tasks (due within 24 hours) - sorted by due date ascending
2. Non-urgent tasks with due dates - sorted by due date ascending  
3. Tasks without due dates - sorted by creation date ascending
4. Recently completed tasks (≤24h) - sorted by completion date descending
```

### Task Visibility Rules
**Todo Tab**:
- All active (non-completed) tasks
- Recently completed tasks (completed ≤ 24 hours ago)
- Smart sorting with urgent tasks prioritized

**Completed Tab**:
- All completed tasks
- Sorted by completion date (newest first)
- Historical archive of all completed work

### Repeat Pattern Logic
**Automatic Generation**: When completing a recurring task, automatically creates a new instance with:
- Updated due date based on repeat interval
- Same title, description, notifications, and repeat pattern
- New unique ID and creation timestamp
- Preserves task completion history

---

## Data Persistence

### AsyncStorage Schema
```typescript
// Storage keys
"tasks" -> Task[]                    // Main task array
"theme-preference" -> "light"|"dark" // Manual theme override
"user-preferences" -> UserPrefs      // Additional app settings
```

### StorageService.ts Operations
**Core Methods**:
- `getTasks()`: Load and parse tasks from storage
- `saveTasks(tasks)`: Serialize and store task array
- `addTask(task)`: Append new task and persist
- `updateTask(task)`: Replace existing task by ID
- `deleteTask(id)`: Remove task and persist changes

**Error Handling**: Graceful degradation with user feedback for storage failures.

---

## Notification System

### NotificationService.ts Architecture
**Local Notifications Only**: No remote push notifications required.

**Scheduling Logic**:
```typescript
// For each task with dueDateTime + notificationOffsets:
const notificationTime = dueDateTime - offset;
if (notificationTime > currentTime) {
  scheduleNotification(notificationTime, taskTitle);
}
```

**Cleanup Management**: Automatically cancels notifications when:
- Task is deleted
- Task is completed
- Task due date/notifications are modified

**Expo Go Compatibility**: Handles notification limitations gracefully with user feedback.

---

## Search & Filtering

### Real-time Search Implementation
**Search Scope**: Searches across task titles and descriptions using case-insensitive substring matching.

**Cross-Tab Functionality**: Same search query applies to both Todo and Completed tabs.

**Performance**: Efficient filtering using JavaScript array methods with immediate UI updates.

### Advanced Filtering Logic
```typescript
// Search implementation
const filteredTasks = tasks.filter(task => 
  task.title.toLowerCase().includes(query.toLowerCase()) ||
  task.description?.toLowerCase().includes(query.toLowerCase())
);
```

---

## Error Handling & Edge Cases

### Robust Error Management
**Storage Failures**: User-friendly error messages with retry options.

**Notification Failures**: Graceful degradation with informational toasts.

**File Attachment Errors**: Handles permission denials and file access issues.

**Network Independence**: Fully functional offline with no network dependencies.

### Edge Case Handling
**Past Due Dates**: Prevents scheduling notifications for past times.

**Theme Detection Failures**: Falls back to light mode as default.

**Malformed Data**: Validates and sanitizes data from storage.

**Memory Management**: Efficient file handling for attachments.

---

## User Experience Flows

### Task Creation Flow
1. Tap `+` button in Todo tab
2. Fill required title and optional fields
3. Select due date/time if needed
4. Configure notification reminders
5. Attach file if desired
6. Save → Task appears in Todo list with appropriate category icon

### Task Completion Flow
1. Long press task → Context menu appears
2. Select completion action
3. Task immediately shows strikethrough in Todo tab
4. Task appears in Completed tab
5. After 24 hours → Removed from Todo tab, remains in Completed

### Urgent Task Management
1. Tasks due within 24 hours automatically show ⚠️ icon
2. Sorted to top of Todo list for visibility
3. Warning text color draws attention
4. Upon completion → Reverts to original category icon

### Theme Management
1. App automatically detects system preference on launch
2. Theme applies consistently across all screens
3. Manual toggle available in app settings
4. Preference persisted in local storage

---

## Performance Optimizations

### Efficient Rendering
**Optimized FlatList**: Uses `keyExtractor` and `getItemLayout` for smooth scrolling.

**Conditional Rendering**: Only renders visible UI elements based on task state.

**Memoization**: React.memo and useMemo for expensive calculations.

### Memory Management
**File Attachment Caching**: Efficient local file storage without duplication.

**Task List Virtualization**: Large task lists render efficiently.

**Image Optimization**: Compressed image storage for attached files.

---

## Development & Deployment

### Development Environment
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS  
npm run ios

# Run on web
npm run web
```

### Build Configuration
**Expo Configuration**: Optimized app.json with proper permissions and capabilities.

**TypeScript**: Strict type checking enabled for code quality.

**ESLint**: Code formatting and quality enforcement.

### Testing Strategy
**Manual Testing**: Comprehensive user flow testing across all features.

**Device Testing**: Verified on both Android and iOS through Expo Go.

**Edge Case Testing**: Validation of error states and boundary conditions.

---

## Implementation Details

### Key Utility Functions

#### TaskUtils.ts - Core Task Operations
```typescript
export const TaskUtils = {
  // Task state detection
  isCompleted: (task: Task): boolean => !!task.completedAt,
  
  isRecentlyCompleted: (task: Task): boolean => {
    if (!task.completedAt) return false;
    const completedTime = new Date(task.completedAt).getTime();
    const now = Date.now();
    return (now - completedTime) <= 24 * 60 * 60 * 1000; // 24 hours
  },

  isOverdue: (dueDateTime: string): boolean => {
    return new Date(dueDateTime) < new Date();
  },

  isUpcoming: (task: Task): boolean => {
    if (!task.dueDateTime || TaskUtils.isCompleted(task)) return false;
    const dueTime = new Date(task.dueDateTime).getTime();
    const now = Date.now();
    const timeUntilDue = dueTime - now;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return timeUntilDue > 0 && timeUntilDue <= twentyFourHours;
  },

  // Advanced sorting for Todo tab with urgent task prioritization
  sortForTodoTab: (tasks: Task[]): Task[] => {
    const active = tasks.filter(t => !TaskUtils.isCompleted(t));
    const recentlyCompleted = tasks.filter(t => 
      TaskUtils.isCompleted(t) && TaskUtils.isRecentlyCompleted(t)
    );

    // Sort active tasks: urgent first, then by due date, then by creation
    const sortedActive = active.sort((a, b) => {
      const aUrgent = TaskUtils.isUpcoming(a);
      const bUrgent = TaskUtils.isUpcoming(b);
      
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      
      if (a.dueDateTime && b.dueDateTime) {
        return new Date(a.dueDateTime).getTime() - new Date(b.dueDateTime).getTime();
      }
      if (a.dueDateTime && !b.dueDateTime) return -1;
      if (!a.dueDateTime && b.dueDateTime) return 1;
      
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Sort recently completed by completion date (newest first)
    const sortedCompleted = recentlyCompleted.sort((a, b) => 
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );

    return [...sortedActive, ...sortedCompleted];
  },

  // Repeat pattern handling
  generateNextTask: (completedTask: Task): Task => {
    if (completedTask.repeatPattern === 'none' || !completedTask.dueDateTime) {
      throw new Error('Cannot generate next task for non-repeating task');
    }

    const dueDate = new Date(completedTask.dueDateTime);
    let nextDueDate: Date;

    switch (completedTask.repeatPattern) {
      case 'daily':
        nextDueDate = new Date(dueDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextDueDate = new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextDueDate = new Date(dueDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        break;
      default:
        throw new Error(`Unknown repeat pattern: ${completedTask.repeatPattern}`);
    }

    return {
      ...completedTask,
      id: generateUUID(),
      dueDateTime: nextDueDate.toISOString(),
      createdAt: new Date().toISOString(),
      completedAt: undefined,
    };
  }
};
```

---

## Future Enhancement Roadmap

### Planned Features
- **Cloud Sync**: Optional cloud backup and sync across devices
- **Advanced Categorization**: Custom tags and labels
- **Analytics**: Task completion insights and productivity metrics
- **Collaboration**: Shared task lists and assignments
- **Export/Import**: Backup and restore functionality
- **Advanced Notifications**: Geolocation-based reminders
- **Voice Input**: Speech-to-text task creation
- **Calendar Integration**: Sync with system calendar apps

### Technical Improvements
- **Offline-First Architecture**: Enhanced data synchronization
- **Performance Monitoring**: Real-time performance tracking
- **Accessibility**: Full screen reader and navigation support
- **Internationalization**: Multi-language support
- **Advanced Search**: Fuzzy search and filtering options

---

## Conclusion

**DoIt** represents a comprehensive, production-ready to-do application that balances powerful functionality with intuitive user experience. The app successfully combines modern React Native development practices with thoughtful UX design to create a tool that enhances productivity without overwhelming users.

The adaptive theme system, smart visual categorization, and file attachment capabilities make it a standout solution in the productivity app space, while the offline-first architecture ensures reliability and performance across all usage scenarios.

**Last Updated**: September 22, 2025  
**Version**: 1.0.0  
**Expo SDK**: 54.0.0  
**React Native**: Latest  
**TypeScript**: Latest

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
