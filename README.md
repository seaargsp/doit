# DoIt - Task Management App

## **Overview**
A modern, feature-rich task management application built with React Native and TypeScript. DoIt combines intuitive design with powerful functionality to help users organize their tasks effectively.

## **Core Architecture**
- **Framework**: React Native + TypeScript with Expo SDK integration
- **Navigation**: React Navigation native stack with custom swipeable tabs
- **Storage**: Local-only AsyncStorage implementation (no backend required)
- **Platform Support**: iOS and Android with platform-specific optimizations
- **Dependencies**: Native React Native packages for enhanced performance and compatibility

## **Recent Major Updates**

### 🔧 **Expo to React Native Migration**
- **Camera & Gallery**: Migrated from `expo-image-picker` to `react-native-image-picker`
  - **Fixed Camera Timeout Issues**: Resolved device-specific camera launch delays
  - **Enhanced Error Handling**: Better timeout detection and user feedback
  - **Improved Performance**: Native implementation for faster camera access
  - **Better Permissions**: Platform-specific permission handling for Android/iOS
- **File Management**: Streamlined attachment system with modal-based selection
- **Build Compatibility**: Optimized for both Expo development and React Native CLI builds

### 🔊 **Enhanced Alarm System**
- **Dual Notification System**: Regular reminders + high-priority audible alarms
- **Flexible Timing**: Alarms at notification times or due time if no notifications set
- **Clock App Style**: Persistent, audible alerts with maximum priority
- **Smart Scheduling**: Automatic cancellation when tasks are completed
- **Visual Integration**: Clear UI indicators showing when alarms will sound

### 📱 **Attachment System Improvements**
- **Modal-Based Selection**: Clean bottom sheet for attachment options
- **Camera Integration**: 
  - Fixed timeout issues on real devices
  - Enhanced error messages with troubleshooting tips
  - Retry functionality built into error dialogs
- **Gallery Access**: Smooth photo library integration
- **File Preview**: Improved attachment preview and management

## **Key Features**

### **Task Management**
- **Smart Lists**: Todo and Completed task organization
- **Search**: Real-time filtering across all tasks
- **Context Actions**: Long-press menus and swipe gestures
- **File Attachments**: Camera, gallery, and document support
- **Repeat Patterns**: Daily, weekly, monthly, and custom schedules

### **Advanced Notifications**
- **Multiple Reminders**: Set multiple notification times per task
- **Alarm Integration**: High-priority audible alarms alongside regular notifications
- **Smart Scheduling**: Skips past notification times automatically
- **Persistent Alerts**: Clock-style alarm notifications for important tasks

## **Technical Architecture**

### **Data Model**
```typescript
interface Task {
  id: string;                    // UUID
  title: string;                 // Required
  description?: string;          // Optional with URL support
  dueDateTime?: string;          // ISO 8601
  notificationOffsets?: number[]; // Minutes before due
  hasAlarm?: boolean;            // Audible alarm feature
  repeatPattern: "none" | "daily" | "weekly" | "monthly" | "custom";
  customDays?: number[];         // Custom weekly patterns (0-6)
  createdAt: string;            // ISO 8601
  completedAt?: string;         // ISO 8601, null if active
  attachedFile?: AttachedFile;  // File attachment data
}
```

### **Native Dependencies**
- `react-native-image-picker`: Camera and gallery access
- `@react-native-async-storage/async-storage`: Local data persistence
- `expo-notifications`: Advanced notification system with alarm support
- `react-native-vector-icons`: Material Design icon library
- `@react-native-community/datetimepicker`: Native date/time selection

### **Core Services**
- **StorageService**: AsyncStorage wrapper with error handling
- **NotificationService**: Dual notification system (regular + alarm)
- **TaskUtils**: Business logic for task management and repeat patterns
- **ThemeContext**: Light/dark mode with system integration

## **User Interface**

### **Navigation System**
- **Swipeable Tabs**: Instagram-style horizontal navigation with dot indicators
- **Floating Action Button**: Material Design FAB for quick task creation
- **Safe Area Integration**: Adaptive positioning for modern device form factors

### **Screen Organization**
- **Todo Screen**: Active tasks with recent completions (24hr window)
- **Completed Screen**: Full completion history, newest first
- **Task Detail**: Enhanced view with prominent actions and metadata
- **Task Form**: Comprehensive creation/editing with sticky bottom buttons

### **Theme System**
- **Automatic Detection**: System light/dark mode integration
- **Manual Override**: User preference settings
- **Consistent Colors**: Unified palette across all components
- **Accessibility**: High contrast and readable text sizing

