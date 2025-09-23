import React, { useState } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface SwipeableTabsProps {
  children: React.ReactNode[];
  tabNames: string[];
  tabIcons: string[];
  onTabChange?: (index: number) => void;
  initialTab?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SwipeableTabs: React.FC<SwipeableTabsProps> = ({
  children,
  tabNames,
  tabIcons,
  onTabChange,
  initialTab = 0,
}) => {
  const { colors } = useTheme();
  const [currentTab, setCurrentTab] = useState(initialTab);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const switchToTab = (index: number) => {
    if (index === currentTab) return;
    
    setCurrentTab(index);
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
    onTabChange?.(index);
  };

  const handleScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    
    if (index !== currentTab) {
      setCurrentTab(index);
      onTabChange?.(index);
    }
  };

  return (
    <View style={styles.container}>
      {/* Swipeable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentOffset={{ x: initialTab * SCREEN_WIDTH, y: 0 }}
      >
        {children.map((child, index) => (
          <View key={index} style={styles.page}>
            {child}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { backgroundColor: colors.surface }]}>
        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {children.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentTab ? colors.primary : colors.border,
                },
              ]}
              onPress={() => switchToTab(index)}
            />
          ))}
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, { borderTopColor: colors.border }]}>
          {tabNames.map((name, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tab}
              onPress={() => switchToTab(index)}
            >
              <Ionicons
                name={tabIcons[index] as any}
                size={28}
                color={index === currentTab ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: index === currentTab ? colors.primary : colors.textMuted,
                    fontSize: 13,
                    fontWeight: index === currentTab ? '600' : '400',
                  },
                ]}
              >
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  bottomSection: {
    paddingTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    marginTop: 2,
  },
});