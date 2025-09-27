## Summary of Fixes Applied

### 1. Fixed "Choose Document" Feature
**Problem**: The "choose document" option was only allowing photo selection, not actual documents like PDFs.

**Solution**:
- ✅ **Added proper document picker**: Imported and implemented `@react-native-documents/picker`
- ✅ **Support all file types**: Uses `DocumentPicker.types.allFiles` to allow PDFs, documents, etc.
- ✅ **Better error handling**: Properly handles user cancellation vs actual errors

**Implementation**:
- Updated `pickDocument()` function in `TaskFormScreen.tsx`
- Now uses actual document picker instead of image picker for documents

### 2. Fixed Gallery Permissions Issue  
**Problem**: Gallery permission requests weren't working properly and didn't guide users to settings.

**Solution**:
- ✅ **Enhanced permission handling**: Created `checkAndRequestPermission()` helper function
- ✅ **Android 13+ compatibility**: Added support for new granular media permissions (`READ_MEDIA_IMAGES`)
- ✅ **Settings fallback**: When permissions are denied, shows dialog with "Open Settings" button
- ✅ **Proper error messaging**: Clear messages explaining why permissions are needed

**Implementation**:
- Added `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` permissions for Android 13+
- Enhanced permission dialogs with direct links to device settings
- Added proper handling for "Never ask again" scenarios

### 3. Fixed Alarm Sound Issues
**Problem**: Alarms weren't making any sound and behaving like regular notifications.

**Solution**:
- ✅ **Notification channels**: Set up dedicated "alarm" channel with maximum importance
- ✅ **Enhanced priority**: Uses `AndroidImportance.MAX` and `AndroidNotificationPriority.MAX`
- ✅ **Bypass Do Not Disturb**: Configured `bypassDnd: true` for alarm notifications  
- ✅ **Aggressive vibration**: Enhanced vibration patterns for alarms (1000ms pulses)
- ✅ **Visual prominence**: Added 🚨 emoji and "TASK ALARM" prefix to alarm notifications
- ✅ **Sound configuration**: Uses system default alarm sound through proper channel setup

**Implementation**:
- Created separate notification channels for regular reminders vs alarms
- Enhanced alarm notification content with urgent styling
- Added Android-specific alarm permissions (`USE_FULL_SCREEN_INTENT`, `SCHEDULE_EXACT_ALARM`)

### 4. Optional Permission Philosophy
**Key Requirement Met**: No forced permissions except notifications.

**Implementation**:
- ✅ **Notifications only at startup**: Only requests notification permissions on app launch
- ✅ **On-demand permissions**: Camera, gallery, and document permissions only requested when user tries to use those features
- ✅ **Graceful fallbacks**: If user denies permissions, they can still use the app without attachment features
- ✅ **Clear messaging**: Explains why each permission is needed and when

## Technical Changes Made

### Files Modified:
1. **`src/screens/TaskFormScreen.tsx`**:
   - Added `@react-native-documents/picker` import
   - Enhanced permission handling with `checkAndRequestPermission()`
   - Implemented proper document picker functionality
   - Added Android 13+ media permission support

2. **`src/services/NotificationService.ts`**:
   - Added Platform import
   - Created notification channels for Android (default + alarm)
   - Enhanced alarm notifications with maximum priority
   - Added `initialize()` method for startup-only notification permissions
   - Improved notification handler configuration

3. **`src/App.tsx`**:
   - Added NotificationService import
   - Added `useEffect` to initialize notifications on app startup

4. **`app.json`**:
   - Added iOS permission descriptions (camera, gallery)
   - Added Android permissions (camera, storage, media, alarm)
   - Added Android 13+ granular media permissions
   - Configured expo-notifications plugin properly

### New Permissions Added:
**Android**:
- `READ_MEDIA_IMAGES` (Android 13+)
- `READ_MEDIA_VIDEO` (Android 13+) 
- `USE_FULL_SCREEN_INTENT` (for alarm notifications)
- `SCHEDULE_EXACT_ALARM` (for precise alarm timing)

**iOS**:
- `NSCameraUsageDescription`
- `NSPhotoLibraryUsageDescription`
- `NSMicrophoneUsageDescription` (required by camera on some devices)

## How The Fixes Work

### Document Selection Flow:
1. User taps "Choose Document"
2. Native document picker opens (not gallery)  
3. User can select PDFs, Word docs, any file type
4. File gets attached with proper metadata

### Permission Request Flow:
1. **App Startup**: Only requests notification permissions
2. **Camera Use**: Requests camera permission when user taps "Take Photo"
3. **Gallery Use**: Requests media permissions when user taps "Choose from Gallery"
4. **Permission Denied**: Shows dialog with "Open Settings" option
5. **Android 13+**: Automatically uses new granular permissions

### Alarm Sound Flow:
1. When alarm is enabled and scheduled
2. Creates notification in dedicated "alarm" channel
3. Channel configured with maximum importance and bypass DND
4. Uses system alarm sound and aggressive vibration
5. Shows with 🚨 prefix and urgent styling

## User Experience Improvements

✅ **No forced permissions**: Users can use the app fully without granting camera/gallery access
✅ **Clear permission requests**: Only asks for permissions when user actually tries to use a feature  
✅ **Helpful error messages**: When permissions denied, explains how to enable in settings
✅ **Proper document support**: Can now attach actual PDFs and documents, not just images
✅ **True alarm behavior**: Alarms now sound like phone alarms, not quiet notifications
✅ **Android 13+ compatibility**: Works properly on newest Android versions

The app now provides a much better user experience with proper permission handling, working document selection, and alarm sounds that actually work like phone alarms should!