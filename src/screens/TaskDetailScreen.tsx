import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../types/Navigation';
import { Task, NOTIFICATION_OPTIONS } from '../types/Task';
import { StorageService } from '../services/StorageService';
import { NotificationService } from '../services/NotificationService';
import { TaskUtils } from '../utils/TaskUtils';
import { getIconName, getIconComponent } from '../utils/IconUtils';
import { useTheme } from '../contexts/ThemeContext';

type TaskDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'TaskDetail'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;
};

export default function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
  const { taskId } = route.params;
  const { colors } = useTheme();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const styles = createStyles(colors);
  const IconComponent = getIconComponent();

  useEffect(() => {
    loadTask();
  }, [taskId]);

  // Update header with edit and delete buttons
  useEffect(() => {
    if (task) {
      navigation.setOptions({
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 10 }}>
            <TouchableOpacity
              onPress={handleEdit}
              style={{ marginRight: 15 }}
            >
              <IconComponent name={getIconName('pencil')} size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <IconComponent name={getIconName('trash')} size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [task, navigation, colors]);

  const loadTask = async () => {
    try {
      const taskData = await StorageService.getTaskById(taskId);
      setTask(taskData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load task');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!task) return;

    try {
      const isCompleted = !!task.completedAt;
      
      if (isCompleted) {
        // Undo completion
        const updatedTask: Task = {
          ...task,
          completedAt: undefined,
        };

        // Reschedule notifications if task has due date
        if (task.dueDateTime) {
          await NotificationService.scheduleTaskNotifications(updatedTask);
        }

        await StorageService.updateTask(updatedTask);
        setTask(updatedTask);
      } else {
        // Complete task
        const updatedTask: Task = {
          ...task,
          completedAt: new Date().toISOString(),
        };

        // Handle repeat pattern
        if (task.repeatPattern !== 'none') {
          const repeatingTask = TaskUtils.createRepeatingTask(task);
          await StorageService.addTask(repeatingTask);
          await NotificationService.scheduleTaskNotifications(repeatingTask);
        }

        // Cancel notifications for completed task
        await NotificationService.handleTaskCompletion(task.id, true);
        await StorageService.updateTask(updatedTask);
        
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleEdit = () => {
    navigation.navigate('TaskForm', { taskId: task!.id, mode: 'edit' });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task!.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.cancelTaskNotifications(task!.id);
              await StorageService.deleteTask(task!.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const renderDescription = () => {
    if (!task?.description) return null;

    // Simple URL detection
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = task.description.split(urlRegex);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <View style={styles.descriptionContainer}>
          {parts.map((part, index) => {
            if (urlRegex.test(part)) {
              return (
                <Text
                  key={index}
                  style={styles.link}
                  onPress={() => handleLinkPress(part)}
                >
                  {part}
                </Text>
              );
            }
            return (
              <Text key={index} style={styles.descriptionText}>
                {part}
              </Text>
            );
          })}
        </View>
      </View>
    );
  };

  const renderNotifications = () => {
    if (!task?.notificationOffsets || task.notificationOffsets.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.notificationChipsContainer}>
          {task.notificationOffsets.map((offset) => {
            const option = NOTIFICATION_OPTIONS.find(opt => opt.value === offset);
            return (
              <View key={offset} style={styles.notificationChip}>
                <Text style={styles.notificationChipText}>
                  {option ? option.label : `${offset} minutes`} before
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderAttachment = () => {
    if (!task?.attachedFile) {
      return null;
    }

    const { attachedFile } = task;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attachment</Text>
        {attachedFile.type === 'image' ? (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => setImageModalVisible(true)}
          >
            <Image
              source={{ uri: attachedFile.uri }}
              style={styles.attachmentImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <IconComponent name={getIconName('expand-outline')} size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.documentContainer}>
            <IconComponent name={getIconName('document-outline')} size={40} color={colors.primary} />
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentName} numberOfLines={2}>
                {attachedFile.name}
              </Text>
              <Text style={styles.attachmentSize}>
                {attachedFile.size ? `${(attachedFile.size / 1024).toFixed(1)} KB` : 'Document'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  const isCompleted = TaskUtils.isCompleted(task);
  const isOverdue = task.dueDateTime && !isCompleted && TaskUtils.isOverdue(task.dueDateTime);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={[styles.title, isCompleted && styles.completedText]}>
            {task.title}
          </Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <IconComponent name={getIconName('checkmark-circle')} size={24} color="#34C759" />
            </View>
          )}
        </View>

        {/* Description */}
        {renderDescription()}

        {/* Due Date */}
        {task.dueDateTime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Due Date</Text>
            <View style={styles.dueDateContainer}>
              <IconComponent
                name={getIconName('time-outline')}
                size={20}
                color={isOverdue ? '#FF3B30' : '#666'}
              />
              <Text
                style={[
                  styles.dueDateText,
                  isOverdue && styles.overdueText,
                ]}
              >
                {TaskUtils.formatDueDate(task.dueDateTime)}
              </Text>
            </View>
          </View>
        )}

        {/* Repeat Pattern */}
        {task.repeatPattern !== 'none' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repeat</Text>
            {task.repeatPattern === 'custom' ? (
              <View>
                <View style={styles.repeatChip}>
                  <Text style={styles.repeatChipText}>Custom</Text>
                </View>
                <View style={styles.weekdayContainer}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                    const isSelected = task.customDays?.includes(index) || false;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.weekdayCircle,
                          isSelected && styles.weekdayCircleSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.weekdayText,
                            isSelected && styles.weekdayTextSelected,
                          ]}
                        >
                          {day}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.repeatChip}>
                <Text style={styles.repeatChipText}>
                  {task.repeatPattern.charAt(0).toUpperCase() + task.repeatPattern.slice(1)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Notifications */}
        {renderNotifications()}

        {/* Attachment */}
        {renderAttachment()}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.metadataText}>
            Created: {TaskUtils.formatDueDate(task.createdAt)}
          </Text>
          {task.completedAt && (
            <Text style={styles.metadataText}>
              Completed: {TaskUtils.formatDueDate(task.completedAt)}
            </Text>
          )}
        </View>
      </View>

      {/* Complete/Undo Button at Bottom */}
      <View style={styles.bottomButtonContainer}>
        {!isCompleted ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkComplete}
          >
            <IconComponent name={getIconName('checkmark-circle-outline')} size={20} color="#fff" />
            <Text style={styles.completeButtonText}>Complete Task</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.undoButton}
            onPress={handleMarkComplete}
          >
            <IconComponent name={getIconName('arrow-undo-outline')} size={20} color="#fff" />
            <Text style={styles.undoButtonText}>Undo Completed</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            onPress={() => setImageModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setImageModalVisible(false)}
              >
                <IconComponent name="close" size={30} color="#fff" />
              </TouchableOpacity>
              {task?.attachedFile?.type === 'image' && (
                <Image
                  source={{ uri: task.attachedFile.uri }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 12,
    lineHeight: 34,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  completedBadge: {
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  descriptionContainer: {
    paddingVertical: 4,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textSecondary, // Lighter color as requested
    lineHeight: 22,
  },
  link: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dueDateText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  overdueText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  repeatText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  notificationList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  bottomButtonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  completeButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  undoButton: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  undoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  // Attachment styles
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 6,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 8,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: '#666',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    position: 'relative',
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 6,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  // New repeat chip styles
  repeatChip: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  repeatChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  // Weekday display styles
  weekdayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
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
  // New notification chip styles
  notificationChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  notificationChip: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationChipText: {
    fontSize: 14,
    color: colors.text,
  },
});