### **Search & Filtering**
- **Real-time Search**: Instant filtering across title and description
- **Full-width Header**: Edge-to-edge search input with native icons
- **Cross-list Search**: Searches both Todo and Completed simultaneously

## **Advanced Features**

### **Alarm System** 🔊
The app includes a sophisticated dual-notification system that provides both regular reminders and high-priority alarms:

**Dual Alert Mechanism**:
- **Regular Notifications**: Standard system notifications for reminders
- **Alarm Notifications**: High-priority, clock-app-style alerts with forced sound
- **Unified Scheduling**: Both types fire at the same notification times

**Flexible Alarm Timing**:
- **With Notification Times**: Alarms sound at each selected notification offset
- **Alarm-Only Mode**: If no notification times are set, alarm sounds at due time
- **Smart Scheduling**: Automatically skips past notification times

**Enhanced Priority**:
- **Maximum Priority**: Android PRIORITY_MAX for system override
- **Forced Audio**: Bypasses Do Not Disturb for critical tasks
- **Visual Prominence**: Enhanced notification display with alarm styling
- **Persistent Alerts**: Similar behavior to phone alarm apps

**User Control**:
- **Toggle Control**: Simple on/off switch for alarm feature
- **Visual Feedback**: Clear descriptions of when alarms will sound
- **Context-Aware**: Shows different messages based on notification setup

### **File Attachments** 📎
Native file attachment system with multiple input methods:

**Camera Integration**:
- **Enhanced Reliability**: Fixed timeout issues on real devices
- **Better Error Handling**: Detailed error messages with troubleshooting tips
- **Retry Functionality**: Built-in retry options for failed captures
- **Permission Management**: Platform-specific permission handling

**Gallery Access**:
- **Photo Library**: Native gallery integration with react-native-image-picker
- **File Previews**: Thumbnail previews for attached images
- **Metadata Display**: File size and type information

**Attachment Management**:
- **Modal Selection**: Clean bottom sheet interface for choosing attachment type
- **File Removal**: Easy attachment deletion with confirmation
- **Storage Optimization**: Efficient local file handling

### **Repeat Patterns** 🔄
Flexible scheduling system for recurring tasks:

**Standard Patterns**:
- **Daily**: Tasks repeat every day
- **Weekly**: Tasks repeat weekly on the same day
- **Monthly**: Tasks repeat monthly on the same date

**Custom Weekly Patterns**:
- **Interactive Selection**: 7 circular weekday buttons (M,T,W,T,F,S,S)
- **Multiple Days**: Select any combination of weekdays
- **Visual Feedback**: Clear selected/unselected states
- **Flexible Scheduling**: Perfect for work schedules or custom routines

**Smart Task Generation**:
- **Auto-creation**: New tasks generated automatically on completion
- **History Preservation**: Original completed task remains in history
- **Pattern Inheritance**: New tasks inherit all settings including alarms

### **Task Form Enhancements** ✨
Advanced form features for efficient task creation:

**Data Preservation**:
- **Smart Toggles**: Due date/time preserved when toggling features on/off
- **State Memory**: Notification settings remembered during form changes
- **No Data Loss**: User input protected during interface changes

**Sticky Bottom Buttons**:
- **Always Accessible**: Save/Cancel buttons always visible during scrolling
- **Safe Area Adaptive**: Proper spacing for devices with/without home indicators
- **One-Handed Use**: Optimized for thumb-reach accessibility

**Alarm Integration**:
- **Visual Feedback**: Clear descriptions showing when alarms will sound
- **Context Awareness**: Different messages based on notification setup
- **Smart Defaults**: Logical alarm behavior based on task configuration

## **Installation & Setup**

