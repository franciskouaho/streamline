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
    ScrollView,
    Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

    const handleContinue = () => {
        // Validation logic here
        if (!name || !email || !password || !agreeToTerms) {
            // Montrer une alerte ou un message d'erreur
            return;
        }

        // Logique d'inscription ici

        // Redirection vers la page d'accueil
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
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Create Account</Text>
                            <Image
                                source={require('../assets/images/wave.jpeg')}
                                style={styles.waveIcon}
                            />
                        </View>

                        <Text style={styles.subtitle}>
                            Please register on our Streamline, where you can continue using our service.
                        </Text>

                        <View style={styles.form}>
                            <TextInput
                                style={styles.input}
                                placeholder="Bruce Wayne"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="brucewayne27@suarasa.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="password-new"
                            />

                            <View style={styles.termsContainer}>
                                <Pressable
                                    style={styles.checkbox}
                                    onPress={() => setAgreeToTerms(!agreeToTerms)}
                                >
                                    {agreeToTerms && (
                                        <View style={styles.checkboxInner} />
                                    )}
                                </Pressable>

                                <View style={styles.termsTextContainer}>
                                    <Text style={styles.termsText}>
                                        I agree to {' '}
                                        <Text style={styles.termsLink}>privacy policy</Text>
                                        {' '} & {' '}
                                        <Text style={styles.termsLink}>terms</Text>
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={handleContinue}
                            >
                                <Text style={styles.continueButtonText}>Continue</Text>
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

                            <View style={styles.signInContainer}>
                                <Text style={styles.signInText}>
                                    Already have an account?{' '}
                                </Text>
                                <Link href="/login" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.signInLink}>Sign in instead</Text>
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
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#000',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
    },
    checkboxInner: {
        width: 14,
        height: 14,
        borderRadius: 3,
        backgroundColor: '#ff7a5c',
    },
    termsTextContainer: {
        flex: 1,
    },
    termsText: {
        fontSize: 14,
        color: '#666',
    },
    termsLink: {
        color: '#666',
        textDecorationLine: 'underline',
    },
    continueButton: {
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
    continueButtonText: {
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
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signInText: {
        color: '#666',
        fontSize: 14,
    },
    signInLink: {
        color: '#ff7a5c',
        fontSize: 14,
        fontWeight: '500',
    },
});