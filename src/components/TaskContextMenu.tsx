import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface TaskContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  taskTitle: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TaskContextMenu({
  visible,
  onClose,
  onEdit,
  onDelete,
  taskTitle,
}: TaskContextMenuProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const handleDelete = () => {
    onClose();
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  const handleEdit = () => {
    onClose();
    onEdit();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
            <Text style={[styles.menuItemText, styles.editText]}>Edit</Text>
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={20} color={colors.error} />
            <Text style={[styles.menuItemText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: colors.card,
    borderRadius: 12,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  editText: {
    color: colors.primary,
  },
  deleteText: {
    color: colors.error,
  },
  separator: {
    height: 1,
    backgroundColor: colors.separator,
    marginHorizontal: 20,
  },
});
