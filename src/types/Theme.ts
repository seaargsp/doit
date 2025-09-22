export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // UI colors
  primary: string;
  primaryLight: string;
  border: string;
  separator: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  
  // Task specific colors
  taskComplete: string;
  taskOverdue: string;
  taskDue: string;
}

export const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  
  text: '#000000',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  
  primary: '#007AFF',
  primaryLight: '#E3F2FD',
  border: '#E5E7EB',
  separator: '#F3F4F6',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  taskComplete: '#10B981',
  taskOverdue: '#EF4444',
  taskDue: '#F59E0B',
};

export const darkTheme: ThemeColors = {
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',
  
  text: '#FFFFFF',
  textSecondary: '#98A2B3',
  textMuted: '#6B7280',
  
  primary: '#0A84FF',
  primaryLight: '#1E3A8A',
  border: '#374151',
  separator: '#2D3748',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  taskComplete: '#10B981',
  taskOverdue: '#EF4444',
  taskDue: '#F59E0B',
};
