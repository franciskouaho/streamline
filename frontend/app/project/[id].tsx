import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';
import { useProject, useDeleteProject, useUpdateProjectStatus, useProjectMembers, useRemoveProjectMember } from '@/services/queries/projects';
import { useProjectTasks, useUpdateTask } from '@/services/queries/tasks';
import { useQueryClient } from '@tanstack/react-query';
import { shouldUpdateProjectStatus } from '@/utils/projectUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Project, Task, TaskStatusUpdateInput } from '@/types/project';

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
    const projectId = Array.isArray(id) ? id[0] : id as string;
    const { translations } = useLanguage();
    
    const { data: project, isLoading: isLoadingProject } = useProject(projectId);
    const { data: tasks, isLoading: isLoadingTasks } = useProjectTasks(projectId);
    const queryClient = useQueryClient();
    const updateTask = useUpdateTask();
    const deleteProject = useDeleteProject();
    const updateProjectStatus = useUpdateProjectStatus();
    const removeProjectMember = useRemoveProjectMember();

    const [activeTab, setActiveTab] = useState<string>('');
    const [showMenu, setShowMenu] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [statusAutoUpdated, setStatusAutoUpdated] = useState(false);

    const handleTaskToggle = async (task: Task) => {
        try {
            console.log('Toggling task:', task.id);
            const updateData: TaskStatusUpdateInput = {
                id: Number(task.id), // Conversion explicite en nombre
                status: task.status === 'done' ? 'todo' : 'done'
            };
            await updateTask.mutateAsync(updateData);
        } catch (error: any) {
            console.error('Error updating task status:', error.response?.data || error);
        }
    };

    const handleDeleteProject = async () => {
        try {
            Alert.alert(
                translations.projects.deleteTitle,
                translations.projects.deleteConfirm,
                [
                    {
                        text: translations.common.cancel,
                        style: "cancel"
                    },
                    {
                        text: translations.common.delete,
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
            Alert.alert(
                'Erreur', 
                translations.errors.deleteProject
            );
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

    const handleRemoveMember = async (memberId: number) => {
        Alert.alert(
            "Retirer un membre",
            "Êtes-vous sûr de vouloir retirer ce membre du projet ? Cette action ne peut pas être annulée.",
            [
                { 
                    text: "Annuler", 
                    style: 'cancel',
                    onPress: () => console.log('Annulation du retrait du membre')
                },
                {
                    text: "Retirer",
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeProjectMember.mutateAsync({
                                projectId: Number(projectId),
                                memberId: memberId
                            });
                            Alert.alert(
                                'Membre retiré',
                                'Le membre a été retiré du projet avec succès.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            console.log('Membre supprimé avec succès');
                                        }
                                    }
                                ],
                                {
                                    icon: require('@/assets/images/streamline.jpeg')
                                }
                            );
                        } catch (error) {
                            console.error('Error removing member:', error);
                            Alert.alert(
                                'Erreur', 
                                'Une erreur est survenue lors du retrait du membre. Veuillez réessayer.',
                                [
                                    {
                                        text: 'OK'
                                    }
                                ],
                                {
                                    icon: require('@/assets/images/streamline.jpeg')
                                }
                            );
                        }
                    }
                }
            ],
            {
                icon: require('@/assets/images/streamline.jpeg'),
                cancelable: true
            }
        );
    };

    // Effet pour mettre à jour automatiquement le statut du projet
    // en fonction de l'avancement des tâches
    useEffect(() => {
        if (project && tasks && !statusAutoUpdated) {
            const { shouldUpdate, newStatus, progress } = shouldUpdateProjectStatus(project, tasks);
            
            if (shouldUpdate && newStatus) {
                // Mettre à jour le statut du projet automatiquement
                updateProjectStatus.mutate(
                    { id: Number(projectId), status: newStatus }, // Conversion explicite en nombre
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
                <Text>{translations.common.loading}</Text>
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.headerIcons}>
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => {
                            if (project && project.id) {
                                router.push(`/new-task?projectId=${project.id}`);
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
                        style={[styles.tabButton]} // Supprimer la condition activeTab
                        onPress={() => {
                            setActiveTab('attachment');
                            router.push(`/project/docs/${projectId}`);
                        }}
                    >
                        <Text style={[styles.tabText]}>
                            Attachment
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'kanban' && styles.activeTab]}
                        onPress={() => {
                            setActiveTab('kanban');
                            router.push(`/project/kanban/${projectId}`);
                        }}
                    >
                        <Text style={[styles.tabText, activeTab === 'kanban' && styles.activeTabText]}>
                            Kanban
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.teamSection}>
                    <View style={styles.teamHeaderContainer}>
                        <View>
                            <Text style={styles.sectionTitle}>{translations.projects.teamAssign}</Text>
                            <View style={styles.teamContainer}>
                                {project.members?.map((member) => (
                                    <View key={member.id} style={styles.teamMember}>
                                        <Image 
                                            source={member.photoURL ? 
                                                { uri: member.photoURL } : 
                                                require('@/assets/images/streamline.jpeg')
                                            } 
                                            style={styles.memberAvatar} 
                                        />
                                        <TouchableOpacity 
                                            style={styles.removeMemberButton} 
                                            onPress={() => handleRemoveMember(member.id)}
                                        >
                                            <Ionicons name="close-circle" size={20} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.addMemberButton}>
                                    <Ionicons name="add" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={[styles.progressCircle, shadowStyles.card]}>
                            <Text style={styles.progressPercentage}>
                                {calculateProgress(project)}%
                            </Text>
                            <Text style={styles.progressLabel}>{translations.projects.progress}</Text>
                        </View>
                    </View>

                    <View style={styles.deadlineContainer}>
                        <Ionicons name="alarm-outline" size={20} color="#000" />
                        <Text style={styles.deadlineText}>
                            {translations.projects.deadline} {project?.endDate ? formatDeadline(project.endDate) : 'Non définie'}
                        </Text>
                    </View>
                </View>

                <View style={styles.checklistSection}>
                    <Text style={styles.sectionTitle}>{translations.tasks.plural} ({tasks?.length || 0})</Text>
                    
                    {!tasks?.length ? (
                        <Text style={styles.emptyText}>{translations.projects.noTasks}</Text>
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

            <TouchableOpacity
                style={styles.addTaskButton}
                onPress={() => {
                    if (project && project.id) {
                        router.push(`/new-task?projectId=${project.id}`);
                        console.log(`Navigation vers /new-task?projectId=${project.id}`);
                    } else {
                        console.log("Impossible de naviguer, project.id est undefined");
                    }
                }}
            >
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.addTaskButtonText}>{translations.tasks.newTask}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

function calculateProgress(project: Project | null): number {
    if (!project || !project.tasks || project.tasks.length === 0) return 0;
    
    const completedTasks = project.tasks.filter(task => 
        task.status.toLowerCase() === 'done' || task.status.toLowerCase() === 'completed'
    ).length;
    
    return Math.round((completedTasks / project.tasks.length) * 100);
}

function getInitials(name: string | undefined): string {
    if (!name) return '';
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
    removeMemberButton: {
        position: 'absolute',
        right: -5,
        top: -5,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FF3B30',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 5,
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
    addTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff7a5c',
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 20,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    addTaskButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    backButton: {
        backgroundColor: '#fff',
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
});
