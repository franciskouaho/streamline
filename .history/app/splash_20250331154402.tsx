import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export default function SplashScreen() {
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
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const spin = logoRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <LinearGradient
            colors={['#232336', '#2A2A4A']}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity,
                        transform: [
                            { scale },
                            { rotate: spin }
                        ]
                    }
                ]}
            >
                <View style={styles.logoCircle}>
                    <View style={[styles.line, { width: '60%', backgroundColor: '#ff7a5c' }]} />
                    <View style={[styles.line, { width: '80%', backgroundColor: '#ffb443' }]} />
                    <View style={[styles.line, { width: '70%', backgroundColor: '#43d2c3' }]} />
                    <View style={[styles.line, { width: '50%', backgroundColor: '#4d8efc' }]} />
                    <View style={styles.checkmarkContainer}>
                        <View style={styles.checkmark}>
                            <View style={styles.checkLeft} />
                            <View style={styles.checkRight} />
                        </View>
                    </View>
                </View>
            </Animated.View>

            <Animated.Text style={[styles.title, { opacity, transform: [{ scale }] }]}>
                Streamline
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, { opacity, transform: [{ scale }] }]}>
                Simplify your workflow
            </Animated.Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    line: {
        height: 4,
        borderRadius: 2,
        marginVertical: 5,
    },
    checkmarkContainer: {
        position: 'absolute',
        width: 40,
        height: 40,
    },
    checkmark: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    checkLeft: {
        position: 'absolute',
        width: 4,
        height: 12,
        backgroundColor: 'white',
        borderRadius: 2,
        bottom: 12,
        left: 8,
        transform: [{ rotate: '45deg' }],
    },
    checkRight: {
        position: 'absolute',
        width: 4,
        height: 22,
        backgroundColor: 'white',
        borderRadius: 2,
        bottom: 14,
        right: 8,
        transform: [{ rotate: '-45deg' }],
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