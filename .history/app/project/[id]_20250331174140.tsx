import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';

interface ChecklistItem {
    id: number;
    title: string;
    completed: boolean;
}

interface TeamMember {
    id: number;
    image: any;
}

interface TodayTask {
    id: number;
    title: string;
    assignee: string;
    completed: boolean;
}

interface ProjectData {
    id: string | number;
    title: string;
    description: string;
    deadline: string;
    progress: number;
    team: TeamMember[];
    checklist: ChecklistItem[];
    todaysTasks: TodayTask[];
}

export default function ProjectDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<string>('detail');

    const projectData: ProjectData = {
        id: Array.isArray(id) ? id[0] : id,
        title: "Website for Rune.io",
        description: "Effectively manage and coordinate the tasks involved in the development and enhancement of the Rune.io job finder website. Ensure alignment with project goals, timelines, and quality standards.",
        deadline: "February 6",
        progress: 60,
        team: [
            { id: 1, image: require("../../assets/images/team1.jpeg") },
            { id: 2, image: require("../../assets/images/team1.jpeg") },
            { id: 3, image: require("../../assets/images/team1.jpeg") },
        ],
        checklist: [
            { id: 1, title: "Collaborate with the design team to outline the requirements for the website redesign.", completed: true },
            { id: 2, title: "Coordinate with the content creation team to ensure the development of engaging and informative content for the website.", completed: true },
            { id: 3, title: "Task the development team with enhancing the user profile functionality.", completed: true },
            { id: 4, title: "Work closely with the tech team to optimize the job matching algorithm.", completed: false },
            { id: 5, title: "Task the development team with ensuring the website's mobile responsiveness.", completed: false },
        ],
        todaysTasks: [
            { id: 1, title: "Job Matching Optimization", assignee: "Jack Roberts", completed: true },
            { id: 2, title: "Employer Dashboard Upgrades", assignee: "Ava Taylor", completed: false },
        ]
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.statusTag}>In Progress</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="calendar-outline" size={22} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="ellipsis-vertical" size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.title}>{projectData.title}</Text>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.description}>{projectData.description}</Text>

                <View style={[styles.progressSection, shadowStyles.card]}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>Progress</Text>
                        <Text style={styles.progressPercentage}>{projectData.progress}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${projectData.progress}%` }]} />
                    </View>
                </View>

                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'detail' && styles.activeTab]}
                        onPress={() => setActiveTab('detail')}
                    >
                        <Text style={[styles.tabText, activeTab === 'detail' && styles.activeTabText]}>
                            Detail
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'comment' && styles.activeTab]}
                        onPress={() => setActiveTab('comment')}
                    >
                        <Text style={[styles.tabText, activeTab === 'comment' && styles.activeTabText]}>
                            Comment
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'attachment' && styles.activeTab]}
                        onPress={() => setActiveTab('attachment')}
                    >
                        <Text style={[styles.tabText, activeTab === 'attachment' && styles.activeTabText]}>
                            Attachment
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.teamSection}>
                    <View style={styles.teamHeaderContainer}>
                        <View>
                            <Text style={styles.sectionTitle}>Team Assign</Text>
                            <View style={styles.teamContainer}>
                                {projectData.team.map((member) => (
                                    <View key={member.id} style={styles.teamMember}>
                                        <View style={styles.memberAvatar} />
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.addMemberButton}>
                                    <Ionicons name="add" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={[styles.progressCircle, shadowStyles.card]}>
                            <Text style={styles.progressPercentage}>{projectData.progress}%</Text>
                            <Text style={styles.progressLabel}>Progress</Text>
                        </View>
                    </View>

                    <View style={styles.deadlineContainer}>
                        <Ionicons name="alarm-outline" size={20} color="#000" />
                        <Text style={styles.deadlineText}>Deadline: {projectData.deadline}</Text>
                    </View>
                </View>

                <View style={styles.checklistSection}>
                    <Text style={styles.sectionTitle}>Checklist</Text>

                    {projectData.checklist.map((item) => (
                        <View key={item.id} style={styles.checklistItem}>
                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    item.completed && styles.checkboxCompleted
                                ]}
                            >
                                {item.completed && (
                                    <Ionicons name="checkmark" size={18} color="#fff" />
                                )}
                            </TouchableOpacity>
                            <Text
                                style={[
                                    styles.checklistText,
                                    item.completed && styles.checklistTextCompleted
                                ]}
                            >
                                {item.title}
                            </Text>
                            <TouchableOpacity style={styles.moreButton}>
                                <Ionicons name="ellipsis-horizontal" size={18} color="#888" />
                            </TouchableOpacity>
                        </View>
                    ))}
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
    headerTitleContainer: {
        alignItems: "center",
    },
    headerIcons: {
        flexDirection: "row",
    },
    iconButton: {
        marginLeft: 15,
    },
    statusTag: {
        backgroundColor: "#ffb443",
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 15,
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    titleContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 20,
    },
    tabsContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    activeTab: {
        backgroundColor: "#ff7a5c",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#666",
    },
    activeTabText: {
        color: "#fff",
    },
    teamSection: {
        marginBottom: 20,
    },
    teamHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    progressCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    progressPercentage: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ff7a5c',
    },
    progressLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 15,
    },
    teamContainer: {
        flexDirection: "row",
        marginBottom: 15,
    },
    teamMember: {
        marginRight: 10,
    },
    memberAvatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: "#ccc",
    },
    addMemberButton: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    deadlineContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    deadlineText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: "500",
    },
    checklistSection: {
        marginBottom: 30,
    },
    checklistItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 5,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    checkboxCompleted: {
        backgroundColor: "#43d2c3",
    },
    checklistText: {
        flex: 1,
        fontSize: 14,
    },
    checklistTextCompleted: {
        textDecorationLine: "line-through",
        color: "#888",
    },
    moreButton: {
        padding: 5,
    },
    progressSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    progressPercentage: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ff7a5c',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#ff7a5c',
        borderRadius: 4,
    },
});