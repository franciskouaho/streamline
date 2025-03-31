import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

const languages = [
  { id: 'fr', name: 'Français', region: 'France' },
  { id: 'en', name: 'English', region: 'United States' },
  { id: 'es', name: 'Español', region: 'España' },
  { id: 'de', name: 'Deutsch', region: 'Deutschland' },
];

export default function Language() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Langue et Région</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.languageList}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            style={[
              styles.languageItem,
              selectedLanguage === lang.id && styles.selectedItem
            ]}
            onPress={() => setSelectedLanguage(lang.id)}
          >
            <View>
              <Text style={styles.languageName}>{lang.name}</Text>
              <Text style={styles.regionName}>{lang.region}</Text>
            </View>
            {selectedLanguage === lang.id && (
              <Ionicons name="checkmark" size={24} color="#ff7a5c" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  languageList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  selectedItem: {
    borderColor: '#ff7a5c',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  regionName: {
    fontSize: 14,
    color: '#888',
  },
});
