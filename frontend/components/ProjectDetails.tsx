import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';
import { useProject, useDeleteProject, useUpdateProjectStatus } from '@/services/queries/projects';
import { useProjectTasks, useUpdateTask } from '@/services/queries/tasks';
import { useQueryClient } from '@tanstack/react-query';
import { getProjectStatusLabel, normalizeProjectStatus, shouldUpdateProjectStatus, getStatusColor, calculateProjectProgress } from '@/utils/projectUtils';
import { useLanguage } from '@/contexts/LanguageContext'; // Ajout de l'import

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

function formatDeadline(dateString: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

export default function ProjectDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const projectId = Array.isArray(id) ? id[0] : id;
    const { translations } = useLanguage(); // Ajout du hook useLanguage
    
    const { data: project, isLoading: isLoadingProject } = useProject(projectId);
    const { data: tasks, isLoading: isLoadingTasks } = useProjectTasks(projectId);
    const queryClient = useQueryClient();
    const updateTask = useUpdateTask();
    const deleteProject = useDeleteProject();
    const updateProjectStatus = useUpdateProjectStatus();

    console.log('Current tasks:', tasks);
    
    const [activeTab, setActiveTab] = useState<string>('attachment');
    const [showMenu, setShowMenu] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [statusAutoUpdated, setStatusAutoUpdated] = useState(false);

    const handleMenuPress = () => {
        setShowMenu(!showMenu);
    };

    const handleTaskToggle = async (task) => {
        try {
            console.log('Toggling task:', task.id);
            await updateTask.mutateAsync({
                id: task.id,
                status: task.status === 'done' ? 'todo' : 'done'
            });
        } catch (error) {
            console.error('Error updating task status:', error.response?.data || error);
        }
    };

    const handleDeleteProject = async () => {
        try {
            Alert.alert(
                "Supprimer le projet",
                "Êtes-vous sûr de vouloir supprimer ce projet ?",
                [
                    {
                        text: "Annuler",
                        style: "cancel"
                    },
                    {
                        text: "Supprimer",
                        style: "destructive",
                        onPress: async () => {
                            await deleteProject.mutateAsync(projectId);
                            router.replace('/');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error deleting project:', error);
            Alert.alert('Erreur', 'Erreur lors de la suppression du projet');
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateProjectStatus.mutateAsync({
                id: projectId,
                status: newStatus
            });
            setShowStatusMenu(false);
            Alert.alert('Succès', 'Le statut du projet a été mis à jour');
        } catch (error) {
            console.error('Error updating project status:', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour le statut du projet');
        }
    };

    // Effet pour mettre à jour automatiquement le statut du projet
    // en fonction de l'avancement des tâches
    useEffect(() => {
        if (project && tasks && !statusAutoUpdated) {
            const { shouldUpdate, newStatus, progress } = shouldUpdateProjectStatus(project, tasks);
            
            if (shouldUpdate && newStatus) {
                // Mettre à jour le statut du projet automatiquement
                updateProjectStatus.mutate(
                    { id: projectId, status: newStatus },
                    {
                        onSuccess: () => {
                            console.log(`Statut du projet mis à jour automatiquement vers: ${newStatus}`);
                            setStatusAutoUpdated(true);
                        }
                    }
                );
            }
        }
    }, [project, tasks, statusAutoUpdated]);

    if (isLoadingProject || isLoadingTasks) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Chargement...</Text>
            </SafeAreaView>
        );
    }

    if (!project) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Projet non trouvé</Text>
            </SafeAreaView>
        );
    }

    // Obtenir la couleur du statut pour le cercle de progression
    const statusColor = getStatusColor(project?.status || 'ongoing');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}
                    style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
        
                <View 
                    style={[
                        styles.statusBadge, 
                        { backgroundColor: statusColor }
                    ]}
                >
                    <Text style={styles.statusText}>
                        {getProjectStatusLabel(project?.status || 'ongoing')}
                    </Text>
                </View>

                <View style={styles.headerIcons}>
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => {
                            if (project && project.id) {
                                router.push(`/new-task?projectId=${project.id}`);
                                console.log(`Navigation vers /new-task?projectId=${project.id}`);
                            }
                        }}
                    >
                        <Ionicons name="add-circle-outline" size={22} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.iconButton, styles.deleteButton]}
                        onPress={handleDeleteProject}
                    >
                        <Ionicons name="trash-outline" size={22} color="#ff3b30" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.title}>{project?.name}</Text>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.description}>{project?.description}</Text>

                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'attachment' && styles.activeTab]}
                        onPress={() => setActiveTab('attachment')}
                    >
                        <Text style={[styles.tabText, activeTab === 'attachment' && styles.activeTabText]}>
                            Attachment
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'kanban' && styles.activeTab]}
                        onPress={() => {
                            setActiveTab('kanban');
                            // Utilisation de la navigation plus robuste avec params
                            router.push({
                                pathname: `/project/kanban/[id]`,
                                params: { id: projectId }
                            });
                        }}
                    >
                        <Text style={[styles.tabText, activeTab === 'kanban' && styles.activeTabText]}>
                            Kanban
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.teamSection}>
                    <View>
                        <Text style={styles.sectionTitle}>Team Assign</Text>
                        <View style={styles.teamContainer}>
                            {project.members?.map((member) => (
                                <View key={member.id} style={styles.teamMember}>
                                    <View style={styles.memberAvatar} />
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addMemberButton}>
                                <Ionicons name="add" size={20} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.deadlineContainer}>
                        <Ionicons name="alarm-outline" size={20} color="#000" />
                        <Text style={styles.deadlineText}>
                            Date limite : {project?.endDate ? formatDeadline(project.endDate) : 'Non définie'}
                        </Text>
                    </View>
                    
                    {/* Cercle de progression avec la couleur du statut */}
                    <View style={styles.progressSection}>
                        <View style={[
                            styles.progressCircle, 
                            shadowStyles.card,
                            { borderColor: statusColor }
                        ]}>
                            <Text style={[styles.progressPercentage, { color: statusColor }]}>
                                {calculateProgress(project)}%
                            </Text>
                            <Text style={styles.progressLabel}>Progress</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.checklistSection}>
                    <Text style={styles.sectionTitle}>Tâches ({tasks?.length || 0})</Text>
                    
                    {!tasks?.length ? (
                        <Text style={styles.emptyText}>Aucune tâche pour ce projet</Text>
                    ) : (
                        tasks.map((task) => (
                            <View key={task.id} style={styles.checklistItem}>
                                <TouchableOpacity
                                    style={[
                                        styles.checkbox,
                                        task.status === 'done' && styles.checkboxCompleted
                                    ]}
                                    onPress={() => handleTaskToggle(task)}
                                >
                                    {task.status === 'done' && (
                                        <Ionicons name="checkmark" size={18} color="#fff" />
                                    )}
                                </TouchableOpacity>
                                <View style={styles.taskContent}>
                                    <Text
                                        style={[
                                            styles.checklistText,
                                            task.status === 'done' && styles.checklistTextCompleted
                                        ]}
                                    >
                                        {task.title}
                                    </Text>
                                    {task.dueDate && (
                                        <Text style={styles.dueDateText}>
                                            {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function calculateProgress(project: any): number {
    if (!project || !project.tasks || project.tasks.length === 0) return 0;
    
    const completedTasks = project.tasks.filter(task => 
        task.status.toLowerCase() === 'done' || task.status.toLowerCase() === 'completed'
    ).length;
    
    return Math.round((completedTasks / project.tasks.length) * 100);
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
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
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 5,
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
    progressSection: {
        marginTop: 20,
        alignItems: 'center',
    },
    progressCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderWidth: 2, // Ajouté pour rendre la bordure colorée plus visible
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    taskStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#666',
    },
    priorityText: {
        fontSize: 12,
        color: '#666',
        textTransform: 'capitalize',
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    taskDueDate: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dueDateText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    assigneeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    assigneeAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    assigneeInitials: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666',
    },
    assigneeName: {
        fontSize: 12,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginTop: 20,
    },
    taskContent: {
        flex: 1,
        marginLeft: 15,
    },
    dueDateText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    deleteButton: {
        borderColor: '#ff3b30',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4d8efc',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 5,
    },
    statusOptionText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
});