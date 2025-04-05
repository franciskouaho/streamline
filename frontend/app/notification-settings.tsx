import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchNotificationSettings, updateNotificationSettings, sendTestNotification } from '@/services/notifications';
import { useAuthStore } from '@/stores/auth'; // Remplacer par le store Zustand
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationSettings() {
  const { translations } = useLanguage();
  const router = useRouter();
  const { user } = useAuthStore(); // Utiliser directement le store au lieu du contexte
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    task_assigned: true,
    task_deadline: true,
    task_comment: true,
    project_update: true,
    team_message: true,
    app_updates: true,
    subscription_alerts: true,
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "07:00",
  });
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    loadSettings();
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token || ''));
  }, []);

  const loadSettings = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await fetchNotificationSettings(user.id);
      setSettings(data);
    } catch (error) {
      console.error("Failed to load notification settings:", error);
      Alert.alert(
        "Erreur",
        translations.errors.loadNotificationSettings
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitch = async (key: keyof typeof settings) => {
    if (!user?.id) return;
    
    try {
      const updatedSettings = { ...settings, [key]: !settings[key] };
      setSettings(updatedSettings);
      
      await updateNotificationSettings(user.id, { [key]: !settings[key] });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      Alert.alert(
        "Erreur",
        translations.errors.updateNotificationSettings
      );
      // Revenir à l'état précédent en cas d'erreur
      loadSettings();
    }
  };

  const sendTestPush = async () => {
    if (!user?.id || !expoPushToken) {
      Alert.alert(
        "Erreur",
        translations.errors.tokenUnavailable
      );
      return;
    }
    
    try {
      await sendTestNotification(user.id, expoPushToken);
      Alert.alert(
        "Succès",
        translations.errors.testNotificationSuccess
      );
    } catch (error) {
      console.error("Failed to send test notification:", error);
      Alert.alert(
        "Erreur",
        translations.errors.sendTestNotification
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {translations.settings.notifications}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ff7a5c" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {translations.settings.notifications}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {translations.notifications.projectActivities}
          </Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Attribution de tâches</Text>
            <Switch
              value={settings.task_assigned}
              onValueChange={() => toggleSwitch('task_assigned')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Rappels d'échéance</Text>
            <Switch
              value={settings.task_deadline}
              onValueChange={() => toggleSwitch('task_deadline')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Commentaires sur les tâches</Text>
            <Switch
              value={settings.task_comment}
              onValueChange={() => toggleSwitch('task_comment')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Mises à jour des projets</Text>
            <Switch
              value={settings.project_update}
              onValueChange={() => toggleSwitch('project_update')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {translations.notifications.communications}
          </Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Messages d'équipe</Text>
            <Switch
              value={settings.team_message}
              onValueChange={() => toggleSwitch('team_message')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Mises à jour de l'application</Text>
            <Switch
              value={settings.app_updates}
              onValueChange={() => toggleSwitch('app_updates')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Alertes d'abonnement</Text>
            <Switch
              value={settings.subscription_alerts}
              onValueChange={() => toggleSwitch('subscription_alerts')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Heures silencieuses</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Activer les heures silencieuses</Text>
            <Switch
              value={settings.quiet_hours_enabled}
              onValueChange={() => toggleSwitch('quiet_hours_enabled')}
            />
          </View>
          {settings.quiet_hours_enabled && (
            <>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Début (hh:mm)</Text>
                <Text>{settings.quiet_hours_start}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Fin (hh:mm)</Text>
                <Text>{settings.quiet_hours_end}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission requise',
        translations.errors.permissionRequired
      );
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  } else {
    Alert.alert(
      'Appareil physique requis', 
      translations.errors.physicalDeviceRequired
    );
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  settingLabel: {
    fontSize: 15,
    color: '#333',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#ff7a5c',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
