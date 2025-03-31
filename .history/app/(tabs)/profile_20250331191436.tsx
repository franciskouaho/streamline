import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';

export default function Profile() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.profileSection}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>In Process tasks</Text>
                    </View>

                    <Image
                        source={require("../../assets/images/profile.jpeg")}
                        style={styles.profileImage}
                    />

                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>42</Text>
                        <Text style={styles.statLabel}>Completed tasks</Text>
                    </View>
                </View>

                <Text style={styles.userName}>Bruce Wayne</Text>
                <Text style={styles.userRole}>Product Designer</Text>

                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="notifications-outline" size={24} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>Notification</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="shield-checkmark-outline" size={24} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>Security</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="globe-outline" size={24} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>Language & Region</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => router.push("/premium")}
                >
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="diamond-outline" size={24} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>Go Premium</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="help-circle-outline" size={24} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>Help Center</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
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
    profileSection: {
        alignItems: "center",
        paddingVertical: 20,
    },
    statsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 40,
    },
    statItem: {
        alignItems: "center",
    },
    statNumber: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: "#888",
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    userName: {
        fontSize: 22,
        fontWeight: "700",
        marginTop: 15,
    },
    userRole: {
        fontSize: 14,
        color: "#888",
        marginBottom: 20,
    },
    editButton: {
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
    },
    menuSection: {
        paddingHorizontal: 20,
        marginTop: 30,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    menuIconContainer: {
        width: 40,
        alignItems: "center",
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 10,
    },
});