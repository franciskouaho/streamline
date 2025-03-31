import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

export default function EditProfile() {
    const router = useRouter();
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{width: 24}} />
            </View>

            <View style={styles.profileSection}>
                <TouchableOpacity style={styles.imageContainer}>
                    <Image
                        source={require("../assets/images/profile.jpeg")}
                        style={styles.profileImage}
                    />
                    <View style={styles.editIconContainer}>
                        <Ionicons name="camera" size={20} color="#000" />
                    </View>
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput 
                        style={styles.input}
                        defaultValue="Bruce Wayne"
                        placeholder="Enter your full name"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Role</Text>
                    <TextInput 
                        style={styles.input}
                        defaultValue="Product Designer"
                        placeholder="Enter your role"
                    />
                </View>

                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
});
