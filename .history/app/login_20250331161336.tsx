import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Image
                        source={require("../assets/images/wave.jpeg")}
                        style={styles.waveIcon}
                    />
                </View>

                <Text style={styles.subtitle}>
                    Sign in to continue using Streamline.
                </Text>

                <View style={styles.form}>
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
                            Remember me
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace('/home')}
                    >
                        <Text style={styles.buttonText}>Sign In</Text>
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
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}>
                            <Text style={styles.footerLink}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default Login;
// Utiliser les mêmes styles que Register mais changer les couleurs appropriées
const styles = StyleSheet.create({
    // ...copier les styles de Register...
});