import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from '@/contexts/LanguageContext';

export default function Language() {
    const router = useRouter();
    const { language, setLanguage, translations } = useLanguage();

    const languages = [
        { code: 'fr', name: 'Français' },
        { code: 'en', name: 'English' }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{translations.settings.language}</Text>
                <View style={{width: 24}} />
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>{translations.settings.selectLanguage}</Text>
                {languages.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.languageItem,
                            language === lang.code && styles.selectedLanguage
                        ]}
                        onPress={() => setLanguage(lang.code as 'fr' | 'en')}
                    >
                        <Text style={styles.languageName}>{lang.name}</Text>
                        {language === lang.code && (
                            <Ionicons name="checkmark" size={24} color="#000" />
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    backButton: {
        backgroundColor: '#fff',
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    content: {
        padding: 20,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 15,
        color: "#555",
    },
    languageItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
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
    selectedLanguage: {
        borderColor: '#ff7a5c',
        borderWidth: 2,
    },
    languageName: {
        fontSize: 16,
        fontWeight: "500",
    }
});
