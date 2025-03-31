import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function NotificationSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: false,
    newProjects: true,
    taskAssignments: true,
    taskComments: true,
    deadlineReminders: true,
    teamUpdates: false,
    marketing: false,
  });

  const toggleSwitch = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres des notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications générales</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications push</Text>
            <Switch
              value={settings.pushEnabled}
              onValueChange={() => toggleSwitch('pushEnabled')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications par email</Text>
            <Switch
              value={settings.emailEnabled}
              onValueChange={() => toggleSwitch('emailEnabled')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activités du projet</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Nouveaux projets</Text>
            <Switch
              value={settings.newProjects}
              onValueChange={() => toggleSwitch('newProjects')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Attribution de tâches</Text>
            <Switch
              value={settings.taskAssignments}
              onValueChange={() => toggleSwitch('taskAssignments')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Commentaires sur les tâches</Text>
            <Switch
              value={settings.taskComments}
              onValueChange={() => toggleSwitch('taskComments')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Rappels d'échéance</Text>
            <Switch
              value={settings.deadlineReminders}
              onValueChange={() => toggleSwitch('deadlineReminders')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communications</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Mises à jour d'équipe</Text>
            <Switch
              value={settings.teamUpdates}
              onValueChange={() => toggleSwitch('teamUpdates')}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Actualités marketing</Text>
            <Switch
              value={settings.marketing}
              onValueChange={() => toggleSwitch('marketing')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
});
