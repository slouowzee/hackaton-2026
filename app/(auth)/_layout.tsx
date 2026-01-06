import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'tamagui';

import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />;
}

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const activeColor = '#10b981';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
            height: 90,
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            paddingBottom: 10,
            paddingTop: 10,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
            fontFamily: 'Montserrat',
            fontSize: 10,
            marginBottom: 5,
        },
      }}>
      <Tabs.Screen
        name="login"
        options={{
          title: 'Connexion',
          tabBarIcon: ({ color, focused }) => (
            <View 
                backgroundColor={focused ? '#f0fdf4' : 'transparent'} 
                borderRadius="$4"
                alignItems="center"
                justifyContent="center"
                height={35}
                width={35}
            >
                <TabBarIcon name="sign-in" color={focused ? activeColor : '#9ca3af'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: 'Inscription',
          tabBarIcon: ({ color, focused }) => (
            <View 
                backgroundColor={focused ? '#f0fdf4' : 'transparent'} 
                borderRadius="$4"
                alignItems="center"
                justifyContent="center"
                height={35}
                width={35}
            >
                <TabBarIcon name="user-plus" color={focused ? activeColor : '#9ca3af'} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
