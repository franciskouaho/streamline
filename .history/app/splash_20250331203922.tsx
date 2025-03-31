import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/contexts/LanguageContext';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export default function Splash() {
    const { translations } = useLanguage();
    const router = useRouter();
    const opacity = new Animated.Value(0);
    const scale = new Animated.Value(0.8);
    const logoRotation = new Animated.Value(0);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease)
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
                easing: Easing.elastic(1.2)
            }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(logoRotation, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease)
                    }),
                    Animated.timing(logoRotation, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease)
                    })
                ])
            )
        ]).start();

        const timer = setTimeout(() => {
            router.replace('/login');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const spin = logoRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require("../assets/images/logo.png")}
                    style={styles.logo}
                />
                <Text style={styles.title}>{translations.splash.welcome}</Text>
                <Text style={styles.subtitle}>{translations.splash.subtitle}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        letterSpacing: 0.5,
    },
});