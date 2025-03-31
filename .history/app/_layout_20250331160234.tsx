import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

export default function RootLayout() {
  useEffect(() => {
    // Masquer le splash screen une fois que le composant est monté
    SplashScreen.hideAsync();
  }, []);

  // Rediriger vers la page login
  return (
    <>
      <Stack />
      <Redirect href="/login" />
    </>
  );
}