// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ProfileScreen from '../screens/ProfileScreen.tsx';
import AddMeasurementScreen from '../screens/AddMeasurementScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ChartScreen from '../screens/ChartScreen';
import EditMeasurementScreen from '../screens/EditMeasurementScreen';
import { useAppContext } from '../store';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** Stack for Add tab - we keep just Add for now but stack can hold other screens */
function AddStack() {
  return (
    <Stack.Navigator id="AddStackNavigator">
      <Stack.Screen name="Add" component={AddMeasurementScreen} />
    </Stack.Navigator>
  );
}

/** Stack for History tab (list + edit) */
function HistoryStack() {
  return (
    <Stack.Navigator id="HistoryStackNavigator">
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="EditMeasurement" component={EditMeasurementScreen} options={{ title: 'Edit Measurement' }} />
    </Stack.Navigator>
  );
}

/** Chart stack (could add detail later) */
function ChartStack() {
  return (
    <Stack.Navigator id="ChartStackNavigator">
      <Stack.Screen name="Chart" component={ChartScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  // optional: read app state to show something in header or guard navigation
  const { babyProfile } = useAppContext();

  return (
    <NavigationContainer>
      <Tab.Navigator
        id="BottomTabNavigator"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
        <Tab.Screen name="Add" component={AddStack} options={{ tabBarLabel: 'Add' }} />
        <Tab.Screen name="History" component={HistoryStack} options={{ tabBarLabel: 'History' }} />
        <Tab.Screen name="Charts" component={ChartStack} options={{ tabBarLabel: 'Charts' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
