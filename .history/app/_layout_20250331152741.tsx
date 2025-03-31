import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();
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

                router.replace('/splash');

                await SplashScreen.hideAsync();
            }
        }

        if (fontsLoaded) {
            prepare();
        }
    }, [fontsLoaded, router]);

    if (!fontsLoaded || !appIsReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#f2f2f2" },
                    animation: "slide_from_right",
                }}
            />
        </GestureHandlerRootView>
    );
}