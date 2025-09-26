# DoIt - To-Do App Requirements

## **Core App Structure**
- **Framework**: Expo SDK 54.0+ with React Native + TypeScript
- **Storage**: Local-only with AsyncStorage (no backend)
- **Navigation**: React Navigation native stack with theme integration
- **Safe Area**: Full safe area inset support for gesture and button navigation

## **UI Architecture**

### **Main Navigation**
- Swipeable horizontal tabs (Instagram-style) with dot indicators
- Two main screens: Todo List and Completed List
- Floating Action Button (Material Design FAB) for quick task creation
- Safe area adaptive positioning for navigation bars

### **Theme System**
- Automatic light/dark mode detection with manual override
- Consistent color scheme across all components
- Status bar integration with theme colors

### **Search Experience**
- Full-width search header with native platform icons
- Real-time filtering across both Todo and Completed lists
- Case-insensitive title and description matching

## **Task Management**

### **Task Data Model**
```typescript
interface Task {
  id: string;                    // UUID
  title: string;                 // Required
  description?: string;          // Optional with URL support
  dueDateTime?: string;          // ISO 8601
  notificationOffsets?: number[]; // Minutes before due
  hasAlarm?: boolean;            // Audible alarm at notification times
  repeatPattern: "none" | "daily" | "weekly" | "monthly" | "custom";
  customDays?: number[];         // For custom weekly patterns (0-6)
  createdAt: string;            // ISO 8601
  completedAt?: string;         // ISO 8601, null if active
  attachedFile?: AttachedFile;  // Optional file attachment
}
```

### **Task Lists Behavior**
- **Todo List**: Active tasks + completed tasks (< 24 hours) with strikethrough
- **Completed List**: All completed tasks, newest first
- **Auto-cleanup**: Remove completed tasks from Todo after 24 hours

### **Task Actions**
- Tap task → Detail view with enhanced styling
- Long press → Context menu (Edit, Delete, Complete)
- Swipe actions for quick completion

## **Advanced Features**

### **File Attachments**
- Image capture via camera or photo library (expo-image-picker)
- Document selection (expo-document-picker)
- Local file storage with preview capabilities
- Modal-based attachment picker (not Alert-based for Android compatibility)

### **Notifications**
- Local notifications using expo-notifications
- Multiple reminder offsets per task
- Smart scheduling (skip past times)
- Cancel notifications on task completion/deletion
- **Audible Alarm System**: High-priority alarm notifications that work alongside regular reminders

### **Alarm System**
- **Dual Alert System**: Regular notifications + audible alarms at the same times
- **Flexible Timing**: Alarms sound at notification times, or at due time if no notifications set
- **High Priority**: Enhanced notification priority with forced sound and visual prominence
- **Clock App Style**: Persistent, audible alerts similar to phone alarm apps
- **Smart Scheduling**: Automatic alarm cancellation when tasks are completed or deleted

### **Repeat Patterns**
- Standard patterns: daily, weekly, monthly
- Custom weekly patterns with interactive weekday selection
- Auto-generate new tasks on completion with repeat patterns
- Preserve original task in completed history

### **Form Features**
- Enhanced task creation/editing with sticky bottom buttons
- Due date/time preservation when toggling features
- **Alarm Toggle Functionality**: Enables audible alarms at notification times
- **Smart Alarm Scheduling**: Alarms at notification times or due time if no notifications
- **Visual Feedback**: Clear descriptions of when alarms will sound
- Custom repeat pattern UI with weekday circles
- Safe area adaptive button positioning

## **Technical Implementation**

### **Navigation & Layout**
- SafeAreaProvider wrapping entire app
- useSafeAreaInsets() for dynamic padding
- Adaptive bottom positioning for navigation bars
- Consistent spacing across gesture and button navigation

### **Icons & Styling**
- react-native-vector-icons with Material Design icons
- Platform-specific icon adaptation
- Consistent sizing and color theming

### **Error Handling**
- Storage operation error handling
- Form validation (non-empty titles)
- Notification scheduling fallbacks
- User feedback for all error states

## **Development Build Compatibility**
- Full expo-notifications functionality in development builds
- File attachment features fully functional
- Native icon libraries properly linked
- Android-specific modal implementations for better UX

