import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import { useApp } from './context/AppContext';
import { LandingScreen } from './screens/landing/LandingScreen';
import { ScheduleScreen } from './screens/schedule/ScheduleScreen';
import { AssignmentsScreen } from './screens/schedule/AssignmentsScreen';
import { InputScreen } from './screens/input/InputScreen';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { Colors, Typography } from './styles/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Schedule: '📅',
    Assignments: '📋',
    Settings: '⚙️',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[name] ?? '•'}</Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          paddingBottom: 4,
        },
        tabBarLabelStyle: { ...Typography.caption, fontSize: 11 },
        headerStyle: { backgroundColor: Colors.background, shadowColor: 'transparent', elevation: 0 },
        headerTintColor: Colors.accent,
        headerTitleStyle: { ...Typography.bodyPrimary, color: Colors.textPrimary, fontWeight: '600' },
      })}
    >
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{ title: 'Assignments' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Landing" component={LandingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="AddAssignment"
              component={InputScreen}
              options={{
                headerShown: true,
                headerTitle: 'Assignment',
                headerBackTitle: 'Back',
                headerStyle: { backgroundColor: Colors.background },
                headerTintColor: Colors.accent,
                headerTitleStyle: { ...Typography.bodyPrimary, fontWeight: '600' },
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
