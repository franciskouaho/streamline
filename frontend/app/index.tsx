import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/auth';

export default function Index() {
  // Vérifier si l'application est chargée et récupérer l'état d'authentification
  const { isLoading } = useAuthStore();
  const [redirectReady, setRedirectReady] = useState(false);

  useEffect(() => {
    // Court délai pour éviter les problèmes de redirection trop rapide
    const timer = setTimeout(() => {
      setRedirectReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Afficher un indicateur de chargement si l'app n'est pas prête ou si on est en train de charger l'auth
  if (isLoading || !redirectReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff7a5c" />
      </View>
    );
  }

  // Toujours rediriger vers l'écran splash
  return <Redirect href="/splash" />;
}