## **Key User Flows**
1. **Add Task**: FAB → Form → Save → Appears in Todo
2. **Complete Task**: Detail view → Complete → Strikethrough → Auto-move after 24h
3. **Edit Task**: Long press → Edit → Pre-filled form → Save
4. **Delete Task**: Long press → Delete → Confirmation → Remove
5. **Attach File**: Form → Add attachment → Modal picker → Select → Preview
6. **Set Reminders**: Form → Notifications → Multiple offsets → Local scheduling
7. **Custom Repeat**: Form → Repeat → Custom → Weekday selection → Auto-generation
8. **Set Alarms**: Form → Enable Due Date → Toggle Alarm → Select notification times → High-priority alarms scheduled
9. **Alarm-Only Tasks**: Form → Enable Due Date → Toggle Alarm → No notification times → Alarm at due time

## **Platform Considerations**
- Android navigation button vs gesture navigation adaptation
- iOS safe area handling for different device types
- Modal vs Alert implementation for better Android compatibility
- Platform-specific icon and styling differences
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

## Major UI/UX Improvements

### 1. Modern Navigation System
**Swipeable Tabs with Dot Indicators**: Replaced traditional bottom tab navigation with Instagram-style horizontal swipe navigation featuring:
- Smooth horizontal scrolling between Todo and Completed screens
- Elegant dot indicator system showing current tab
- Larger, more prominent tab icons at the bottom
- Gesture-based navigation for intuitive user experience

**Floating Action Button**: Added Material Design-inspired FAB for quick task creation:
- Positioned strategically in bottom-right corner
- Rounded square design with subtle shadow
- Platform-adaptive visibility and styling
- One-tap access to task creation

### 2. Enhanced Search Experience
**Full-Width Search Header**: Redesigned search interface with:
- Edge-to-edge search input spanning full width
- Native platform icons (magnifying glass) for consistency
- Improved visual hierarchy and spacing
- Real-time search across all task content

### 3. Improved Task Detail Screen
**Larger, More Readable Design**:
- Increased title font size to 28px for better hierarchy
- Plain text styling for description and metadata (removed input box appearance)
- Header action buttons for edit and delete operations
- Repositioned complete/undo button to bottom for better thumb reach
- Removed redundant "Details" section header for cleaner layout

### 4. Advanced Task Form Features
**Due Date Preservation**: Smart form behavior that preserves user input:
- When toggling due date off/on, previous date/time selections are remembered
- Notification settings are maintained during due date changes
- No data loss during form interactions

**Alarm Integration**: Added dedicated alarm toggle for enhanced notifications:
- Separate alarm control for audible alerts that work alongside regular notifications
- Creates alarm-style notifications at the same times as regular notification reminders
- If no notification times are selected, alarm sounds at the due time
- High-priority notifications with enhanced sound and visual prominence
- Ready for integration with native notification sound settings

**Custom Repeat Patterns**: Interactive weekday selection interface:
- 7 circular buttons representing each day of the week (M,T,W,T,F,S,S)
- Multiple day selection for flexible custom repeat schedules
- Visual feedback with selected state highlighting
- Seamless integration with existing repeat pattern options

**Optimized Date/Time Layout**: 
- Combined date and time pickers in single row (50% width each)
- More efficient use of screen space
- Improved visual balance and accessibility

**Cleaner Form Design**:
- Removed field labels (Title, Description, Attachment) while preserving placeholders
- Reduced visual clutter and improved focus on content
- More modern, minimal aesthetic

### 5. Native Platform Integration
**Platform-Specific Icons**: Replaced generic Expo icons with native platform libraries:
- **Android**: Material Design icons for authentic Android experience
- **iOS**: SF Symbols-style icons for native iOS feel
- Automatic platform detection and appropriate icon rendering
- Better performance through native icon libraries

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

### 5. Enhanced Notification & Alarm System
**Dual Alert Architecture**: Comprehensive alerting system with both gentle reminders and urgent alarms:

**Regular Notifications**:
- Gentle reminder-style notifications
- Multiple offset times (5 minutes to 1 week before due)
- Standard notification priority and sound
- Dismissible and non-intrusive

**Audible Alarm System**:
- High-priority alarm notifications with enhanced sound
- Clock app-style persistent alerts
- Maximum Android notification priority
- Forced sound and visual prominence
- "🚨 TASK ALARM" title with urgent messaging

