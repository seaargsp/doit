import { Platform } from 'react-native';

// Icon mapping for MaterialDesignIcons (MaterialCommunityIcons)
export const iconMap = {
  // Calendar/Date icons
  'calendar-outline': 'calendar-outline',
  'calendar': 'calendar',
  
  // Time icons
  'time-outline': 'clock-outline',
  'time': 'clock',
  
  // Attachment icons
  'attach-outline': 'attachment',
  'attach': 'attachment',
  
  // Document icons
  'document-outline': 'file-document-outline',
  'document': 'file-document',
  
  // Close icons
  'close-circle': 'close-circle',
  'close': 'close',
  
  // Task status icons
  'checkbox-multiple-blank-circle': 'checkbox-multiple-blank-circle',
  'checkbox-multiple-marked-circle': 'checkbox-multiple-marked-circle',
  'checkmark-circle': 'check-circle',
  'checkmark-circle-outline': 'check-circle-outline',
  
  // Image icons
  'image-outline': 'image-outline',
  'image': 'image',
  
  // Edit/Action icons
  'pencil': 'pencil',
  'trash': 'delete',
  'expand-outline': 'fullscreen',
  'repeat-outline': 'repeat',
  'arrow-undo-outline': 'undo',
  
  // Notification icons
  'notifications-outline': 'bell-outline',
  'notifications': 'bell',
};

/**
 * Get the correct icon name for MaterialDesignIcons
 */
export const getIconName = (iconName: keyof typeof iconMap): string => {
  return iconMap[iconName] || iconName;
};

/**
 * Get MaterialCommunityIcons component (MaterialDesignIcons)
 */
export const getIconComponent = () => {
  return require('react-native-vector-icons/MaterialCommunityIcons').default;
};