import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/auth';

const { width } = Dimensions.get('window');

export default function Splash() {
    const { translations } = useLanguage();
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    
    const logoScale = new Animated.Value(0);
    const logoTranslateY = new Animated.Value(50);
    const textOpacity = new Animated.Value(0);
    const textTranslateY = new Animated.Value(30);
    const progressWidth = new Animated.Value(0);

    useEffect(() => {
        const splashDuration = 2500;

        Animated.sequence([
            Animated.parallel([
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.back(1.7))
                }),
                Animated.timing(logoTranslateY, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.back(1.7))
                })
            ]),
            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                    delay: 200
                }),
                Animated.timing(textTranslateY, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                    delay: 200
                })
            ])
        ]).start();

        Animated.timing(progressWidth, {
            toValue: 1,
            duration: splashDuration,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease)
        }).start();

        const timer = setTimeout(() => {
            if (isAuthenticated) {
                router.replace('/(tabs)');
            } else {
                router.replace('/login');
            }
        }, splashDuration);

        return () => clearTimeout(timer);
    }, [isAuthenticated]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View 
                    style={[
                        styles.logoContainer,
                        {
                            transform: [
                                { scale: logoScale },
                                { translateY: logoTranslateY }
                            ]
                        }
                    ]}
                >
                    <Text style={styles.logoText}>S</Text>
                    <View style={styles.logoDot} />
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: textOpacity,
                        transform: [{ translateY: textTranslateY }]
                    }}
                >
                    <Text style={styles.title}>{translations.splash.welcome}</Text>
                    <Text style={styles.subtitle}>{translations.splash.subtitle}</Text>
                </Animated.View>
            </View>

            <View style={styles.progressContainer}>
                <Animated.View 
                    style={[
                        styles.progressBar,
                        {
                            width: progressWidth.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%']
                            })
                        }
                    ]}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ff7a5c',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ff7a5c',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        position: 'relative',
    },
    logoText: {
        fontSize: 60,
        fontWeight: '900',
        color: '#fff',
    },
    logoDot: {
        position: 'absolute',
        bottom: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#000',
        borderWidth: 3,
        borderColor: '#f2f2f2',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        maxWidth: width * 0.8,
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#e0e0e0',
        position: 'absolute',
        bottom: 50,
        left: 30,
        right: 30,
        borderRadius: 2,
        borderColor: '#fff',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#ff7a5c',
        borderRadius: 2,
        borderColor: '#fff',
    },
});