**Smart Scheduling Logic**:
- **With Notification Times**: Alarms sound at ALL selected notification times
- **Without Notification Times**: Single alarm at due time
- **Automatic Cleanup**: Alarms cancelled when tasks completed/deleted
- **Recurring Tasks**: Alarm settings preserved in repeated tasks

**Expo Go Compatibility**: Graceful degradation for notification limitations in Expo Go environment.

**Cross-Platform Support**: Enhanced notification behavior works on both Android and iOS.


---

## User Interface Design

### Navigation Architecture
**Swipeable Tab System**:
- **Custom SwipeableTabs Component**: Instagram-style horizontal navigation with gesture support
- **Visual Indicators**: Dot-based current tab indication with smooth transitions
- **Tab Content**: Todo and Completed screens with preserved state across swipes
- **Enhanced Tab Bar**: Larger icons positioned at bottom with improved touch targets

**Stack Navigation**: Detailed screens for task creation, editing, and viewing with enhanced headers.

**Theme Integration**: All navigation components automatically adapt to light/dark themes.

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
- **Alarm-enabled tasks**: Filled bell icon (🔔) with primary color highlighting

**Notification & Alarm Indicators**:
- **Regular Notifications**: Outline bell icon for tasks with notification offsets
- **Alarm Enabled**: Filled bell icon with primary color for tasks with alarms
- **Dual Display**: Both icons shown when task has both notifications and alarms

#### SearchHeader.tsx - Global Search
**Real-time Filtering**: Instant search across task titles and descriptions.

**Cross-Tab Search**: Search functionality works across both Todo and Completed tabs.

**Theme Responsive**: Search input adapts to current theme colors.

### Task Management Screens

#### TaskFormScreen.tsx - Advanced Task Creation/Editing
**Enhanced Form Fields**:
- Title (required text input with inline validation)
- Description (optional multiline text with improved styling)
- Smart Due Date/Time Selection (combined row layout for space efficiency)
- **Alarm Toggle**: Dedicated control for audible alerts with contextual feedback
- **Alarm Descriptions**: Dynamic help text explaining when alarms will sound
- Advanced Notification System (multiple offset selection with visual chips)
- Custom Repeat Patterns (interactive weekday selection with circular buttons)
- File Attachment (camera/document picker with enhanced preview)

**Intelligent Form Behavior**:
- **Due Date Preservation**: Maintains date/time/notification/alarm settings when toggling due date on/off
- **Alarm State Management**: Preserves alarm preference during form interactions
- **Smart Validation**: Prevents submission without required fields
- **Edit Mode**: Pre-populates all fields including alarm state with proper state management
- **Clean Label-Free Design**: Removed field labels while maintaining clear placeholders

**Alarm-Specific Features**:
- **Contextual Help**: "🔊 Audible alarm will sound at notification times" when alarm enabled
- **Warning Messages**: "⚠️ Alarm will sound at due time" when no notification times selected
- **State Preservation**: Alarm setting maintained when toggling due date on/off
- **Visual Feedback**: Immediate confirmation of alarm settings

**Custom Repeat Pattern Interface**:
- Visual weekday selector with 7 circular buttons (M,T,W,T,F,S,S)
- Multiple day selection for flexible custom schedules
- Real-time visual feedback with selection highlighting
- Seamless integration with existing repeat options (None, Daily, Weekly, Monthly)

#### TaskDetailScreen.tsx - Enhanced Task Information Display
**Improved Visual Hierarchy**: 
- Larger task titles (28px) for better readability
- Plain text styling for description and metadata (removed input-like borders)
- Cleaner metadata presentation without redundant section headers

**Header Action Integration**: 
- Edit and Delete buttons positioned in navigation header
- Quick access to primary task actions
- Consistent with platform navigation patterns

**Enhanced Complete/Undo Functionality**:
- Repositioned action button to bottom of screen for better ergonomics
- Proper toggle behavior - tasks can be marked complete and then uncompleted
- State preservation when undoing completion (restores notifications and alarms if applicable)
- Recently completed tasks remain visible in Todo tab for 24 hours

**Alarm Display Features**:
- **Prominent Alarm Chip**: "🔊 Audible Alarm" chip with blue background and white text
- **Contextual Descriptions**: 
  - "Alarm will sound at due time" for alarm-only tasks
  - "Alarm will sound at notification times" for tasks with both alarms and notifications
