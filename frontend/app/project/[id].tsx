import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Image, ActivityIndicator, FlatList, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';
import { useProject, useDeleteProject, useUpdateProjectStatus, useRemoveProjectMember, useAddProjectMember, useUpdateProject } from '@/services/queries/projects';
import { useProjectTasks, useUpdateTask } from '@/services/queries/tasks';
import { useTeamMembers } from '@/services/queries/team';
import { useQueryClient } from '@tanstack/react-query';
import { shouldUpdateProjectStatus } from '@/utils/projectUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/auth';
import ProjectTagDisplay from '@/components/ui/ProjectTagDisplay';
import { Tag } from "@/types/tag";

interface ProjectMember {
    id: number;
    userId: number;
    fullName: string;
    email?: string;
    photoURL?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
    projectId?: number;
    permissions?: any;
}

interface TeamMember {
    id: number;
    fullName: string;
    email: string;
    photoURL?: string;
    status: string;
}

interface ProjectTask {
    id: number | string;
    title: string;
    status: string;
    dueDate?: string;
    projectId?: number | string;
}

interface Project {
    id: number | string;
    name: string;
    description?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    members?: ProjectMember[];
    tasks?: ProjectTask[];
    tags?: Tag[];
}

interface TaskStatusUpdateInput {
    id: number | string;
    status: string;
}

function formatDeadline(dateString: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function getInitials(name: string | undefined): string {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        console.log('Invalid name provided to getInitials:', name);
        return '?';
    }

    console.log('Getting initials for name:', name);

    try {
        if (name.startsWith('User ') && name.length > 5) {
            return 'U' + name.substring(5, 6);
        }

        const initials = name.trim()
            .split(/\s+/)
            .filter(word => word.length > 0)
            .map(word => word[0])
            .join('')
            .toUpperCase();

        return initials || '?';
    } catch (error) {
        console.error('Error getting initials:', error);
        return '?';
    }
}

