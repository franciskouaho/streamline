import React from 'react';
import { Stack } from 'expo-router';
import NotificationManagement from '../components/NotificationManagement';

export default function NotificationManagementPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Paramètres des notifications",
          headerShown: true,
        }}
      />
      <NotificationManagement />
    </>
  );
}