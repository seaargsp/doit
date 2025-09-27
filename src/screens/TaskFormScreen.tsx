import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Platform,
  Image,
  Modal,
  Pressable,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';

import { RootStackParamList } from '../types/Navigation';
import { Task, TaskFormData, RepeatPattern, NOTIFICATION_OPTIONS, REPEAT_OPTIONS, AttachedFile } from '../types/Task';
import { StorageService } from '../services/StorageService';
import { NotificationService } from '../services/NotificationService';
import { AlarmService } from '../services/AlarmService';
import { TaskUtils } from '../utils/TaskUtils';
import { getIconName, getIconComponent } from '../utils/IconUtils';
import { useTheme } from '../contexts/ThemeContext';

type TaskFormScreenProps = {
  route: RouteProp<RootStackParamList, 'TaskForm'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskForm'>;
};

export default function TaskFormScreen({ route, navigation }: TaskFormScreenProps) {
  const { taskId, mode } = route.params;
  const isEditMode = mode === 'edit';
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const IconComponent = getIconComponent();

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: undefined,
    dueTime: undefined,
    notificationOffsets: [],
    hasAlarm: false,
    repeatPattern: 'none',
    attachedFile: undefined,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachmentOptionsVisible, setAttachmentOptionsVisible] = useState(false);
  
  // Store previous due date options when toggling off
  const [preservedDueDate, setPreservedDueDate] = useState<Date | undefined>();
  const [preservedDueTime, setPreservedDueTime] = useState<Date | undefined>();
  const [preservedNotifications, setPreservedNotifications] = useState<number[]>([]);
  const [preservedAlarm, setPreservedAlarm] = useState<boolean>(false);
  
  // Alarm feature
  const [hasAlarm, setHasAlarm] = useState(false);
  
  // Custom repeat pattern state
  const [customDays, setCustomDays] = useState<number[]>([]); // Mon-Sun

  const styles = createStyles(colors);

  useEffect(() => {
    if (isEditMode && taskId) {
      loadTask();
    }
  }, [isEditMode, taskId]);

  // (Removed focus effect; using Modal for attachment options instead of Alert)

  const loadTask = async () => {
    try {
      const task = await StorageService.getTaskById(taskId!);
      if (task) {
        const dueDateTime = task.dueDateTime ? new Date(task.dueDateTime) : undefined;
        setFormData({
          title: task.title,
          description: task.description || '',
          dueDate: dueDateTime,
          dueTime: dueDateTime,
          notificationOffsets: task.notificationOffsets || [],
          hasAlarm: task.hasAlarm || false,
          repeatPattern: task.repeatPattern,
          attachedFile: task.attachedFile,
        });
        setHasDueDate(!!task.dueDateTime);
        setHasAlarm(task.hasAlarm || false);
        if (task.repeatPattern === 'custom' && task.customDays) {
          setCustomDays(task.customDays);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load task');
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    setLoading(true);

    try {
      let dueDateTime: string | undefined;
      if (hasDueDate && formData.dueDate) {
        const date = formData.dueDate;
        if (formData.dueTime) {
          const time = formData.dueTime;
          date.setHours(time.getHours(), time.getMinutes(), 0, 0);
        }
        dueDateTime = date.toISOString();
      }

      const taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt'> = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueDateTime,
        notificationOffsets: formData.notificationOffsets.length > 0 ? formData.notificationOffsets : undefined,
        hasAlarm: hasAlarm,
        repeatPattern: formData.repeatPattern,
        customDays: formData.repeatPattern === 'custom' ? customDays : undefined,
        attachedFile: formData.attachedFile,
      };

      if (isEditMode && taskId) {
        // Update existing task
        const existingTask = await StorageService.getTaskById(taskId);
        if (!existingTask) {
          throw new Error('Task not found');
        }

        const updatedTask: Task = {
          ...existingTask,
          ...taskData,
        };

        await StorageService.updateTask(updatedTask);
        await NotificationService.updateTaskNotifications(updatedTask);
        await AlarmService.updateTaskAlarms(updatedTask);
      } else {
        // Create new task
        const newTask: Task = {
          id: TaskUtils.generateId(),
          createdAt: new Date().toISOString(),
          ...taskData,
        };

        await StorageService.addTask(newTask);
        await NotificationService.scheduleTaskNotifications(newTask);
        await AlarmService.updateTaskAlarms(newTask);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dueDate: selectedDate });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormData({ ...formData, dueTime: selectedTime });
    }
  };

  const checkAndRequestPermission = async (permission: string, title: string, message: string): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true; // iOS handles permissions automatically
    }

    try {
      // For Android 13+, use different permissions for media access
      if (permission === PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE) {
        const androidVersion = Platform.Version as number;
        
        if (androidVersion >= 33) {
          // Android 13+ uses granular media permissions
          try {
            // Try the new media images permission first
            const mediaImagesGranted = await PermissionsAndroid.request(
              'android.permission.READ_MEDIA_IMAGES' as any,
              {
                title: 'Photo Access',
                message: 'This app needs access to your photos to attach images to tasks. This permission is optional and only used when you choose to attach photos.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Deny',
                buttonPositive: 'Allow',
              }
            );

            if (mediaImagesGranted === PermissionsAndroid.RESULTS.GRANTED) {
              return true;
            }

            // If denied, try the visual media permission as fallback
            const visualMediaGranted = await PermissionsAndroid.request(
              'android.permission.READ_MEDIA_VISUAL_USER_SELECTED' as any,
              {
                title: 'Photo Access',
                message: 'Allow access to selected photos only.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Deny', 
                buttonPositive: 'Allow',
              }
            );

            if (visualMediaGranted === PermissionsAndroid.RESULTS.GRANTED) {
              return true;
            }

            // If both new permissions fail, show helpful message
            Alert.alert(
              'Photo Access Required',
              'To attach photos from your gallery, please enable photo access in your device settings.\n\nGo to: Settings → Apps → DoIt → Permissions → Photos and Media → Allow',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() }
              ]
            );
            return false;

          } catch (error) {
            console.warn('Android 13+ permission request failed:', error);
            // Fall through to legacy permission handling
          }
        }
      }

      // Legacy permission handling for older Android versions or fallback
      const granted = await PermissionsAndroid.request(permission as any, {
        title,
        message,
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Deny',
        buttonPositive: 'Allow',
      });

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permission Required',
          `${title.replace(' Permission', '')} access is needed for this feature. Please enable it manually in your device settings.\n\nGo to: Settings → Apps → DoIt → Permissions`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      } else {
        Alert.alert(
          'Permission Required',
          `${title.replace(' Permission', '')} access is needed for this feature. You can enable it in your device settings if you change your mind.`,
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.warn('Permission request failed:', error);
      Alert.alert(
        'Permission Error',
        'Unable to request permission. Please enable it manually in your device settings.\n\nGo to: Settings → Apps → DoIt → Permissions',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }
  };

  const pickImage = async () => {
    try {
      // Request gallery permissions for Android
      const hasPermission = await checkAndRequestPermission(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        'Gallery Permission',
        'This app needs access to your photos to attach images to tasks.'
      );

      if (!hasPermission) {
        return;
      }

      const options = {
        mediaType: 'photo' as MediaType,
        quality: 0.8 as const,
        includeBase64: false,
        selectionLimit: 1,
      };

      launchImageLibrary(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const attachedFile: AttachedFile = {
            uri: asset.uri!,
            type: 'image',
            name: asset.fileName || `image_${Date.now()}.jpg`,
            size: asset.fileSize || 0,
          };
          setFormData({ ...formData, attachedFile });
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const hasPermission = await checkAndRequestPermission(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        'Camera Permission',
        'This app needs access to your camera to take photos.'
      );

      if (!hasPermission) {
        return;
      }

      const options = {
        mediaType: 'photo' as MediaType,
        quality: 0.8 as const,
        includeBase64: false,
        maxWidth: 2000,
        maxHeight: 2000,
      };

      launchCamera(options, (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorMessage) {
          if (response.errorMessage.includes('timeout')) {
            Alert.alert(
              'Camera Timeout', 
              'The camera is taking longer than usual to open. This may be a device-specific issue.\n\nTips:\n• Try waiting a moment and tapping again\n• Lock and unlock your device\n• Close other apps using the camera\n• Restart the app if the issue persists',
              [
                { text: 'Try Again', onPress: () => takePhoto() },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          } else {
            Alert.alert('Error', `Failed to take photo: ${response.errorMessage}`);
          }
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const attachedFile: AttachedFile = {
            uri: asset.uri!,
            type: 'image',
            name: asset.fileName || `photo_${Date.now()}.jpg`,
            size: asset.fileSize || 0,
          };
          setFormData({ ...formData, attachedFile });
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert('Error', `Failed to take photo: ${errorMessage}`);
    }
  };

  const pickDocument = async () => {
    try {
      // Use the @react-native-documents/picker API
      const results = await pick({
        type: types.allFiles,
        allowMultiSelection: false,
      });

      if (results && results.length > 0) {
        const doc = results[0];
        const attachedFile: AttachedFile = {
          uri: doc.uri,
          type: 'document',
          name: doc.name || `document_${Date.now()}`,
          size: doc.size || 0,
        };
        setFormData({ ...formData, attachedFile });
      }
    } catch (error: any) {
      // Check if user cancelled the picker
      if (error?.userCancel || error?.message?.includes('cancelled') || error?.message?.includes('canceled')) {
        return;
      }
      console.log('Document picker error:', error);
      Alert.alert(
        'Document Selection Error',
        'Unable to select document. Please make sure you have access to the file and try again.\\n\\nYou can select PDFs, Word documents, and other file types.',
        [{ text: 'OK' }]
      );
    }
  };

  const removeAttachment = () => {
    setFormData({ ...formData, attachedFile: undefined });
  };

  const showAttachmentOptions = () => {
    setAttachmentOptionsVisible(true);
  };

  const handleAttachmentAction = (action: () => void) => {
    // Close the modal first, then perform the action to avoid UI conflicts
    setAttachmentOptionsVisible(false);
    // Increased delay to ensure modal is fully closed on all devices
    setTimeout(() => {
      action();
    }, 200);
  };

  const toggleNotificationOffset = (offset: number) => {
    const currentOffsets = formData.notificationOffsets;
    const isSelected = currentOffsets.includes(offset);

    if (isSelected) {
      setFormData({
        ...formData,
        notificationOffsets: currentOffsets.filter(o => o !== offset),
      });
    } else {
      setFormData({
        ...formData,
        notificationOffsets: [...currentOffsets, offset].sort((a, b) => a - b),
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
        {/* Title */}
        <View style={styles.section}>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter task title"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Enter task description (optional)"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Due Date Toggle */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Due Date</Text>
            <Switch
              value={hasDueDate}
              onValueChange={(value) => {
                setHasDueDate(value);
                if (!value) {
                  // Preserve current values when turning off
                  setPreservedDueDate(formData.dueDate);
                  setPreservedDueTime(formData.dueTime);
                  setPreservedNotifications(formData.notificationOffsets);
                  setPreservedAlarm(hasAlarm);
                  
                  setFormData({
                    ...formData,
                    dueDate: undefined,
                    dueTime: undefined,
                    notificationOffsets: [],
                    hasAlarm: false,
                  });
                  setHasAlarm(false);
                } else {
                  // Restore preserved values when turning back on
                  setFormData({
                    ...formData,
                    dueDate: preservedDueDate,
                    dueTime: preservedDueTime,
                    notificationOffsets: preservedNotifications,
                    hasAlarm: preservedAlarm,
                  });
                  setHasAlarm(preservedAlarm);
                }
              }}
            />
          </View>
        </View>

        {/* Date and Time Pickers */}
        {hasDueDate && (
          <View style={styles.section}>
            <Text style={styles.label}>Date & Time</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[styles.dateButton, styles.halfWidth]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formData.dueDate
                    ? formData.dueDate.toLocaleDateString()
                    : 'Select Date'
                  }
                </Text>
                <IconComponent name={getIconName('calendar-outline')} size={20} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateButton, styles.halfWidth]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formData.dueTime
                    ? formData.dueTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Select Time'
                  }
                </Text>
                <IconComponent name={getIconName('time-outline')} size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notifications */}
        {hasDueDate && (
          <>
            {/* Alarm Toggle */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Alarm</Text>
                <Switch
                  value={hasAlarm}
                  onValueChange={(value) => {
                    setHasAlarm(value);
                    setFormData({ ...formData, hasAlarm: value });
                  }}
                />
              </View>
              {hasAlarm && formData.notificationOffsets.length > 0 && (
                <Text style={styles.alarmDescription}>
                  🔊 Audible alarm will sound at notification times
                </Text>
              )}
              {hasAlarm && formData.notificationOffsets.length === 0 && (
                <Text style={styles.alarmDescription}>
                  🔊 Audible alarm will sound at due time
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Notifications</Text>
              <View style={styles.notificationGrid}>
                {NOTIFICATION_OPTIONS.map((option) => {
                  const isSelected = formData.notificationOffsets.includes(option.value);
                  return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.notificationChip,
                      isSelected && styles.notificationChipSelected,
                    ]}
                    onPress={() => toggleNotificationOffset(option.value)}
                  >
                    <Text
                      style={[
                        styles.notificationChipText,
                        isSelected && styles.notificationChipTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          </>
        )}

        {/* Repeat Pattern */}
        <View style={styles.section}>
          <Text style={styles.label}>Repeat</Text>
          <View style={styles.repeatGrid}>
            {REPEAT_OPTIONS.map((option) => {
              const isSelected = formData.repeatPattern === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.repeatChip,
                    isSelected && styles.repeatChipSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, repeatPattern: option.value })}
                >
                  <Text
                    style={[
                      styles.repeatChipText,
                      isSelected && styles.repeatChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom Weekday Selection */}
        {formData.repeatPattern === 'custom' && (
          <View style={styles.section}>
            <Text style={styles.label}>Select Days</Text>
            <View style={styles.weekdayContainer}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                const isSelected = customDays.includes(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.weekdayCircle,
                      isSelected && styles.weekdayCircleSelected,
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setCustomDays(customDays.filter(d => d !== index));
                      } else {
                        setCustomDays([...customDays, index].sort());
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.weekdayText,
                        isSelected && styles.weekdayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* File Attachment */}
        <View style={styles.section}>
          {formData.attachedFile ? (
            <View style={styles.attachmentContainer}>
              {formData.attachedFile.type === 'image' ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: formData.attachedFile.uri }}
                    style={styles.attachmentPreview}
                    resizeMode="cover"
                  />
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {formData.attachedFile.name}
                    </Text>
                    <Text style={styles.attachmentSize}>
                      {formData.attachedFile.size ? `${(formData.attachedFile.size / 1024).toFixed(1)} KB` : 'Image'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.documentContainer}>
                  <IconComponent name={getIconName('document-outline')} size={40} color={colors.primary} />
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {formData.attachedFile.name}
                    </Text>
                    <Text style={styles.attachmentSize}>
                      {formData.attachedFile.size ? `${(formData.attachedFile.size / 1024).toFixed(1)} KB` : 'Document'}
                    </Text>
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={removeAttachment}
              >
                <IconComponent name={getIconName('close-circle')} size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.attachButton}
              onPress={showAttachmentOptions}
            >
              <IconComponent name={getIconName('attach-outline')} size={24} color={colors.primary} />
              <Text style={styles.attachButtonText}>Add attachment</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Attachment Options Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={attachmentOptionsVisible}
        onRequestClose={() => setAttachmentOptionsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setAttachmentOptionsVisible(false)} />
          <View style={[
            styles.bottomSheet,
            { paddingBottom: 16 + (insets.bottom > 0 ? insets.bottom : 0) }
          ]}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleAttachmentAction(takePhoto)}
            >
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleAttachmentAction(pickImage)}
            >
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleAttachmentAction(pickDocument)}
            >
              <Text style={styles.optionText}>Choose Document</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setAttachmentOptionsVisible(false)}
            >
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dueDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={formData.dueTime || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      </ScrollView>

      {/* Sticky Buttons */}
      <View style={[
        styles.stickyButtonContainer,
        { paddingBottom: 16 + (insets.bottom > 0 ? insets.bottom : 0) }
      ]}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for sticky buttons
  },
  form: {
    padding: 16,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  // Modal / Bottom Sheet styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelModalButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  descriptionInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  alarmDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
  },
  notificationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  notificationChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  notificationChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  notificationChipText: {
    fontSize: 14,
    color: '#666',
  },
  notificationChipTextSelected: {
    color: '#fff',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: 4,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  attachButtonText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  weekdayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  weekdayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  weekdayTextSelected: {
    color: 'white',
  },
  repeatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repeatChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  repeatChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  repeatChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  repeatChipTextSelected: {
    color: 'white',
  },
});
