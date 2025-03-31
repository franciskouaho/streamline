import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Register() {
    const router = useRouter();
    const { translations } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

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
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>{translations.auth.register}</Text>
                        <Text style={styles.subtitle}>{translations.auth.fillInformation}</Text>

                        <View style={styles.form}>
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

                            <TextInput
                                style={styles.input}
                                placeholder={translations.auth.password}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor="#666"
                            />

                            <TouchableOpacity
                                style={styles.registerButton}
                                onPress={() => router.replace('/')}
                            >
                                <Text style={styles.registerButtonText}>
                                    {translations.auth.register}
                                </Text>
                            </TouchableOpacity>

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
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
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
});