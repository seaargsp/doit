import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { ThemeColors, lightTheme, darkTheme } from '../types/Theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  
  // Determine if we should use dark theme
  const isDark = mode === 'system' 
    ? systemColorScheme === 'dark'
    : mode === 'dark';
  
  // Get current colors based on theme
  const colors = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    colors,
    mode,
    isDark,
    setMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
