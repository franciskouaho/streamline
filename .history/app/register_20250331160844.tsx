import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const Register = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState<string>('');

    const validateForm = () => {
        let isValid = true;

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Email invalide');
            isValid = false;
        }

        if (!password || password.length < 6) {
            setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
            isValid = false;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Les mots de passe ne correspondent pas');
            isValid = false;
        }

        return isValid;
    };

    const handleRegister = () => {
        if (validateForm()) {
            setIsLoading(true);
            router.replace('/home');
        }
    };

    const goToLogin = () => {
        router.push('/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Image
                        source={require("../assets/images/wave.jpeg")}
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
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="brucewayne27@sugarasa.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => setRememberMe(!rememberMe)}
                        >
                            {rememberMe && (
                                <View style={styles.checkboxInner} />
                            )}
                        </TouchableOpacity>
                        <Text style={styles.checkboxLabel}>
                            I agree to privacy policy & terms
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace('/home')}
                    >
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Image source={require('../assets/images/google.png')} style={styles.socialIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton}>
                            <Image source={require('../assets/images/apple.png')} style={styles.socialIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton}>
                            <Image source={require('../assets/images/facebook.png')} style={styles.socialIcon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.footerLink}>Sign in instead</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    waveIcon: {
        width: 50,
        height: 50,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
    },
    form: {
        flex: 1,
    },
    input: {
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 3,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    checkboxInner: {
        width: 14,
        height: 14,
        backgroundColor: "#000",
    },
    checkboxLabel: {
        fontSize: 14,
        color: "#666",
    },
    button: {
        height: 50,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#ccc",
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 14,
        color: "#666",
    },
    socialButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    socialButton: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    socialIcon: {
        width: 24,
        height: 24,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        fontSize: 14,
        color: "#666",
    },
    footerLink: {
        fontSize: 14,
        color: "#000",
        fontWeight: "bold",
    },
});