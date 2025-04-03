import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfileStore } from '@/stores/profile';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfile() {
    const { translations } = useLanguage();
    const router = useRouter();
    const { profile, updateProfile, isLoading } = useProfileStore();
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: '',
        bio: '',
        photoURL: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName,
                email: profile.email,
                role: profile?.role || translations.profile.role,
                bio: profile?.bio || '',
                photoURL: profile?.photoURL || '',
            });
        }
    }, [profile]);

    const handleUpdatePhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setFormData(prev => ({ ...prev, photoURL: result.assets[0].uri }));
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert(
                "Erreur", 
                "Impossible de charger l'image. Veuillez réessayer."
            );
        }
    };

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            await updateProfile(formData);
            Alert.alert(
                "Succès", 
                "Votre profil a été mis à jour avec succès.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert(
                "Erreur", 
                "Impossible de mettre à jour le profil. Veuillez réessayer."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{translations.editProfile.title}</Text>
                <View style={{width: 24}} />
            </View>

            <View style={styles.profileSection}>
                <TouchableOpacity 
                    style={styles.imageContainer}
                    onPress={handleUpdatePhoto}
                >
                    <Image
                        source={formData.photoURL ? { uri: formData.photoURL } : require("../assets/images/profile.jpeg")}
                        style={styles.profileImage}
                    />
                    <View style={styles.editIconContainer}>
                        <Ionicons name="camera" size={20} color="#000" />
                    </View>
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{translations.editProfile.fullName}</Text>
                    <TextInput 
                        style={styles.input}
                        value={formData.fullName}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                        placeholder={translations.editProfile.fullName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{translations.editProfile.email}</Text>
                    <TextInput 
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                        placeholder={translations.editProfile.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{translations.editProfile.role}</Text>
                    <TextInput 
                        style={styles.input}
                        value={formData.role}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, role: text }))}
                        placeholder={translations.editProfile.role}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{translations.editProfile.bio}</Text>
                    <TextInput 
                        style={[styles.input, { height: 100 }]}
                        value={formData.bio}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                        placeholder={translations.editProfile.bio}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity 
                    style={[
                        styles.saveButton, 
                        (isLoading || isSubmitting) && styles.disabledButton
                    ]}
                    onPress={handleSave}
                    disabled={isLoading || isSubmitting}
                >
                    {isLoading || isSubmitting ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.saveButtonText}>{translations.editProfile.save}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    profileSection: {
        alignItems: "center",
        padding: 20,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 30,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: '#000',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#000',
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    saveButton: {
        backgroundColor: "#ff7a5c",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
        marginTop: 20,
    },
    saveButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
});
