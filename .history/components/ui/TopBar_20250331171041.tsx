import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface TopBarProps {
    username?: string;
}

export const TopBar = ({ username = "Bruce" }: TopBarProps) => {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <View style={styles.profileContainer}>
                <Image
                    source={require("../../assets/images/profile.jpeg")}
                    style={styles.profileImage}
                />
                <View>
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greeting}>Hi, {username}</Text>
                        <Image
                            source={require("../../assets/images/wave.jpeg")}
                            style={styles.waveIcon}
                        />
                    </View>
                    <Text style={styles.subtitle}>Your daily adventure starts now</Text>
                </View>
            </View>

            <TouchableOpacity onPress={() => router.push("/notification")}>
                <Ionicons name="notifications-outline" size={24} color="#000" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 10,
    },
    greetingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    greeting: {
        fontSize: 18,
        fontWeight: "700",
        marginRight: 5,
    },
    waveIcon: {
        width: 20,
        height: 20,
    },
    subtitle: {
        fontSize: 12,
        color: "#888",
    },
});
