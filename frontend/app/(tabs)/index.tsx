import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TaskStatusCard from "@/components/TaskStatusCard";
import { TopBar } from "@/components/ui/TopBar";
import DashboardCharts from "@/components/DashboardCharts";
import { useLanguage } from '@/contexts/LanguageContext';
import { useProjects } from "@/services/queries/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useTasks } from "@/services/queries/tasks";
import { calculateProjectStats, calculateTaskStats } from "@/utils/projectUtils";

const Home = () => {
    const { translations } = useLanguage();
    const { data: projects, isLoading: isLoadingProjects } = useProjects({
        refetchInterval: 5000, // Rafraîchir les données toutes les 5 secondes
        staleTime: 2000,      // Considérer les données comme périmées après 2 secondes
    });
    const { data: tasks, isLoading: isLoadingTasks } = useTasks();

    const isLoading = isLoadingProjects || isLoadingTasks;

    // Calcul des statistiques basées sur les données réelles
    const projectStats = projects ? calculateProjectStats(projects) : null;
    const taskStats = tasks ? calculateTaskStats(tasks) : null;

    // Ajouter du code de débogage pour vérifier les données
    console.log('Projets disponibles dans Home:', projects?.length);
    console.log('Statistiques de projets:', projectStats);
    console.log('Statistiques des tâches:', taskStats);

    return (
        <SafeAreaView style={styles.container}>
            <TopBar title={translations.common.home} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.content}>
                   
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
        gap: 10,
        alignItems: 'center',
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