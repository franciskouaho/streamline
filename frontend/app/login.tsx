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
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLogin } from '@/services/queries/auth';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { translations } = useLanguage();
    const login = useLogin();

    const handleSignIn = async () => {
        // Validation des champs requis
        if (!email || !password) {
            Alert.alert(
                translations.errors.validation?.title || "Erreur",
                translations.errors.validation?.requiredFields || "Veuillez remplir tous les champs obligatoires"
            );
            return;
        }
        
        // Validation du format de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert(
                translations.errors.validation?.title || "Erreur",
                translations.errors.validation?.invalidEmail || "Veuillez entrer une adresse email valide"
            );
            return;
        }
        
        try {
            await login.mutateAsync({
                email,
                password,
            });
            router.replace('/');
        } catch (error) {
            console.error('Login failed:', error);
            Alert.alert(
                translations.errors.login?.title || "Erreur de connexion",
                translations.errors.login?.message || "La connexion a échoué. Veuillez vérifier vos identifiants."
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.content}>
                        {/* Section du haut */}
                        <View style={styles.topSection}>
                            <View style={styles.titleContainer}>
                                <Text style={[styles.title, { color: '#000' }]}>{translations.auth.login}</Text>
                                <Image
                                    source={require('../assets/images/wave.png')}
                                    style={styles.waveIcon}
                                />
                            </View>

                            <Text style={[styles.subtitle, { color: '#666' }]}>
                                {translations.auth.signInToContinue}
                            </Text>
                        </View>

                        {/* Section du milieu */}
                        <View style={styles.middleSection}>
                            <View style={styles.form}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={translations.auth.email}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    placeholderTextColor="#666"
                                />

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder={translations.auth.password}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoComplete="password"
                                        placeholderTextColor="#666"
                                    />
                                    <TouchableOpacity 
                                        style={styles.passwordVisibilityButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Ionicons 
                                            name={showPassword ? 'eye-off' : 'eye'} 
                                            size={22} 
                                            color="#666" 
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.forgotPasswordContainer}>
                                    <TouchableOpacity>
                                        <Text style={[styles.forgotPasswordText, { color: '#ff7a5c' }]}>
                                            {translations.auth.forgotPassword}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.signInButton}
                                    onPress={handleSignIn}
                                >
                                    <Text style={[styles.signInButtonText, { color: '#fff' }]}>{translations.auth.login}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Section du bas */}
                        <View style={styles.bottomSection}>
                           {/*
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={[styles.dividerText, { color: '#888' }]}>{translations.auth.or}</Text>
                                <View style={styles.dividerLine} />
                            </View>*/}

                           {/* <View style={styles.socialButtonsContainer}>
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
                            </View>*/}

                            <View style={styles.signUpContainer}>
                                <Text style={[styles.signUpText, { color: '#666' }]}>
                                    {translations.auth.dontHaveAccount}{' '}
                                </Text>
                                <Link href="/register" asChild>
                                    <TouchableOpacity>
                                        <Text style={[styles.signUpLink, { color: '#ff7a5c' }]}>{translations.auth.createAccount}</Text>
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
        justifyContent: 'space-between', // Important pour la répartition
        paddingVertical: 40,
    },
    topSection: {
        flex: 0.2,
        justifyContent: 'center',
    },
    middleSection: {
        flex: 0.5,
        justifyContent: 'center',
    },
    bottomSection: {
        flex: 0.3,
        justifyContent: 'flex-end',
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
        color: '#000',  // Ajout de la couleur du texte
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    passwordContainer: {
        position: 'relative',
        width: '100%',
        marginBottom: 15,
    },
    passwordInput: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 15,
        padding: 18,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
        paddingRight: 50, // Espace pour le bouton
    },
    passwordVisibilityButton: {
        position: 'absolute',
        right: 15,
        top: 18,
        padding: 5,
    },
    forgotPasswordContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20,
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
