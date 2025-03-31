import {Stack, Redirect} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {useEffect, useState} from "react";
import * as SplashScreen from "expo-splash-screen";
import {GestureHandlerRootView} from "react-native-gesture-handler";

const RootLayout = () => {


    useEffect(() => {
        async function prepare() {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                console.warn(e);
            } finally {
                await SplashScreen.hideAsync();
            }
        }

        prepare();
    }, []);

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