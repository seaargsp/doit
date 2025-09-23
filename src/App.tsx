import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStackParamList } from './types/Navigation';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

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
            title: 'Task Details',
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
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
