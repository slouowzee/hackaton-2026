/**
 * Tabs Layout
 *
 * Defines the tab navigation structure for the application.
 * Specifies the screens available in the tab bar and their appearance.
 */
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from 'tamagui';

/**
 * TabBarIcon Component
 *
 * Renders an icon for the tab bar using FontAwesome.
 *
 * @param {object} props - The component props.
 * @param {string} props.name - The name of the FontAwesome icon.
 * @param {string} props.color - The color of the icon.
 * @returns {JSX.Element} The rendered icon component.
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

/**
 * TabLayout Component
 *
 * Configures the tab navigator, including styles and screen definitions.
 *
 * @returns {JSX.Element} The rendered tab layout component.
 */
export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 90,
            paddingTop: 10,
            paddingBottom: 30,
            backgroundColor: 'white',
        },
        tabBarLabelStyle: {
            fontFamily: 'Montserrat',
            fontSize: 10,
            fontWeight: '600',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tableau de bord',
          tabBarIcon: ({ color }) => <TabBarIcon name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
