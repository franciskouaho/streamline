import React from 'react';
import { Stack } from 'expo-router';
import NotificationManagementScreen from '../../components/NotificationManagementScreen';

export default function NotificationManagementPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Paramètres des notifications",
          headerShown: true,
        }}
      />
      <NotificationManagementScreen />
    </>
  );
}
