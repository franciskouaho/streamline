import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import TaskStatusCard from "@/components/TaskStatusCard";
import ProjectCard from "@/components/ProjectCard";

interface StatusData {
    type: string;
    title: string;
    count: number;
    icon: string;
    color: string;
}

interface ProjectData {
    id: number;
    title: string;
    type: string;
    tasks: number;
    progress: number;
    color: string;
}

const Home = () => {
    const router = useRouter();

    const statusData: StatusData[] = [
        { type: "ongoing", title: "On going", count: 24, icon: "sync", color: "#4d8efc" },
        { type: "inprogress", title: "In Process", count: 12, icon: "clock-outline", color: "#ffb443" },
        { type: "completed", title: "Completed", count: 42, icon: "file-document-outline", color: "#43d2c3" },
        { type: "canceled", title: "Canceled", count: 8, icon: "file-cancel-outline", color: "#ff7a5c" },
    ];

    const projectsData: ProjectData[] = [
        { id: 1, title: "Website for Rune.io", type: "Digital Product Design", tasks: 12, progress: 40, color: "#ff7a5c" },
        { id: 2, title: "Dashboard for ProSavvy", type: "Digital Product Design", tasks: 12, progress: 75, color: "#43d2c3" },
        { id: 3, title: "Mobile Apps for Track.id", type: "Digital Product Design", tasks: 12, progress: 50, color: "#ffb443" },
        { id: 4, title: "Website for CourierGo.com", type: "Digital Product Design", tasks: 12, progress: 40, color: "#4d8efc" },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.profileContainer}>
                        <Image
                            source={require("../../assets/images/profile.jpeg")}
                            style={styles.profileImage}
                        />
                        <View>
                            <View style={styles.greetingContainer}>
                                <Text style={styles.greeting}>Hi, Bruce</Text>
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

                <View style={styles.statusCardsContainer}>
                    {statusData.map((status) => (
                        <TaskStatusCard
                            key={status.type}
                            title={status.title}
                            count={status.count}
                            icon={status.icon}
                            color={status.color}
                        />
                    ))}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Task</Text>
                </View>

                <View style={styles.projectsContainer}>
                    {projectsData.map((project) => (
                        <ProjectCard
                            key={project.id}
                            title={project.title}
                            type={project.type}
                            tasks={project.tasks}
                            progress={project.progress}
                            color={project.color}
                            onPress={() => router.push(`/project/${project.id}`)}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Home;

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
    statusCardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 20,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    projectsContainer: {
        paddingHorizontal: 20,
        marginBottom: 80,
    },
});