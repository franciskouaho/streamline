import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

const NotificationManagement = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState({
    task_assigned: true,
    task_deadline: true,
    task_comment: true,
    project_update: true,
    team_message: true,
    app_updates: true,
    subscription_alerts: true,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
  });
  
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [deviceToken, setDeviceToken] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    loadNotificationSettings();
    checkNotificationPermission();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notification-settings/${user.id}`);
      
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      Alert.alert('Erreur', 'Impossible de charger vos paramètres de notification');
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationPermission = async () => {
    if (!Device.isDevice) {
      setHasPermission(false);
      Alert.alert('Erreur', 'Les notifications ne fonctionnent pas sur l\'émulateur');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      setHasPermission(false);
      Alert.alert(
        'Notifications désactivées', 
        'Veuillez activer les notifications dans les paramètres de votre appareil pour recevoir des alertes',
        [{ text: 'OK' }]
      );
    } else {
      setHasPermission(true);
      registerForPushNotifications();
    }
  };

  const registerForPushNotifications = async () => {
    try {
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID, // Remplacez par votre ID de projet Expo
      })).data;

      setDeviceToken(token);

      // Enregistrer le token dans la base de données
      await api.post('/device-tokens', {
        user_id: user.id,
        device_id: Device.deviceName + '-' + Device.modelName,
        push_token: token,
        device_type: Platform.OS,
        device_name: Device.deviceName || 'Unknown',
        app_version: '1.0.0', // Remplacez par la version actuelle de votre app
        os_version: Device.osVersion || 'Unknown',
      });

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token:', error);
    }
  };

  const toggleSetting = async (key) => {
    try {
      const newSettings = { ...settings, [key]: !settings[key] };
      setSettings(newSettings);
      
      // Mise à jour des paramètres sur le serveur
      await api.put(`/notification-settings/${user.id}`, {
        [key]: !settings[key]
      });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour ce paramètre');
      
      // Rétablir l'état précédent en cas d'échec
      setSettings({ ...settings });
    }
  };

  const onTimeChange = (event, selectedTime, type) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
      setShowEndTimePicker(false);
    }
    
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      const newSettings = { 
        ...settings, 
        [type === 'start' ? 'quiet_hours_start' : 'quiet_hours_end']: timeString 
      };
      
      setSettings(newSettings);
      
      // Envoyer la mise à jour au serveur
      api.put(`/notification-settings/${user.id}`, {
        [type === 'start' ? 'quiet_hours_start' : 'quiet_hours_end']: timeString
      }).catch(error => {
        console.error('Erreur lors de la mise à jour de l\'heure:', error);
      });
    }
  };

  const sendTestNotification = async () => {
    try {
      await api.post('/send-test-notification', {
        user_id: user.id,
        device_token: deviceToken
      });
      Alert.alert('Notification envoyée', 'Vous devriez recevoir une notification test dans quelques instants');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification test:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification test');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Paramètres de notification</Text>
        
        <View style={styles.permissionSection}>
          <Ionicons name={hasPermission ? "notifications" : "notifications-off"} size={24} color={hasPermission ? theme.success : theme.danger} />
          <Text style={[styles.permissionText, { color: theme.text }]}>
            {hasPermission ? "Notifications autorisées" : "Notifications désactivées"}
          </Text>
          {!hasPermission && (
            <TouchableOpacity onPress={checkNotificationPermission} style={styles.permissionButton}>
              <Text style={styles.permissionButtonText}>Activer</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Tâches assignées</Text>
          <Switch
            value={settings.task_assigned}
            onValueChange={() => toggleSetting('task_assigned')}
            trackColor={{ false: theme.border, true: theme.primaryLight }}
            thumbColor={settings.task_assigned ? theme.primary : theme.card}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Échéances de tâches</Text>
          <Switch
            value={settings.task_deadline}
            onValueChange={() => toggleSetting('task_deadline')}
            trackColor={{ false: theme.border, true: theme.primaryLight }}
            thumbColor={settings.task_deadline ? theme.primary : theme.card}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Commentaires sur les tâches</Text>
          <Switch
            value={settings.task_comment}
            onValueChange={() => toggleSetting('task_comment')}
            trackColor={{ false: theme.border, true: theme.primaryLight }}
            thumbColor={settings.task_comment ? theme.primary : theme.card}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Mises à jour de projets</Text>
          <Switch
            value={settings.project_update}
            onValueChange={() => toggleSetting('project_update')}
            trackColor={{ false: theme.border, true: theme.primaryLight }}
            thumbColor={settings.project_update ? theme.primary : theme.card}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Messages d'équipe</Text>
          <Switch
            value={settings.team_message}
            onValueChange={() => toggleSetting('team_message')}
            trackColor={{ false: theme.border, true: theme.primaryLight }}
            thumbColor={settings.team_message ? theme.primary : theme.card}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Mises à jour de l'application</Text>
          <Switch
            value={settings.app_updates}
            onValueChange={() => toggleSetting('app_updates')}
            trackColor={{ false: theme.border, true: theme.primaryLight }}
            thumbColor={settings.app_updates ? theme.primary : theme.card}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Alertes d'abonnement</Text>
          <Switch
            value={settings.subscription_alerts}
            onValueChange={() => toggleSetting('subscription_alerts')}
            trackColor={{ false: theme.border, true: theme.primaryLight }}
            thumbColor={settings.subscription_alerts ? theme.primary : theme.card}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Heures silencieuses</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Activer le mode silencieux</Text>
          <Switch
            value={settings.quiet_hours_enabled}
            onValueChange={() => toggleSetting('quiet_hours_enabled')}
            trackColor={{ false: theme.border, true: theme.primaryLight }}
            thumbColor={settings.quiet_hours_enabled ? theme.primary : theme.card}
          />
        </View>

        {settings.quiet_hours_enabled && (
          <>
            <View style={styles.timePickerRow}>
              <Text style={[styles.timeLabel, { color: theme.text }]}>De</Text>
              <TouchableOpacity 
                style={[styles.timeButton, { backgroundColor: theme.card }]}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={[styles.timeButtonText, { color: theme.text }]}>
                  {settings.quiet_hours_start}
                </Text>
              </TouchableOpacity>
              
              <Text style={[styles.timeLabel, { color: theme.text }]}>à</Text>
              <TouchableOpacity 
                style={[styles.timeButton, { backgroundColor: theme.card }]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={[styles.timeButtonText, { color: theme.text }]}>
                  {settings.quiet_hours_end}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [hours, minutes] = settings.quiet_hours_start.split(':');
                  const date = new Date();
                  date.setHours(parseInt(hours, 10));
                  date.setMinutes(parseInt(minutes, 10));
                  return date;
                })()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedTime) => onTimeChange(event, selectedTime, 'start')}
              />
            )}

            {showEndTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [hours, minutes] = settings.quiet_hours_end.split(':');
                  const date = new Date();
                  date.setHours(parseInt(hours, 10));
                  date.setMinutes(parseInt(minutes, 10));
                  return date;
                })()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedTime) => onTimeChange(event, selectedTime, 'end')}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications récentes</Text>
        {/* Ici, vous pourriez afficher une liste des notifications récentes */}
        <Text style={[styles.emptyNotifications, { color: theme.textSecondary }]}>
          Vos 5 dernières notifications s'afficheront ici
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.testButton, { backgroundColor: theme.primary }]}
        onPress={sendTestNotification}
        disabled={!hasPermission}
      >
        <Text style={styles.testButtonText}>Envoyer une notification test</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  settingLabel: {
    fontSize: 16,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  timeLabel: {
    fontSize: 16,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  timeButtonText: {
    fontSize: 16,
  },
  permissionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
  },
  permissionText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyNotifications: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  testButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NotificationManagement;