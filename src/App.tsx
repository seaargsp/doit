import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStackParamList } from './types/Navigation';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationService } from './services/NotificationService';
import { AlarmService } from './services/AlarmService';
import * as Notifications from 'expo-notifications';

// Import components
import MainScreen from './screens/MainScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import TaskFormScreen from './screens/TaskFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { colors, isDark } = useTheme();
  
  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
    fonts: DefaultTheme.fonts,
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{
            title: '',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={({ route }) => ({
            title: route.params?.mode === 'edit' ? 'Edit Task' : 'New Task',
            headerBackTitle: '',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize notification service on app startup
    NotificationService.initialize();

    // Handle notification interactions (for alarm dismissal)
    const subscription = Notifications.addNotificationResponseReceivedListener(async response => {
      const notification = response.notification;
      const data = notification.request.content.data;
      const actionId = response.actionIdentifier;
      
      // Handle explicit dismiss action button
      if (actionId === 'DISMISS_ALARM' && data?.taskId) {
        AlarmService.cancelTaskAlarms(data.taskId as string);
        try { await NotificationService.cancelTaskNotifications(data.taskId as string); } catch {}
        return;
      }

      if (data?.type === 'alarm' && data?.taskId) {
        // User interacted with alarm notification - dismiss the alarm
        AlarmService.cancelTaskAlarms(data.taskId as string);
        // Also cancel any scheduled alarm notifications/echo sounds
        try {
          await NotificationService.cancelTaskNotifications(data.taskId as string);
        } catch {}
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
