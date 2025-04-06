import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegister } from '@/services/queries/auth';

export default function Register() {
    const router = useRouter();
    const { translations } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const register = useRegister();

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            Alert.alert(
                translations.errors.validation?.title || "Erreur", 
                translations.errors.validation?.requiredFields || "Veuillez remplir tous les champs obligatoires"
            );
            return;
        }
        
        try {
            await register.mutateAsync({
                email,
                password,
                fullName
            });
            router.replace('/login');
        } catch (error) {
            console.error('Registration failed:', error);
            Alert.alert(
                translations.errors.registration?.title || "Erreur d'inscription",
                translations.errors.registration?.message || "L'inscription a échoué. Veuillez réessayer."
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
                            <TouchableOpacity 
                                onPress={() => router.back()} 
                                style={styles.backButton}
                            >
                                <Ionicons name="arrow-back" size={24} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.title}>{translations.auth.register}</Text>
                            <Text style={styles.subtitle}>{translations.auth.fillInformation}</Text>
                        </View>

                        {/* Section du milieu */}
                        <View style={styles.middleSection}>
                            <TextInput
                                style={styles.input}
                                placeholder={translations.editProfile.fullName}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholderTextColor="#666"
                            />

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
                        </View>

                        {/* Section du bas */}
                        <View style={styles.bottomSection}>
                            <TouchableOpacity
                                style={styles.registerButton}
                                onPress={handleRegister}
                            >
                                <Text style={styles.registerButtonText}>
                                    {translations.auth.register}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={[styles.dividerText, { color: '#888' }]}>{translations.auth.or}</Text>
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

                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>
                                    {translations.auth.hasAccount}{' '}
                                </Text>
                                <Link href="/login" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.loginLink}>
                                            {translations.auth.login}
                                        </Text>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'space-between', // Important pour la répartition
        paddingVertical: 40,
    },
    topSection: {
        flex: 0.2,
        justifyContent: 'flex-start',
    },
    middleSection: {
        flex: 0.5,
        justifyContent: 'center',
    },
    bottomSection: {
        flex: 0.3,
        justifyContent: 'flex-end',
    },
    backButton: {
        marginBottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 10,
        color: '#000',
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
        color: '#000',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    registerButton: {
        backgroundColor: '#ff7a5c',
        width: '100%',
        borderRadius: 15,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#ff7a5c',
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 25,
        marginTop: 25,
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
});
