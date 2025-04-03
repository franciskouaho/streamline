import React, { useEffect, useState } from 'react';
import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from "@/stores/auth";
import { QueryProvider } from "@/providers/QueryProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useNetInfo } from '@react-native-community/netinfo';
import * as Device from 'expo-device';

// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

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
                await SplashScreen.hideAsync();
            }
        }

        prepare();
    }, [netInfo.isConnected]);

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
    if (isLoading) {
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
                <GestureHandlerRootView style={{flex: 1}}>
                    <StatusBar style="auto"/>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: {backgroundColor: "#f2f2f2"},
                            animation: "slide_from_right",
                        }}
                    />
                    {!isAuthenticated && <Redirect href="/login" />}
                </GestureHandlerRootView>
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
