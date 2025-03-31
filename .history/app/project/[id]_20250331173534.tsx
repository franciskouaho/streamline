import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';

export default function ProjectDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={[styles.headerButton, shadowStyles.button]}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Project Details</Text>
                <TouchableOpacity 
                    style={[styles.headerButton, shadowStyles.button]}
                >
                    <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.projectCard, shadowStyles.card]}>
                    <Text style={styles.projectTitle}>Website for Rune.io</Text>
                    <Text style={styles.projectType}>Digital Product Design</Text>
                    
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressTitle}>Progress</Text>
                            <Text style={styles.progressPercentage}>75%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '75%' }]} />
                        </View>
                    </View>
                </View>

                <View style={[styles.teamSection, shadowStyles.card]}>
                    <Text style={styles.sectionTitle}>Team Members</Text>
                    {/* Team members list */}
                </View>

                <View style={[styles.tasksSection, shadowStyles.card]}>
                    <View style={styles.taskHeader}>
                        <Text style={styles.sectionTitle}>Tasks</Text>
                        <TouchableOpacity 
                            style={[styles.addTaskButton, shadowStyles.button]}
                            onPress={() => router.push("/new-task")}
                        >
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    {/* Tasks list */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    projectCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    projectTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 5,
    },
    projectType: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
    },
    progressSection: {
        marginTop: 10,
    },
    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    progressPercentage: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ff7a5c",
    },
    progressBar: {
        height: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 4,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#ff7a5c",
        borderRadius: 4,
    },
    teamSection: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    tasksSection: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    taskHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    addTaskButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ff7a5c",
        alignItems: "center",
        justifyContent: "center",
    },
});