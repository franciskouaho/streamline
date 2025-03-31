import {Stack, Redirect} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {useEffect, useState} from "react";
import * as SplashScreen from "expo-splash-screen";
import {GestureHandlerRootView} from "react-native-gesture-handler";

const RootLayout = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes pour le splash
            } catch (e) {
                console.warn(e);
            } finally {
                await SplashScreen.hideAsync();
                setIsReady(true);
            }
        }

        prepare();
    }, []);

    if (!isReady) {
        return null; // Pendant ce temps, le splash screen natif est affiché
    }

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <StatusBar style="auto"/>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {backgroundColor: "#f2f2f2"},
                    animation: "slide_from_right",
                }}
            />
            <Redirect href="/login" />
        </GestureHandlerRootView>
    );
}

export default RootLayout;