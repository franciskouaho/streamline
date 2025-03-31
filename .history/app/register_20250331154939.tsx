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
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!name) {
      setNameError('Nom requis');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!email) {
      setEmailError('Email requis');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Format email invalide');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Mot de passe requis');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirmation du mot de passe requise');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleRegister = () => {
    if (validateForm()) {
      setIsLoading(true);
      
      // Simuler une inscription
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/home');
      }, 1500);
      
      // Dans une application réelle, vous feriez un appel API ici
    }
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <LinearGradient
      colors={['#232336', '#2A2A4A']}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <Text style={styles.title}>Streamline</Text>
              <Text style={styles.subtitle}>Créer un compte</Text>
              
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <FontAwesome name="user" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom complet"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                
                <View style={styles.inputContainer}>
                  <FontAwesome name="envelope-o" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                
                <View style={styles.inputContainer}>
                  <FontAwesome name="lock" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.visibilityToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                
                <View style={styles.inputContainer}>
                  <FontAwesome name="lock" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmer le mot de passe"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    style={styles.visibilityToggle}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesome name={showConfirmPassword ? "eye" : "eye-slash"} size={20} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                
                <TouchableOpacity 
                  style={styles.registerButton} 
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.registerButtonText}>S'inscrire</Text>
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Déjà un compte ?</Text>
                <TouchableOpacity onPress={goToLogin}>
                  <Text style={styles.loginLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    height: '100%',
  },
  visibilityToggle: {
    padding: 10,
  },
  errorText: {
    color: '#ff7a5c',
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
    fontSize: 12,
  },
  registerButton: {
    backgroundColor: '#43d2c3',
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginRight: 5,
  },
  loginLink: {
    color: '#4d8efc',
    fontSize: 16,
    fontWeight: '600',
  },
});