import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MainTabParamList, RootStackParamList } from './types/Navigation';
import { Task } from './types/Task';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Import components (we'll create these next)
import TodoScreen from './screens/TodoScreen';
import CompletedScreen from './screens/CompletedScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import TaskFormScreen from './screens/TaskFormScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
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
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Todo') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Completed') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Todo"
        component={TodoScreen}
        options={{
          title: 'To-Do',
        }}
      />
      <Tab.Screen
        name="Completed"
        component={CompletedScreen}
        options={{
          title: 'Completed',
        }}
      />
    </Tab.Navigator>
  );
}

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
          component={MainTabs}
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
