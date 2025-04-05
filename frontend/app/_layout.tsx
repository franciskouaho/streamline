import React, { useEffect, useState, useCallback } from 'react';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAuthStore } from "@/stores/auth";
import { QueryProvider } from "@/providers/QueryProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useNetInfo } from '@react-native-community/netinfo';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { DeviceRegistration } from '@/types/notifications';

// On n'a plus besoin de prévenir le splash screen natif de se cacher
// SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    const [appIsReady, setAppIsReady] = useState(false);
    const { isAuthenticated, isLoading, initialize } = useAuthStore();
    const [initError, setInitError] = useState<string | null>(null);
    const netInfo = useNetInfo();

    useEffect(() => {
        async function prepare() {
            try {
                // Vérifier d'abord la connexion réseau
                if (!netInfo.isConnected && netInfo.isInternetReachable === false) {
                    setInitError("Aucune connexion internet détectée. Veuillez vérifier votre connexion et réessayer.");
                    setAppIsReady(true);
                    await SplashScreen.hideAsync();
                    return;
                }

                // Journaliser les informations sur l'appareil pour le débogage
                if (__DEV__) {
                    const deviceInfo = {
                        brand: Device.brand,
                        manufacturer: Device.manufacturer,
                        modelName: Device.modelName,
                        designName: Device.designName,
                        productName: Device.productName,
                        deviceYearClass: Device.deviceYearClass,
                        totalMemory: Device.totalMemory,
                        osName: Device.osName,
                        osVersion: Device.osVersion,
                        osBuildId: Device.osBuildId,
                    };
                    console.log('Device Info:', deviceInfo);
                }

                await initialize();
            } catch (e) {
                console.warn('Erreur d\'initialisation:', e);
                setInitError("Une erreur s'est produite lors du chargement de l'application. Vérifiez votre connexion au serveur.");
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, [netInfo.isConnected]);

    // Configuration des notifications
    useEffect(() => {
        const { user } = useAuthStore.getState();
        
        registerForPushNotificationsAsync().then(token => {
            if (token && user?.id) {
                // Remplacer l'import dynamique par un import régulier
                const { registerDeviceToken } = require('@/services/notifications');
                registerDeviceToken({
                    userId: user.id,
                    deviceId: Device.deviceName || 'unknown',
                    pushToken: token,
                    deviceType: Platform.OS,
                    deviceName: Device.deviceName || 'unknown',
                    appVersion: Constants.expoConfig?.version || '1.0.0',
                    osVersion: Device.osVersion || 'unknown'
                }).catch((err: any) => console.error('Failed to register device token:', err));
            }
        });

        // Gestionnaire lorsqu'une notification est reçue pendant que l'app est au premier plan
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification reçue:', notification);
            // Vous pouvez ajouter une logique ici pour mettre à jour l'interface utilisateur
        });

        // Gestionnaire lorsqu'une notification est tapée par l'utilisateur
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification tapée:', response);
            // Ajoutez ici la logique pour naviguer vers l'écran approprié en fonction du type de notification
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, []);

    // Fonction pour demander et récupérer le token de notification
    async function registerForPushNotificationsAsync(): Promise<string | undefined> {
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
                console.log('Failed to get push token for push notification!');
                return undefined;
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            })).data;
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    const handleRetry = () => {
        setInitError(null);
        setAppIsReady(false);
        initialize()
            .then(() => {
                setAppIsReady(true);
            })
            .catch(err => {
                console.error('Erreur lors de la réinitialisation:', err);
                setInitError("Impossible de se connecter au serveur. Veuillez réessayer plus tard.");
                setAppIsReady(true);
            });
    };

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            // Cela garantit que le splash screen natif ne disparaît que lorsque l'application est prête
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    // Afficher le splash screen tant que l'app n'est pas prête
    if (!appIsReady) {
        return null; // Le splash screen est toujours visible
    }

    // Afficher un écran d'erreur en cas de problème d'initialisation
    if (initError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Erreur de connexion</Text>
                <Text style={styles.errorMessage}>{initError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Afficher un indicateur de chargement pendant l'authentification
    if (isLoading || !appIsReady) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff7a5c" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <QueryProvider>
            <LanguageProvider>
                <AuthProvider>
                    <GestureHandlerRootView style={{flex: 1}} onLayout={onLayoutRootView}>
                        <StatusBar style="auto"/>
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: {backgroundColor: "#f2f2f2"},
                                animation: "slide_from_right",
                            }}
                        />
                    </GestureHandlerRootView>
                </AuthProvider>
            </LanguageProvider>
        </QueryProvider>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        padding: 20,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#FF3B30',
    },
    errorMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
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

export default RootLayout;
