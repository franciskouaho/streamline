import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type SettingItem = {
    icon: keyof typeof Ionicons.glyphs;
    label: string;
    value?: string;
    action: () => void;
};

export default function Profile() {
    const router = useRouter();

    const settings: SettingItem[] = [
        {
            icon: 'person-outline',
            label: 'Modifier le profil',
            action: () => {}
        },
        {
            icon: 'notifications-outline',
            label: 'Notifications',
            action: () => {
                router.push('/notification-settings');
            }
        },
        {
            icon: 'lock-closed-outline',
            label: 'Confidentialité',
            action: () => {}
        },
        {
            icon: 'shield-outline',
            label: 'Type de compte',
            value: 'Pro',
            action: () => router.push('/premium')
        },
        {
            icon: 'moon-outline',
            label: 'Thème',
            value: 'Clair',
            action: () => {}
        },
        {
            icon: 'language-outline',
            label: 'Langue',
            value: 'Français',
            action: () => {}
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Profil</Text>
            </View>
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://picsum.photos/200' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>Jean Dupont</Text>
                    <Text style={styles.userEmail}>jean.dupont@example.com</Text>
                </View>

                <View style={styles.settingsContainer}>
                    {settings.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.settingItem}
                            onPress={item.action}
                        >
                            <View style={styles.settingIconContainer}>
                                <Ionicons name={item.icon} size={24} color="#000" />
                            </View>
                            <View style={styles.settingContent}>
                                <Text style={styles.settingLabel}>{item.label}</Text>
                                {item.value && (
                                    <Text style={styles.settingValue}>{item.value}</Text>
                                )}
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#000" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
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
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 16,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#000',
    },
    editAvatarButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#6366F1',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
    },
    settingsContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
        marginBottom: 24,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#000',
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    logoutButton: {
        backgroundColor: '#DC2626',
        padding: 16,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
