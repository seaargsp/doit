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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../types/Navigation';
import { Task, TaskFormData, RepeatPattern, NOTIFICATION_OPTIONS, REPEAT_OPTIONS } from '../types/Task';
import { StorageService } from '../services/StorageService';
import { NotificationService } from '../services/NotificationService';
import { TaskUtils } from '../utils/TaskUtils';

type TaskFormScreenProps = {
  route: RouteProp<RootStackParamList, 'TaskForm'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskForm'>;
};

export default function TaskFormScreen({ route, navigation }: TaskFormScreenProps) {
  const { taskId, mode } = route.params;
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: undefined,
    dueTime: undefined,
    notificationOffsets: [],
    repeatPattern: 'none',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && taskId) {
      loadTask();
    }
  }, [isEditMode, taskId]);

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
        });
        setHasDueDate(!!task.dueDateTime);
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
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
          <Text style={styles.label}>Description</Text>
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
                  setFormData({
                    ...formData,
                    dueDate: undefined,
                    dueTime: undefined,
                  });
                }
              }}
            />
          </View>
        </View>

        {/* Date and Time Pickers */}
        {hasDueDate && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formData.dueDate
                    ? formData.dueDate.toLocaleDateString()
                    : 'Select Date'
                  }
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
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
                <Ionicons name="time-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Notifications */}
        {hasDueDate && (
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
        )}

        {/* Repeat Pattern */}
        <View style={styles.section}>
          <Text style={styles.label}>Repeat</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.repeatPattern}
              onValueChange={(value: RepeatPattern) =>
                setFormData({ ...formData, repeatPattern: value })
              }
              style={styles.picker}
            >
              {REPEAT_OPTIONS.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    minHeight: 80,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
