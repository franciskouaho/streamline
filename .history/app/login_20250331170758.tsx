import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    const handleSignIn = () => {
        // if (!email || !password) {
        //     return;
        // }

        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Image
                                source={require('../assets/images/wave.jpeg')}
                                style={styles.waveIcon}
                            />
                        </View>

                        <Text style={styles.subtitle}>
                            Sign in to continue using Streamline and pick up where you left off.
                        </Text>

                        <View style={styles.form}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="password"
                            />

                            <View style={styles.rememberForgotContainer}>
                                <TouchableOpacity
                                    style={styles.rememberContainer}
                                    onPress={() => setRememberMe(!rememberMe)}
                                >
                                    <View style={styles.checkbox}>
                                        {rememberMe && (
                                            <View style={styles.checkboxInner} />
                                        )}
                                    </View>
                                    <Text style={styles.rememberText}>Remember me</Text>
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.signInButton}
                                onPress={handleSignIn}
                            >
                                <Text style={styles.signInButtonText}>Sign In</Text>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>Or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.socialButtonsContainer}>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Image
                                        source={require('../assets/images/google.png')}
                                        style={styles.socialIcon}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.socialButton}>
                                    <Image
                                        source={require('../assets/images/apple.png')}
                                        style={styles.socialIcon}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.socialButton}>
                                    <Image
                                        source={require('../assets/images/facebook.png')}
                                        style={styles.socialIcon}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.signUpContainer}>
                                <Text style={styles.signUpText}>
                                    Don't have an account?{' '}
                                </Text>
                                <Link href="/register" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.signUpLink}>Create Account</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginRight: 10,
    },
    waveIcon: {
        width: 28,
        height: 28,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 15,
        padding: 18,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    rememberForgotContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxInner: {
        width: 14,
        height: 14,
        borderRadius: 3,
        backgroundColor: '#ff7a5c',
    },
    rememberText: {
        fontSize: 14,
        color: '#666',
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#ff7a5c',
        fontWeight: '500',
    },
    signInButton: {
        backgroundColor: '#ff7a5c',
        width: '100%',
        borderRadius: 15,
        padding: 18,
        alignItems: 'center',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 25,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#888',
        fontSize: 14,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    socialButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    socialIcon: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signUpText: {
        color: '#666',
        fontSize: 14,
    },
    signUpLink: {
        color: '#ff7a5c',
        fontSize: 14,
        fontWeight: '500',
    },
});