import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import TaskStatusCard from "@/components/TaskStatusCard";
import { TopBar } from "@/components/ui/TopBar";
import DashboardCharts from "@/components/DashboardCharts";
import { useLanguage } from '@/contexts/LanguageContext';
import { useProjects } from "@/services/queries/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';

interface StatusData {
    type: string;
    title: string;
    count: number;
    icon: string;
    color: string;
}

const Home = () => {
    const router = useRouter();
    const { translations } = useLanguage();
    const { data: projects, isLoading } = useProjects();

    const statusData: StatusData[] = [
        { type: "ongoing", title: translations.tasks.ongoing, count: 24, icon: "sync", color: "#4d8efc" },
        { type: "inprogress", title: translations.tasks.inProgress, count: 12, icon: "clock-outline", color: "#ffb443" },
        { type: "completed", title: translations.tasks.completed, count: 42, icon: "file-document-outline", color: "#43d2c3" },
        { type: "canceled", title: "Canceled", count: 8, icon: "file-cancel-outline", color: "#ff7a5c" },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <TopBar title={translations.common.home} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.content}>
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

                    <DashboardCharts />

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {translations.projects.recentProjects}
                        </Text>
                    </View>

                    {isLoading ? (
                        <LoadingIndicator />
                    ) : (
                        <View style={styles.projectsContainer}>
                            {projects?.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </View>
                    )}
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
        width: '100%',
        gap: 15,
    },
    scrollContent: {
        paddingTop: 85,
    },
    content: {
        flex: 1,
        width: '100%',
        overflow: 'hidden',
    },
});