- **Visual Hierarchy**: Alarm information prominently displayed in notifications section
- **Integration**: Alarm status shown even when no regular notifications are set

**File Viewing**: Displays attached files with enhanced previews and system integration for opening.

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
- Same title, description, notifications, alarms, and repeat pattern
- New unique ID and creation timestamp
- **Alarm Preservation**: hasAlarm setting maintained in recurring tasks
- **Complete Data Migration**: All task properties including customDays and attachedFile preserved
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

## Notification & Alarm System

### NotificationService.ts Architecture
**Dual Notification System**: Both regular notifications and alarm notifications.

**Regular Notification Scheduling**:
```typescript
// For each task with dueDateTime + notificationOffsets:
const notificationTime = dueDateTime - offset;
if (notificationTime > currentTime) {
  scheduleNotification(notificationTime, taskTitle, 'reminder');
}
```

**Alarm Notification Scheduling**:
```typescript
// For tasks with hasAlarm enabled:
const alarmTime = dueDateTime - offset; // or dueDateTime if no offsets
if (alarmTime > currentTime) {
  scheduleAlarmNotification(alarmTime, taskTitle, 'alarm');
}
```

**Alarm Enhancement Features**:
- High priority notifications (`AndroidNotificationPriority.MAX`)
- Forced sound and visual alerts
- Enhanced notification titles ("🚨 TASK ALARM")
- Urgent messaging for immediate attention
- Badge notifications for alarms

**Cleanup Management**: Automatically cancels both regular notifications and alarms when:
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

### Alarm User Experience
1. **Enable Alarm with Notifications**: Due Date ON → Alarm Toggle ON → Select notification times → Both gentle reminders AND alarms fire
2. **Alarm-Only Mode**: Due Date ON → Alarm Toggle ON → No notification times → Single alarm at due time
3. **Alarm Feedback**: Visual confirmation with "🔊 Audible alarm will sound at notification times" message
4. **Alarm Indicators**: Tasks with alarms show filled bell icon (🔔) in task lists
5. **Detail View**: Prominent "🔊 Audible Alarm" chip with context descriptions

### Theme Management
1. App automatically detects system preference on launch
2. Theme applies consistently across all screens
3. Manual toggle available in app settings
4. Preference persisted in local storage

---

## Performance Optimizations & Codebase Cleanup

### Bundle Size Optimization
**Removed Unused Dependencies (7 packages)**:
- `@expo/vector-icons` → Replaced with `react-native-vector-icons` for native platform integration
- `@react-navigation/bottom-tabs` → Removed in favor of custom swipeable navigation
- `@react-navigation/stack` → Streamlined to only use native stack navigation
- `@react-native-picker/picker` → Replaced with custom option button components
- `react-native-gesture-handler` → Removed unused gesture handling library
- `react-native-reanimated` → Removed unused animation library
- `expo-linking` → Using React Native's built-in Linking instead

**Package Reduction**: From 837 to 828 packages total (9 packages removed)

### Code Quality Improvements
**Eliminated Unused Imports**: Systematically removed unused imports from all components:
- Cleaned up redundant React Native component imports
- Removed unused utility functions and type definitions
- Streamlined icon library imports across all files

**Removed Dead Code**: 
- Eliminated unused state variables and functions
- Cleaned up duplicate import statements
- Removed redundant dimension calculations and screen size variables

**Improved Architecture**:
- Consolidated App.tsx imports and structure
- Streamlined component prop interfaces
- Optimized file import paths and organization

### Development Efficiency
**Faster Build Times**: Reduced dependency tree results in faster compilation
**Smaller Bundle**: More efficient app size for production builds
**Cleaner Codebase**: Improved maintainability and developer experience
**Native Performance**: Platform-specific icons provide better rendering performance

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
# Generate native projects (required for native icons and notifications)
npx expo prebuild

# Start development server with custom build
npx expo start --dev-client

# Build and run on Android
cd android && ./gradlew assembleRelease
npm run android

# Build and run on iOS  
npm run ios

# For web development (limited feature support)
npm run web
```

### Build Configuration
**Native Development Build**: App now requires development build for full functionality:
- Native vector icons (Material Design on Android, SF Symbols-style on iOS)
- Enhanced notification capabilities beyond Expo Go limitations
- Better performance through native module integration

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
