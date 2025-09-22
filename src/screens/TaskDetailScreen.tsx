import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../types/Navigation';
import { Task, NOTIFICATION_OPTIONS } from '../types/Task';
import { StorageService } from '../services/StorageService';
import { NotificationService } from '../services/NotificationService';
import { TaskUtils } from '../utils/TaskUtils';

type TaskDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'TaskDetail'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;
};

export default function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [taskId]);

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
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task');
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
        <View style={styles.notificationList}>
          {task.notificationOffsets.map((offset) => {
            const option = NOTIFICATION_OPTIONS.find(opt => opt.value === offset);
            return (
              <View key={offset} style={styles.notificationItem}>
                <Ionicons name="notifications-outline" size={16} color="#666" />
                <Text style={styles.notificationText}>
                  {option ? option.label : `${offset} minutes`} before
                </Text>
              </View>
            );
          })}
        </View>
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
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
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
              <Ionicons
                name="time-outline"
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
            <View style={styles.repeatContainer}>
              <Ionicons name="repeat-outline" size={20} color="#666" />
              <Text style={styles.repeatText}>
                {task.repeatPattern.charAt(0).toUpperCase() + task.repeatPattern.slice(1)}
              </Text>
            </View>
          </View>
        )}

        {/* Notifications */}
        {renderNotifications()}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
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

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!isCompleted && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkComplete}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.completeButtonText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={20} color="#007AFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 12,
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
});