### **Development**
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS  
npm run ios
```

### **Build Requirements**
- **Node.js**: 16.x or higher
- **React Native CLI**: Latest version
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)

### **Permissions**
The app requires the following permissions:

**Android**:
- `CAMERA`: Camera access for photo attachments
- `READ_EXTERNAL_STORAGE` (API ≤ 32): Gallery access
- `READ_MEDIA_IMAGES`/`READ_MEDIA_VIDEO`/`READ_MEDIA_VISUAL_USER_SELECTED` (API 33+): Gallery access
- `WRITE_EXTERNAL_STORAGE` (legacy devices)
- `VIBRATE`: Notification vibration
- `WAKE_LOCK`: Alarm functionality
- `SCHEDULE_EXACT_ALARM`: Precise alarm scheduling

**iOS**:
- `NSCameraUsageDescription`: Camera access
- `NSPhotoLibraryUsageDescription`: Photo library access

## **Usage Guide**

### **Basic Task Management**
1. **Create Task**: Tap the floating action button (FAB) in bottom-right
2. **View Details**: Tap any task to see full information
3. **Edit Task**: Long-press task → "Edit" or use edit button in detail view
4. **Complete Task**: Long-press → "Complete" or use button in detail view
5. **Delete Task**: Long-press → "Delete" with confirmation

### **Setting Up Alarms** 🔊
1. **Create/Edit Task**: Open the task form
2. **Enable Due Date**: Toggle the "Due Date" switch
3. **Set Date/Time**: Select when the task is due
4. **Enable Alarm**: Toggle the "Alarm" switch
5. **Choose Notifications**: Select reminder times (optional)
   - **With reminders**: Alarm sounds at each reminder time
   - **No reminders**: Alarm sounds at due time
6. **Save**: Task will show alarm indicator 🔊

### **File Attachments** 📎
1. **In Task Form**: Tap "Add attachment" button
2. **Choose Method**: Select from modal options:
   - **Take Photo**: Open camera (timeout issues fixed!)
   - **Choose from Gallery**: Select from photo library
   - **Choose Document**: Pick files (uses gallery picker)
3. **Preview**: Attached files show thumbnail and info
4. **Remove**: Tap X button to remove attachment

### **Custom Repeat Patterns** 🔄
1. **Task Form**: Select "Custom" from repeat options
2. **Select Days**: Tap circular weekday buttons (M,T,W,T,F,S,S)
3. **Multiple Selection**: Choose any combination of days
4. **Save**: Task will repeat on selected weekdays

### **Search & Organization** 🔍
- **Search**: Use the search bar at top to filter tasks
- **Todo Screen**: Active tasks + recent completions (24 hours)
- **Completed Screen**: Full completion history
- **Swipe Navigation**: Swipe between Todo/Completed screens

## **Troubleshooting**

### **Camera Issues**
If camera doesn't open or times out:
1. **Wait**: Give camera extra time to initialize
2. **Lock/Unlock**: Lock and unlock your device
3. **Close Apps**: Close other camera-using apps
4. **Restart App**: Force close and reopen if persistent
5. **Permissions**: Check camera permissions in device settings

### **Alarm Issues**
If alarms don't sound:
1. **Check Permissions**: Ensure notification permissions are granted
2. **Do Not Disturb**: Alarms should override DND mode
3. **Battery Optimization**: Disable battery optimization for the app
4. **Background Processing**: Allow background app refresh

### **Performance**
- **Storage**: App uses local storage only, no internet required
- **Battery**: Minimal background usage except for scheduled notifications
- **Space**: Attached files stored locally, manage as needed

## **Technical Details**

### **Architecture**
- **Framework**: React Native + TypeScript
- **State Management**: React hooks and context
- **Storage**: AsyncStorage for persistence
- **Navigation**: React Navigation with custom swipeable tabs
- **Notifications**: Expo notifications with dual-priority system

### **Key Components**
- **SwipeableTabs**: Custom tab navigation with dot indicators
- **TaskItem**: Individual task display with context menu
- **TaskForm**: Comprehensive task creation/editing
- **NotificationService**: Dual notification system manager
- **StorageService**: Data persistence layer

---

## **Recent Updates**

### **v2.0 - Major Architecture Upgrade**
- ✅ **Migrated from Expo to React Native**: Better performance and compatibility
- ✅ **Fixed Camera Timeout Issues**: Resolved device-specific camera problems
- ✅ **Enhanced Alarm System**: Clock-app-style high-priority alarms
- ✅ **Improved Error Handling**: Better user feedback and retry mechanisms
- ✅ **Native Dependencies**: Optimized for both Expo and RN CLI builds
- ✅ **Modal Attachments**: Cleaner attachment selection interface
- ✅ **Permission Handling**: Platform-specific permission flows

### **v1.x - Foundation**
- ✅ **Core Task Management**: Full CRUD operations
- ✅ **Swipeable Navigation**: Instagram-style tab system  
- ✅ **Theme Integration**: Light/dark mode support
- ✅ **File Attachments**: Camera and gallery integration
- ✅ **Repeat Patterns**: Including custom weekly schedules
- ✅ **Search System**: Real-time task filtering

---

**DoIt** - Your tasks, your way. Built with modern React Native for maximum performance and reliability.
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
