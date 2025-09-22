import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types/Task';
import { TaskUtils } from '../utils/TaskUtils';
import { useTheme } from '../contexts/ThemeContext';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onLongPress: () => void;
  onToggleComplete: () => void;
  showCompleted?: boolean;
}

export default function TaskItem({
  task,
  onPress,
  onLongPress,
  onToggleComplete,
  showCompleted = false,
}: TaskItemProps) {
  const { colors } = useTheme();
  const isCompleted = TaskUtils.isCompleted(task);
  const isOverdue = task.dueDateTime && !isCompleted && TaskUtils.isOverdue(task.dueDateTime);
  const styles = createStyles(colors);

  const handleCheckboxPress = () => {
    if (showCompleted && isCompleted) {
      // Don't allow uncompleting from completed tab
      return;
    }
    onToggleComplete();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCompleted && styles.completedContainer,
        isOverdue && styles.overdueContainer,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={handleCheckboxPress}
        disabled={showCompleted && isCompleted}
      >
        <Ionicons
          name={isCompleted ? 'checkbox' : 'checkbox-outline'}
          size={24}
          color={isCompleted ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            isCompleted && styles.completedText,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {task.description && (
          <Text
            style={[
              styles.description,
              isCompleted && styles.completedText,
            ]}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        )}

        <View style={styles.metaInfo}>
          {task.dueDateTime && (
            <View style={styles.dueDateContainer}>
              <Ionicons
                name="time-outline"
                size={14}
                color={isOverdue ? colors.error : colors.textSecondary}
              />
              <Text
                style={[
                  styles.dueDate,
                  isOverdue && styles.overdueText,
                  isCompleted && styles.completedText,
                ]}
              >
                {TaskUtils.formatDueDate(task.dueDateTime)}
              </Text>
            </View>
          )}

          {task.repeatPattern !== 'none' && (
            <View style={styles.repeatContainer}>
              <Ionicons
                name="repeat-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={[styles.repeatText, isCompleted && styles.completedText]}>
                {task.repeatPattern}
              </Text>
            </View>
          )}

          {task.notificationOffsets && task.notificationOffsets.length > 0 && (
            <View style={styles.notificationContainer}>
              <Ionicons
                name="notifications-outline"
                size={14}
                color={colors.textSecondary}
              />
            </View>
          )}
        </View>

        {showCompleted && task.completedAt && (
          <Text style={styles.completedDate}>
            Completed {TaskUtils.formatDueDate(task.completedAt)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    alignItems: 'flex-start',
  },
  completedContainer: {
    backgroundColor: colors.surface,
  },
  overdueContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  overdueText: {
    color: colors.error,
    fontWeight: '500',
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  repeatText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  notificationContainer: {
    marginRight: 12,
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
