import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shadowStyles } from '@/constants/CommonStyles';
import { useProjectTasks, useUpdateTask, useDeleteTask } from '@/services/queries/tasks';
import { useProject } from '@/services/queries/projects';
import { useLanguage } from '@/contexts/LanguageContext';
import { TaskStatusUpdateInput } from '@/types/task';  // Importer depuis task.ts

interface TaskAssignee {
    id: number;
    fullName: string;
}

interface TaskData {
    id: number;
    title: string;
    description?: string;
    status: string;
    dueDate?: string;
    assignee?: TaskAssignee;
    projectId?: number | string;
}

export default function KanbanBoard() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const projectId = Array.isArray(id) ? id[0] : id as string;
    const { translations } = useLanguage();
    
    const { data: project, isLoading: isLoadingProject } = useProject(projectId);
    const { data: tasks, isLoading: isLoadingTasks } = useProjectTasks(projectId);
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
    const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

    // Filtrer les tâches par statut
    const getTasksByStatus = (status: string): TaskData[] => {
        if (!tasks) return [];
        return tasks.filter(task => {
            if (status === 'todo' && task.status === 'todo') return true;
            if (status === 'inProgress' && task.status === 'in_progress') return true;
            if (status === 'done' && task.status === 'done') return true;
            return false;
        }) as TaskData[];
    };

    const handleTaskStatusChange = async (taskId: number | string, newStatus: string) => {
        try {
            const updateData: TaskStatusUpdateInput = {
                id: Number(taskId),
                status: newStatus
            };
            await updateTask.mutateAsync(updateData);
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    const openStatusModal = (task: TaskData) => {
        setSelectedTask(task);
        setShowStatusModal(true);
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedTask) return;
        
        try {
            const updateData: TaskStatusUpdateInput = {
                id: Number(selectedTask.id),
                status: newStatus
            };
            await updateTask.mutateAsync(updateData);
            setShowStatusModal(false);
            setSelectedTask(null);
        } catch (error) {
            console.error("Error updating task status:", error);
            Alert.alert("Erreur", "Impossible de mettre à jour le statut de la tâche");
        }
    };

    const handleDeleteTask = async (taskId: number | string) => {
        try {
            Alert.alert(
                "Supprimer la tâche",
                "Êtes-vous sûr de vouloir supprimer cette tâche ?",
                [
                    {
                        text: "Annuler",
                        style: "cancel"
                    },
                    {
                        text: "Supprimer",
                        style: "destructive",
                        onPress: async () => {
                            await deleteTask.mutateAsync(Number(taskId));
                            setShowStatusModal(false);
                            setSelectedTask(null);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Error deleting task:", error);
            Alert.alert("Erreur", "Impossible de supprimer la tâche");
        }
    };

    const navigateToTaskDetails = (taskId: number | string) => {
        router.push(`/task/${taskId}` as any);
    };

    if (isLoadingProject || isLoadingTasks) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff7a5c" />
                <Text style={styles.loadingText}>Chargement du tableau...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => {
                        router.push({
                            pathname: `/project/${projectId}` as any
                        });
                    }}
                    style={[styles.backButton, shadowStyles.button]}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{translations.projects?.kanban || "Kanban"}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView horizontal style={styles.boardContainer}>
                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#ffb443' }]}>
                        <Text style={styles.columnTitle}>À faire</Text>
                        <Text style={styles.taskCount}>
                            {getTasksByStatus('todo').length}
                        </Text>
                    </View>
                    {getTasksByStatus('todo').map(task => (
                        <TouchableOpacity 
                            key={task.id} 
                            style={[styles.taskCard, shadowStyles.card]}
                            onPress={() => openStatusModal(task)}
                            onLongPress={() => navigateToTaskDetails(task.id)}
                        >
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            {task.dueDate && (
                                <View style={styles.taskDueDate}>
                                    <Ionicons name="calendar-outline" size={12} color="#666" />
                                    <Text style={styles.dueDateText}>
                                        {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </Text>
                                </View>
                            )}
                            {task.assignee && (
                                <View style={styles.assigneeContainer}>
                                    <View style={styles.assigneeAvatar}>
                                        <Text style={styles.assigneeInitials}>
                                            {getInitials(task.assignee.fullName)}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#4d8efc' }]}>
                        <Text style={styles.columnTitle}>En cours</Text>
                        <Text style={styles.taskCount}>
                            {getTasksByStatus('inProgress').length}
                        </Text>
                    </View>
                    {getTasksByStatus('inProgress').map(task => (
                        <TouchableOpacity 
                            key={task.id} 
                            style={[styles.taskCard, shadowStyles.card]}
                            onPress={() => openStatusModal(task)}
                            onLongPress={() => navigateToTaskDetails(task.id)}
                        >
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            {task.dueDate && (
                                <View style={styles.taskDueDate}>
                                    <Ionicons name="calendar-outline" size={12} color="#666" />
                                    <Text style={styles.dueDateText}>
                                        {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </Text>
                                </View>
                            )}
                            {task.assignee && (
                                <View style={styles.assigneeContainer}>
                                    <View style={styles.assigneeAvatar}>
                                        <Text style={styles.assigneeInitials}>
                                            {getInitials(task.assignee.fullName)}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#43d2c3' }]}>
                        <Text style={styles.columnTitle}>Terminé</Text>
                        <Text style={styles.taskCount}>
                            {getTasksByStatus('done').length}
                        </Text>
                    </View>
                    {getTasksByStatus('done').map(task => (
                        <TouchableOpacity 
                            key={task.id} 
                            style={[styles.taskCard, shadowStyles.card]}
                            onPress={() => openStatusModal(task)}
                            onLongPress={() => navigateToTaskDetails(task.id)}
                        >
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            {task.dueDate && (
                                <View style={styles.taskDueDate}>
                                    <Ionicons name="calendar-outline" size={12} color="#666" />
                                    <Text style={styles.dueDateText}>
                                        {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </Text>
                                </View>
                            )}
                            {task.assignee && (
                                <View style={styles.assigneeContainer}>
                                    <View style={styles.assigneeAvatar}>
                                        <Text style={styles.assigneeInitials}>
                                            {getInitials(task.assignee.fullName)}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <Modal
                transparent={true}
                visible={showStatusModal}
                animationType="slide"
                onRequestClose={() => setShowStatusModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.statusModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Modifier la tâche</Text>
                            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity
                            style={[styles.statusOption, { backgroundColor: '#ffb443' }]}
                            onPress={() => handleStatusChange('todo')}
                        >
                            <Ionicons name="list" size={20} color="#fff" />
                            <Text style={styles.statusOptionText}>À faire</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.statusOption, { backgroundColor: '#4d8efc' }]}
                            onPress={() => handleStatusChange('in_progress')}
                        >
                            <Ionicons name="hourglass" size={20} color="#fff" />
                            <Text style={styles.statusOptionText}>En cours</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.statusOption, { backgroundColor: '#43d2c3' }]}
                            onPress={() => handleStatusChange('done')}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.statusOptionText}>Terminé</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.deleteTaskButton}
                            onPress={() => {
                                if (selectedTask) {
                                    handleDeleteTask(selectedTask.id);
                                }
                            }}
                        >
                            <Ionicons name="trash-outline" size={20} color="#fff" />
                            <Text style={styles.deleteTaskButtonText}>Supprimer la tâche</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity 
                style={[styles.addButton, shadowStyles.button]}
                onPress={() => router.push({
                    pathname: "/new-task",
                    params: { projectId: projectId }
                })}
            >
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
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
        backgroundColor: '#f2f2f2',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
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
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    boardContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    column: {
        width: 280,
        marginRight: 15,
    },
    columnHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    columnTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    taskCount: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    taskCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ff7a5c',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 5,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statusModal: {
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
    deleteTaskButton: {
        backgroundColor: '#ff3b30',
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 5,
    },
    deleteTaskButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 10,
    },
    taskDetailsButton: {
        backgroundColor: '#ff7a5c',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 5,
    },
    taskDetailsButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    }
});

