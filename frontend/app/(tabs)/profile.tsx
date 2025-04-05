import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfileStore } from "@/stores/profile";
import { useAuthStore } from "@/stores/auth";

export default function Profile() {
    const { translations } = useLanguage();
    const router = useRouter();
    const { profile } = useProfileStore();
    const { logout, deleteAccount } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                await useProfileStore.getState().fetchProfile();
            } catch (err) {
                console.error("Erreur lors du chargement du profil:", err);
                setError(translations.errors.loadProfile);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [translations]);

    const handleLogout = () => {
        Alert.alert(
            translations.profile.logoutTitle,
            translations.profile.logoutConfirm,
            [
                {
                    text: translations.common.cancel,
                    style: "cancel"
                },
                {
                    text: translations.common.confirm,
                    onPress: async () => {
                        try {
                            await logout();
                            router.replace("/");
                        } catch (error) {
                            console.error("Erreur lors de la déconnexion:", error);
                            Alert.alert(
                                "Erreur", 
                                translations.errors.logout
                            );
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            translations.profile.deleteAccountTitle,
            translations.profile.deleteAccountConfirm,
            [
                {
                    text: translations.common.cancel,
                    style: "cancel"
                },
                {
                    text: translations.profile.delete,
                    onPress: async () => {
                        try {
                            await deleteAccount();
                            router.replace("/");
                        } catch (error) {
                            console.error("Erreur lors de la suppression du compte:", error);
                            Alert.alert(
                                "Erreur", 
                                translations.errors.deleteAccount
                            );
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleRetry = () => {
        useProfileStore.getState().fetchProfile();
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#ff7a5c" />
                <Text style={{marginTop: 10}}>{translations.common.loading}</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>{translations.common.retry}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <Text>{translations.profile.noProfile}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>{translations.common.retry}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
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

                   {/* <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#000" />
                        </View>
                        <Text style={styles.menuItemText}>{translations.profile.security}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#888" />
                    </TouchableOpacity>*/}

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

                   {/* <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push("/premium")}
                    >
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="diamond-outline" size={24} color="#000" />
                        </View>
                        <Text style={styles.menuItemText}>{translations.profile.goPremium}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#888" />
                    </TouchableOpacity>*/}

                    {/*<TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="help-circle-outline" size={24} color="#000" />
                        </View>
                        <Text style={styles.menuItemText}>{translations.profile.helpCenter}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#888" />
                    </TouchableOpacity>*/}

                    <TouchableOpacity 
                        style={[styles.menuItem, styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                        </View>
                        <Text style={[styles.menuItemText, styles.logoutText]}>{translations.profile.logout || "Se déconnecter"}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#888" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, styles.deleteAccountButton]}
                        onPress={handleDeleteAccount}
                    >
                        <View style={[styles.menuIconContainer, styles.deleteIconContainer]}>
                            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                        </View>
                        <Text style={[styles.menuItemText, styles.deleteText]}>{translations.profile.deleteAccount || "Supprimer mon compte"}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#888" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollViewContent: {
        paddingBottom: 30,
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
    logoutButton: {
        borderColor: '#FF3B30',
    },
    logoutIconContainer: {
        borderColor: '#FF3B30',
    },
    logoutText: {
        color: '#FF3B30',
    },
    deleteAccountButton: {
        borderColor: '#FF3B30',
        marginTop: 15,
    },
    deleteIconContainer: {
        borderColor: '#FF3B30',
    },
    deleteText: {
        color: '#FF3B30',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
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
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
