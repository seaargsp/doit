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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { RootStackParamList } from '../types/Navigation';
import { Task, TaskFormData, RepeatPattern, NOTIFICATION_OPTIONS, REPEAT_OPTIONS, AttachedFile } from '../types/Task';
import { StorageService } from '../services/StorageService';
import { NotificationService } from '../services/NotificationService';
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

  const IconComponent = getIconComponent();

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: undefined,
    dueTime: undefined,
    notificationOffsets: [],
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
          repeatPattern: task.repeatPattern,
          attachedFile: task.attachedFile,
        });
        setHasDueDate(!!task.dueDateTime);
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
      } else {
        // Create new task
        const newTask: Task = {
          id: TaskUtils.generateId(),
          createdAt: new Date().toISOString(),
          ...taskData,
        };

        await StorageService.addTask(newTask);
        await NotificationService.scheduleTaskNotifications(newTask);
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

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to attach images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const attachedFile: AttachedFile = {
          uri: asset.uri,
          type: 'image',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize,
        };
        setFormData({ ...formData, attachedFile });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const attachedFile: AttachedFile = {
          uri: asset.uri,
          type: 'image',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize,
        };
        setFormData({ ...formData, attachedFile });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const attachedFile: AttachedFile = {
          uri: asset.uri,
          type: 'document',
          name: asset.name,
          size: asset.size,
        };
        setFormData({ ...formData, attachedFile });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removeAttachment = () => {
    setFormData({ ...formData, attachedFile: undefined });
  };

  const showAttachmentOptions = () => {
    // Defer open by one tick so the original press doesn't propagate into the overlay
    setTimeout(() => setAttachmentOptionsVisible(true), 0);
  };

  const handleAttachmentAction = (action: () => void) => {
    // Close the modal first, then perform the action to avoid UI conflicts
    setAttachmentOptionsVisible(false);
    setTimeout(() => action(), 120);
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
                  
                  setFormData({
                    ...formData,
                    dueDate: undefined,
                    dueTime: undefined,
                    notificationOffsets: [],
                  });
                } else {
                  // Restore preserved values when turning back on
                  setFormData({
                    ...formData,
                    dueDate: preservedDueDate,
                    dueTime: preservedDueTime,
                    notificationOffsets: preservedNotifications,
                  });
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
                  onValueChange={setHasAlarm}
                />
              </View>
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
          <View style={styles.bottomSheet}>
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
      <View style={styles.stickyButtonContainer}>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
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
