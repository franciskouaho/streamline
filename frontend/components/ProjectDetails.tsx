import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { shadowStyles } from '@/constants/CommonStyles';
import { useProject, useDeleteProject, useUpdateProjectStatus, useUpdateProject } from '@/services/queries/projects';
import { useProjectTasks, useUpdateTask } from '@/services/queries/tasks';
import { useQueryClient } from '@tanstack/react-query';
import { getProjectStatusLabel, normalizeProjectStatus, shouldUpdateProjectStatus, getStatusColor, calculateProjectProgress } from '@/utils/projectUtils';
import { useLanguage } from '@/contexts/LanguageContext';

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
    const { translations } = useLanguage();
    
    const { data: project, isLoading: isLoadingProject } = useProject(projectId);
    const { data: tasks, isLoading: isLoadingTasks } = useProjectTasks(projectId);
    const queryClient = useQueryClient();
    const updateTask = useUpdateTask();
    const deleteProject = useDeleteProject();
    const updateProjectStatus = useUpdateProjectStatus();
    const updateProject = useUpdateProject();

    console.log('Current tasks:', tasks);
    
    const [activeTab, setActiveTab] = useState<string>('attachment');
    const [showMenu, setShowMenu] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [statusAutoUpdated, setStatusAutoUpdated] = useState(false);

    // État pour contrôler l'édition du projet
    const [showEditProject, setShowEditProject] = useState(false);
    const [editProjectData, setEditProjectData] = useState({
        name: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        showStartDatePicker: false,
        showEndDatePicker: false
    });

    // État pour éditer une tâche
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showEditTask, setShowEditTask] = useState(false);
    const [editTaskData, setEditTaskData] = useState({
        title: '',
        description: '',
        dueDate: new Date(),
        showDueDatePicker: false,
        status: ''
    });

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

    // Initialiser les données d'édition du projet lorsque les données du projet sont chargées
    useEffect(() => {
        if (project) {
            setEditProjectData({
                name: project.name,
                description: project.description || '',
                startDate: project.startDate ? new Date(project.startDate) : new Date(),
                endDate: project.endDate ? new Date(project.endDate) : new Date(),
                showStartDatePicker: false,
                showEndDatePicker: false
            });
        }
    }, [project]);

    // Fonction pour ouvrir le modal d'édition de projet
    const openEditProjectModal = () => {
        if (project) {
            setEditProjectData({
                name: project.name,
                description: project.description || '',
                startDate: project.startDate ? new Date(project.startDate) : new Date(),
                endDate: project.endDate ? new Date(project.endDate) : new Date(),
                showStartDatePicker: false,
                showEndDatePicker: false
            });
            setShowEditProject(true);
        }
    };

    // Fonction pour ouvrir le modal d'édition de tâche
    const openEditTaskModal = (task) => {
        setSelectedTask(task);
        setEditTaskData({
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
            showDueDatePicker: false,
            status: task.status
        });
        setShowEditTask(true);
    };

    // Fonction pour mettre à jour le projet
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
                endDate: editProjectData.endDate.toISOString()
            };

            await updateProject.mutateAsync(updateData);
            setShowEditProject(false);
            Alert.alert('Succès', 'Le projet a été mis à jour avec succès');
        } catch (error) {
            console.error('Error updating project:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour du projet');
        }
    };

    // Fonction pour mettre à jour une tâche
    const handleUpdateTask = async () => {
        try {
            if (!editTaskData.title.trim()) {
                Alert.alert('Erreur', 'Le titre de la tâche est requis');
                return;
            }

            const updateData = {
                id: selectedTask.id,
                title: editTaskData.title,
                description: editTaskData.description,
                dueDate: editTaskData.dueDate.toISOString(),
                status: editTaskData.status
            };

            await updateTask.mutateAsync(updateData);
            setShowEditTask(false);
            setSelectedTask(null);
            Alert.alert('Succès', 'La tâche a été mise à jour avec succès');
        } catch (error) {
            console.error('Error updating task:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour de la tâche');
        }
    };

    // Gérer les changements de date pour le projet
    const handleProjectDateChange = (event, selectedDate, dateType) => {
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

    // Gérer les changements de date pour la tâche
    const handleTaskDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setEditTaskData({
                ...editTaskData,
                showDueDatePicker: false
            });
        }
        
        if (selectedDate) {
            setEditTaskData({
                ...editTaskData,
                dueDate: selectedDate
            });
        }
    };

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
                        onPress={openEditProjectModal}
                    >
                        <Ionicons name="pencil-outline" size={22} color="#000" />
                    </TouchableOpacity>
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
                    <Text style={styles.sectionTitle}>{translations.tasks?.plural || "Tâches"} ({tasks?.length || 0})</Text>
                    
                    {!tasks?.length ? (
                        <Text style={styles.emptyText}>{translations.projects?.noTasks || "Aucune tâche pour ce projet"}</Text>
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
                                {/* Ajout du bouton d'édition de tâche */}
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

            {/* Modal d'édition de projet */}
            <Modal
                visible={showEditProject}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEditProject(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.editModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Modifier le projet</Text>
                            <TouchableOpacity onPress={() => setShowEditProject(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nom du projet</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editProjectData.name}
                                onChangeText={(text) => setEditProjectData({...editProjectData, name: text})}
                                placeholder="Nom du projet"
                            />
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.textInput, styles.textAreaInput]}
                                value={editProjectData.description}
                                onChangeText={(text) => setEditProjectData({...editProjectData, description: text})}
                                placeholder="Description du projet"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Date de début</Text>
                            <TouchableOpacity 
                                style={styles.dateButton}
                                onPress={() => setEditProjectData({
                                    ...editProjectData, 
                                    showStartDatePicker: true
                                })}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <Text style={styles.dateButtonText}>
                                    {editProjectData.startDate.toLocaleDateString('fr-FR')}
                                </Text>
                            </TouchableOpacity>
                            
                            {editProjectData.showStartDatePicker && (
                                <DateTimePicker
                                    value={editProjectData.startDate}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "spinner" : "default"}
                                    onChange={(event, date) => handleProjectDateChange(event, date, 'start')}
                                />
                            )}
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Date de fin</Text>
                            <TouchableOpacity 
                                style={styles.dateButton}
                                onPress={() => setEditProjectData({
                                    ...editProjectData, 
                                    showEndDatePicker: true
                                })}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <Text style={styles.dateButtonText}>
                                    {editProjectData.endDate.toLocaleDateString('fr-FR')}
                                </Text>
                            </TouchableOpacity>
                            
                            {editProjectData.showEndDatePicker && (
                                <DateTimePicker
                                    value={editProjectData.endDate}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "spinner" : "default"}
                                    onChange={(event, date) => handleProjectDateChange(event, date, 'end')}
                                    minimumDate={editProjectData.startDate}
                                />
                            )}
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.updateButton}
                            onPress={handleUpdateProject}
                        >
                            <Text style={styles.updateButtonText}>Mettre à jour le projet</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            
            {/* Modal d'édition de tâche */}
            <Modal
                visible={showEditTask}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEditTask(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.editModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Modifier la tâche</Text>
                            <TouchableOpacity onPress={() => setShowEditTask(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Titre</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editTaskData.title}
                                onChangeText={(text) => setEditTaskData({...editTaskData, title: text})}
                                placeholder="Titre de la tâche"
                            />
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.textInput, styles.textAreaInput]}
                                value={editTaskData.description}
                                onChangeText={(text) => setEditTaskData({...editTaskData, description: text})}
                                placeholder="Description de la tâche"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Date d'échéance</Text>
                            <TouchableOpacity 
                                style={styles.dateButton}
                                onPress={() => setEditTaskData({
                                    ...editTaskData, 
                                    showDueDatePicker: true
                                })}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <Text style={styles.dateButtonText}>
                                    {editTaskData.dueDate.toLocaleDateString('fr-FR')}
                                </Text>
                            </TouchableOpacity>
                            
                            {editTaskData.showDueDatePicker && (
                                <DateTimePicker
                                    value={editTaskData.dueDate}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "spinner" : "default"}
                                    onChange={handleTaskDateChange}
                                />
                            )}
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Statut</Text>
                            <View style={styles.statusButtonsContainer}>
                                <TouchableOpacity 
                                    style={[
                                        styles.statusButton,
                                        editTaskData.status === 'todo' && styles.statusButtonActive,
                                        { borderColor: getStatusColor('todo') }
                                    ]}
                                    onPress={() => setEditTaskData({...editTaskData, status: 'todo'})}
                                >
                                    <Text style={[
                                        styles.statusButtonText,
                                        editTaskData.status === 'todo' && { color: getStatusColor('todo') }
                                    ]}>À faire</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[
                                        styles.statusButton,
                                        editTaskData.status === 'in_progress' && styles.statusButtonActive,
                                        { borderColor: getStatusColor('in_progress') }
                                    ]}
                                    onPress={() => setEditTaskData({...editTaskData, status: 'in_progress'})}
                                >
                                    <Text style={[
                                        styles.statusButtonText,
                                        editTaskData.status === 'in_progress' && { color: getStatusColor('in_progress') }
                                    ]}>En cours</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[
                                        styles.statusButton,
                                        editTaskData.status === 'done' && styles.statusButtonActive,
                                        { borderColor: getStatusColor('done') }
                                    ]}
                                    onPress={() => setEditTaskData({...editTaskData, status: 'done'})}
                                >
                                    <Text style={[
                                        styles.statusButtonText,
                                        editTaskData.status === 'done' && { color: getStatusColor('done') }
                                    ]}>Terminé</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.updateButton}
                            onPress={handleUpdateTask}
                        >
                            <Text style={styles.updateButtonText}>Mettre à jour la tâche</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    // Styles pour l'édition de projet et de tâche
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
    editTaskButton: {
        padding: 8,
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
});