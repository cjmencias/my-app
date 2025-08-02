import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF', // Blue for active
        tabBarInactiveTintColor: '#8E8E93', // Light gray for inactive
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E5EA',
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: 25, // Safe area for iOS
            height: 85,
            position: 'relative', // Not absolute
          },
          default: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E5EA',
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: 8,
            height: 65,
            elevation: 8, // Android shadow
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          paddingHorizontal: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabel: ({ focused, children }) => (
          <Text style={{
            fontSize: 12,
            fontWeight: focused ? '700' : '500',
            color: focused ? '#007AFF' : '#8E8E93',
            textAlign: 'center',
            backgroundColor: 'transparent',
            marginTop: 2,
          }}>
            {children}
          </Text>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24}
              name="house.fill" 
              color={focused ? '#007AFF' : '#8E8E93'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24}
              name="paperplane.fill" 
              color={focused ? '#007AFF' : '#8E8E93'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
