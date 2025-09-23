import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SwipeableTabs } from '../components/SwipeableTabs';
import { FloatingActionButton } from '../components/FloatingActionButton';
import TodoScreen from './TodoScreen';
import CompletedScreen from './CompletedScreen';
import { RootStackParamList } from '../types/Navigation';
import { getIconName } from '../utils/IconUtils';

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MainScreen() {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [currentTab, setCurrentTab] = useState(0);

  const handleAddTask = () => {
    navigation.navigate('TaskForm', { mode: 'create' });
  };

  // Show FAB only on Todo and Completed tabs (not in detail/form screens)
  const showFAB = true;

  return (
    <View style={styles.container}>
      <SwipeableTabs
        tabNames={['To-Do', 'Completed']}
        tabIcons={[getIconName('checkbox-multiple-blank-circle'), getIconName('checkbox-multiple-marked-circle')]}
        onTabChange={setCurrentTab}
      >
        <TodoScreen />
        <CompletedScreen />
      </SwipeableTabs>
      
      <FloatingActionButton 
        onPress={handleAddTask}
        visible={showFAB}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});