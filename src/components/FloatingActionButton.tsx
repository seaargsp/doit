import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

interface FloatingActionButtonProps {
  onPress: () => void;
  visible?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  visible = true,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  // Calculate dynamic bottom position based on safe area
  const bottomPosition = 88 + (insets.bottom > 0 ? insets.bottom : 0);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          shadowColor: colors.text,
          bottom: bottomPosition,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name="plus" size={28} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});