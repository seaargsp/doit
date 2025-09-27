import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Task } from '../types/Task';
import { RootStackParamList } from '../types/Navigation';
import { StorageService } from '../services/StorageService';
import { NotificationService } from '../services/NotificationService';
import { AlarmService } from '../services/AlarmService';
import { TaskUtils } from '../utils/TaskUtils';
import { useTheme } from '../contexts/ThemeContext';
import SearchHeader from '../components/SearchHeader';
import TaskItem from '../components/TaskItem';
import TaskContextMenu from '../components/TaskContextMenu';

type TodoScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TodoScreen() {
  const navigation = useNavigation<TodoScreenNavigationProp>();
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  const loadTasks = async () => {
    try {
      const allTasks = await StorageService.getTasks();
      const todoTasks = allTasks.filter(task => TaskUtils.shouldShowInTodoTab(task));
      const sortedTasks = TaskUtils.sortForTodoTab(todoTasks);
      setTasks(sortedTasks);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const filteredTasks = TaskUtils.filterBySearch(tasks, searchQuery);

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleTaskLongPress = (task: Task) => {
    setSelectedTask(task);
    setContextMenuVisible(true);
  };

  const handleEditTask = () => {
    if (selectedTask) {
      navigation.navigate('TaskForm', { taskId: selectedTask.id, mode: 'edit' });
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      await NotificationService.cancelTaskNotifications(selectedTask.id);
      await AlarmService.cancelTaskAlarms(selectedTask.id);
      await StorageService.deleteTask(selectedTask.id);
      await loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask: Task = {
        ...task,
        completedAt: TaskUtils.isCompleted(task) ? undefined : new Date().toISOString(),
      };

      // Handle repeat pattern
      if (!TaskUtils.isCompleted(task) && task.repeatPattern !== 'none') {
        const repeatingTask = TaskUtils.createRepeatingTask(task);
        await StorageService.addTask(repeatingTask);
        await NotificationService.scheduleTaskNotifications(repeatingTask);
      }

      // Handle notifications for completed task
      if (!TaskUtils.isCompleted(task)) {
        await NotificationService.handleTaskCompletion(task.id, true);
        await AlarmService.cancelTaskAlarms(task.id);
      }

      await StorageService.updateTask(updatedTask);
      await loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onPress={() => handleTaskPress(item)}
      onLongPress={() => handleTaskLongPress(item)}
      onToggleComplete={() => handleToggleComplete(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No tasks found</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery ? 'Try adjusting your search' : 'Tap + to add your first task'}
      </Text>
    </View>
  );

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search tasks..."
      />

      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <TaskContextMenu
        visible={contextMenuVisible}
        onClose={() => setContextMenuVisible(false)}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        taskTitle={selectedTask?.title || ''}
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