export default function ProjectDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const projectId = Array.isArray(id) ? id[0] : id as string;
    const { translations } = useLanguage();
    const { user } = useAuthStore();

    const { data: project, isLoading: isLoadingProject } = useProject(projectId);
    const { data: tasks, isLoading: isLoadingTasks } = useProjectTasks(projectId);
    const queryClient = useQueryClient();
    const updateTask = useUpdateTask();
    const deleteProject = useDeleteProject();
    const updateProjectStatus = useUpdateProjectStatus();
    const removeProjectMember = useRemoveProjectMember();
    const addProjectMember = useAddProjectMember();
    const updateProject = useUpdateProject();

    const [showEditProject, setShowEditProject] = useState(false);
    const [editProjectData, setEditProjectData] = useState({
        name: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        showStartDatePicker: false,
        showEndDatePicker: false,
        status: ''
    });

    const { data: teamMembers, isLoading: isLoadingTeamMembers } = useTeamMembers();

    const [activeTab, setActiveTab] = useState<string>('');
    const [showMenu, setShowMenu] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [statusAutoUpdated, setStatusAutoUpdated] = useState(false);

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<TeamMember[]>([]);

    const handleTaskToggle = async (task: ProjectTask) => {
        try {
            console.log('Toggling task:', task.id);
            const updateData: TaskStatusUpdateInput = {
                id: Number(task.id),
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
                                ]
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
                                ]
                            );
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        if (project && tasks && !statusAutoUpdated) {
            const { shouldUpdate, newStatus, progress } = shouldUpdateProjectStatus(project, tasks);

            if (shouldUpdate && newStatus) {
                updateProjectStatus.mutate(
                    { id: Number(projectId), status: newStatus },
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

    const openAddMemberModal = () => {
        setSelectedMembersToAdd([]);
        setShowAddMemberModal(true);
    };

    const toggleMemberSelection = (member: TeamMember) => {
        const isSelected = selectedMembersToAdd.some(m => m.id === member.id);
        if (isSelected) {
            setSelectedMembersToAdd(selectedMembersToAdd.filter(m => m.id !== member.id));
        } else {
            setSelectedMembersToAdd([...selectedMembersToAdd, member]);
        }
    };

    const addSelectedMembersToProject = async () => {
        if (selectedMembersToAdd.length === 0) {
            setShowAddMemberModal(false);
            return;
        }

        try {
            for (const member of selectedMembersToAdd) {
                await addProjectMember.mutateAsync({
                    projectId: Number(projectId),
                    memberId: member.id
                });
            }

            setShowAddMemberModal(false);
            queryClient.invalidateQueries({ queryKey: ['projects', projectId] });

            Alert.alert(
                'Membres ajoutés',
                'Les membres sélectionnés ont été ajoutés au projet avec succès.'
            );
        } catch (error) {
            console.error('Error adding members to project:', error);
            Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de l\'ajout des membres au projet.'
            );
        }
    };

    const getAvailableTeamMembers = () => {
        if (!teamMembers || !project || !project.members) return [];

        const projectMemberIds = project.members.map(member => member.id);

        return teamMembers.filter(member =>
            !projectMemberIds.includes(member.id) &&
            member.status === 'active' &&
            member.id !== user?.id
        );
    };

    const renderTeamMemberItem = ({ item }: { item: TeamMember }) => {
        const isSelected = selectedMembersToAdd.some(m => m.id === item.id);

        return (
            <TouchableOpacity
                style={[styles.memberItem, isSelected && styles.memberItemSelected]}
                onPress={() => toggleMemberSelection(item)}
            >
                <View style={styles.memberAvatarContainer}>
                    <View style={[styles.memberAvatarItem, styles.memberAvatarPlaceholder]}>
                        <Text style={styles.memberAvatarInitials}>
                            {getInitials(item.fullName)}
                        </Text>
                    </View>
                </View>
                <View style={styles.memberItemInfo}>
                    <Text style={styles.memberItemName}>{item.fullName}</Text>
                    <Text style={styles.memberItemEmail}>{item.email}</Text>
                </View>
                {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#ff7a5c" />
                )}
            </TouchableOpacity>
        );
    };

    useEffect(() => {
        if (project) {
            setEditProjectData({
                name: project.name,
                description: project.description || '',
                startDate: project.startDate ? new Date(project.startDate) : new Date(),
                endDate: project.endDate ? new Date(project.endDate) : new Date(),
                showStartDatePicker: false,
                showEndDatePicker: false,
                status: project.status
            });
        }
    }, [project]);

    const openEditProjectModal = () => {
        if (project) {
            router.push(`/project/${projectId}/edit`);
        }
    };

    const handleProjectDateChange = (event: any, selectedDate: Date | undefined, dateType: 'start' | 'end') => {
        if (Platform.OS === 'android') {
            setEditProjectData({
                ...editProjectData,
                showStartDatePicker: false,
                showEndDatePicker: false
            });
        }

        if (selectedDate) {
            if (dateType === 'start') {
                setEditProjectData({
                    ...editProjectData,
                    startDate: selectedDate
                });
            } else {
                setEditProjectData({
                    ...editProjectData,
                    endDate: selectedDate
                });
            }
        }
    };

    const handleUpdateProject = async () => {
        try {
            if (!editProjectData.name.trim()) {
                Alert.alert('Erreur', 'Le nom du projet est requis');
                return;
            }

            const updateData = {
                id: Number(projectId),
                name: editProjectData.name,
                description: editProjectData.description,
                startDate: editProjectData.startDate.toISOString(),
                endDate: editProjectData.endDate.toISOString(),
                status: editProjectData.status
            };

            await updateProject.mutateAsync(updateData);
            setShowEditProject(false);
            Alert.alert('Succès', 'Le projet a été mis à jour avec succès');
        } catch (error) {
            console.error('Error updating project:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour du projet');
        }
    };

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

    const availableTeamMembers = getAvailableTeamMembers();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace('/(tabs)')}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={openEditProjectModal}
                    >
                        <Ionicons name="pencil-outline" size={22} color="#000" />
                    </TouchableOpacity>
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

                {/* Section des tags */}
                {project.tags && project.tags.length > 0 && (
                    <View style={styles.tagsSection}>
                        <Text style={styles.sectionTitle}>{translations.tags.name}</Text>
                        <ProjectTagDisplay tags={project.tags} size="large" />
                    </View>
                )}

                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'kanban' && styles.activeTab]}
                        onPress={() => {
                            setActiveTab('kanban');
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
                    <View style={styles.teamHeaderContainer}>
                        <View>
                            <Text style={styles.sectionTitle}>{translations.projects.teamAssign}</Text>
                            <View style={styles.teamContainer}>
                                {project.members?.map((member) => {
                                    const memberName = member.fullName || `User ${member.userId || member.id}`;
                                    const initials = getInitials(memberName);

                                    return (
                                        <View key={member.id} style={styles.teamMember}>
                                            <View
                                                style={[
                                                    styles.memberAvatar,
                                                    {
                                                        backgroundColor: '#ff7a5c',
                                                        borderWidth: 1,
                                                        borderColor: '#000'
                                                    }
                                                ]}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: 'bold',
                                                        color: 'white',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {initials || '?'}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.removeMemberButton}
                                                onPress={() => handleRemoveMember(member.id)}
                                            >
                                                <Ionicons name="close-circle" size={20} color="#FF3B30" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                                <TouchableOpacity
                                    style={styles.addMemberButton}
                                    onPress={openAddMemberModal}
                                >
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
                                    onPress={() => handleTaskToggle(task as ProjectTask)}
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
                                        <Text style={styles.taskDueDateText}>
                                            {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </Text>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={styles.editTaskIconButton}
                                    onPress={() => router.push(`/task/${task.id}/edit?projectId=${projectId}`)}
                                >
                                    <Ionicons name="pencil-outline" size={18} color="#666" />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={showAddMemberModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddMemberModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ajouter des membres</Text>
                            <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {isLoadingTeamMembers ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#ff7a5c" />
                                <Text style={styles.loadingText}>Chargement des membres...</Text>
                            </View>
                        ) : availableTeamMembers.length > 0 ? (
                            <FlatList
                                data={availableTeamMembers}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderTeamMemberItem}
                                showsVerticalScrollIndicator={false}
                                style={styles.membersList}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Tous les membres de l'équipe sont déjà ajoutés à ce projet.</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.modalButton,
                                selectedMembersToAdd.length === 0 && styles.modalButtonDisabled
                            ]}
                            onPress={addSelectedMembersToProject}
                            disabled={selectedMembersToAdd.length === 0}
                        >
                            <Text style={styles.modalButtonText}>
                                {selectedMembersToAdd.length === 0
                                    ? 'Aucun membre sélectionné'
                                    : `Ajouter ${selectedMembersToAdd.length} membre(s)`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    deleteButton: {
        borderColor: '#ff3b30',
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
    teamContainer: {
        flexDirection: "row",
        marginBottom: 15,
    },
    teamMember: {
        marginRight: 10,
        position: 'relative',
    },
    memberAvatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: "#ccc",
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberAvatarPlaceholder: {
        backgroundColor: '#ff7a5c',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    memberInitials: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
    },
    memberAvatarContainer: {
        marginRight: 15,
    },
    memberAvatarItem: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    memberAvatarInitials: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 40,
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
    deadlineContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    deadlineText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: "500",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 15,
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
    taskContent: {
        flex: 1,
        marginLeft: 15,
    },
    checklistText: {
        flex: 1,
        fontSize: 14,
    },
    checklistTextCompleted: {
        textDecorationLine: "line-through",
        color: "#888",
    },
    taskDueDateText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    editTaskIconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 3,
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
    membersList: {
        maxHeight: 400,
        marginBottom: 20,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    memberItemSelected: {
        backgroundColor: 'rgba(255, 122, 92, 0.1)',
    },
    memberItemInfo: {
        flex: 1,
    },
    memberItemName: {
        fontSize: 16,
        fontWeight: '500',
    },
    memberItemEmail: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    loadingContainer: {
        padding: 30,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginTop: 20,
    },
    modalButton: {
        backgroundColor: '#ff7a5c',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    modalButtonDisabled: {
        backgroundColor: '#ccc',
        shadowOffset: { width: 2, height: 2 },
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    editModalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
        color: '#333',
    },
    textInput: {
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    textAreaInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
    },
    dateButtonText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    updateButton: {
        backgroundColor: '#ff7a5c',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
        marginTop: 10,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    statusButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        marginHorizontal: 2,
    },
    statusButtonActive: {
        backgroundColor: '#f0f0f0',
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '500',
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
    tagsSection: {
        marginBottom: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
    },
    tagIcon: {
        marginRight: 6,
    },
});
