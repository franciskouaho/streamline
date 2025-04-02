import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/stores/auth";
import { QueryProvider } from "@/providers/QueryProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    const [appIsReady, setAppIsReady] = useState(false);
    const { isAuthenticated, isLoading, initialize } = useAuthStore();

    useEffect(() => {
        async function prepare() {
            try {
                await initialize();
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
                await SplashScreen.hideAsync();
            }
        }

        prepare();
    }, []);

    // Afficher le splash screen tant que l'app n'est pas prête
    if (!appIsReady || isLoading) {
        return null;
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

export default RootLayout;
