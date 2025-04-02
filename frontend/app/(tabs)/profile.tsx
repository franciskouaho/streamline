import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import {useProfileStore} from "@/stores/profile";

export default function Profile() {
    const { translations } = useLanguage();
    const router = useRouter();
    const { profile } = useProfileStore();

    useEffect(() => {
        useProfileStore.getState().fetchProfile();
    }, []);

    if (!profile) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.profileSection}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{profile.tasksInProgress || 0}</Text>
                        <Text style={styles.statLabel}>{translations.tasks.inProgress}</Text>
                    </View>

                    <Image
                        source={profile.photoURL ? { uri: profile.photoURL } : require("../../assets/images/profile.jpeg")}
                        style={styles.profileImage}
                    />

                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{profile.tasksCompleted || 0}</Text>
                        <Text style={styles.statLabel}>{translations.tasks.completed}</Text>
                    </View>
                </View>

                <Text style={styles.userName}>{profile.fullName}</Text>
                <Text style={styles.userRole}>{translations.profile.role}</Text>

                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => router.push("/edit-profile")}
                >
                    <Text style={styles.editButtonText}>{translations.profile.editProfile}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.menuSection}>
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => router.push("/notification-settings")}
                >
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="notifications-outline" size={24} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>{translations.profile.notification}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="shield-checkmark-outline" size={24} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>{translations.profile.security}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => router.push("/language")}
                >
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="globe-outline" size={24} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>{translations.profile.language}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => router.push("/premium")}
                >
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="diamond-outline" size={24} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>{translations.profile.goPremium}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="help-circle-outline" size={24} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>{translations.profile.helpCenter}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: 20,
    },
    statsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        width: "100%",
        paddingHorizontal: 20,
        gap: 10,
    },
    statItem: {
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
        width: 120,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: "#888",
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    userName: {
        fontSize: 22,
        fontWeight: "700",
        marginTop: 15,
    },
    userRole: {
        fontSize: 14,
        color: "#888",
        marginBottom: 20,
    },
    editButton: {
        backgroundColor: "#ff7a5c",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    editButtonText: {  // Ajout du style manquant
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    menuSection: {
        paddingHorizontal: 20,
        marginTop: 30,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
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
    menuIconContainer: {
        width: 40,
        alignItems: "center",
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 10,
    },
});
