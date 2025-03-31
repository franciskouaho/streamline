import {Stack, Redirect} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {useEffect, useState} from "react";
import * as SplashScreen from "expo-splash-screen";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

const RootLayout = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
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
        return null;
    }

    return (
        <AuthProvider>
            <ThemeProvider>
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
            </ThemeProvider>
        </AuthProvider>
    );
};

export default RootLayout;