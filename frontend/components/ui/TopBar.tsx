import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProfileStore } from "@/stores/profile";
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchNotifications } from '@/services/notifications';

export const TopBar = () => {
    const router = useRouter();
    const { profile } = useProfileStore();
    const { translations } = useLanguage();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Charge le profil au chargement du composant
        const loadProfile = async () => {
            try {
                await useProfileStore.getState().fetchProfile();
            } catch (error) {
                console.error('Erreur lors du chargement du profil:', error);
            }
        };
        
        loadProfile();
        loadNotifications();

        // Rafraîchir le compteur toutes les 30 secondes
        const intervalId = setInterval(loadNotifications, 30000);
        
        return () => clearInterval(intervalId);
    }, []);

    const loadNotifications = async () => {
        try {
            const notifications = await fetchNotifications();
            const unread = notifications.filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
        }
    };

    return (
        <View style={styles.headerContainer}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.profileContainer}
                    onPress={() => router.push('/edit-profile')}
                >
                    <Image
                        source={profile?.photoURL ? { uri: profile.photoURL } : require("../../assets/images/profile.jpeg")}
                        style={styles.profileImage}
                    />
                    <View>
                        <View style={styles.greetingContainer}>
                            <Text style={styles.greeting}>
                                {translations.common.welcome}, {profile?.fullName?.split(' ')[0] ?? 'User'}
                            </Text>
                            <Image
                                source={require("../../assets/images/wave.png")}
                                style={styles.waveIcon}
                            />
                        </View>
                        <Text style={styles.subtitle}>
                            {translations.topBar?.dailyMessage}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => router.push("/notification")}
                    style={styles.notificationContainer}
                >
                    <Ionicons name="notifications-outline" size={24} color="#000" />
                    {unreadCount > 0 && (
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f2f2f2',
        zIndex: 1000,
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 10,
    },
    greetingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    greeting: {
        fontSize: 18,
        fontWeight: "700",
        marginRight: 5,
    },
    waveIcon: {
        width: 20,
        height: 20,
    },
    subtitle: {
        fontSize: 12,
        color: "#888",
    },
    notificationContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
        position: 'relative',
    },
    badgeContainer: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 4,
    },
});
