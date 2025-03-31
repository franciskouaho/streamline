import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [appIsReady, setAppIsReady] = useState(false);

    const [fontsLoaded] = useFonts({
        // Vous pouvez ajouter des polices personnalisées ici
        // 'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
        // 'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
        // 'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    });

    useEffect(() => {
        async function prepare() {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
                await SplashScreen.hideAsync();
            }
        }

        if (fontsLoaded) {
            prepare();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded || !appIsReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <Stack
                initialRouteName="splash"
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#f2f2f2" },
                    animation: "slide_from_right",
                }}
            />
        </GestureHandlerRootView>
    );
}