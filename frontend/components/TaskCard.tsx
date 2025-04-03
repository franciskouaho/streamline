import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '@/types/task';
import { formatDueDate } from '@/utils/projectUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaskCardProps {
    task: Task;
    onPress: () => void;
    onAddSubTask: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onAddSubTask }) => {
    const { translations } = useLanguage();
    
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.timeContainer}>
                {task.time && (
                    <Text style={styles.timeText}>{task.time.split(' - ')[0]}</Text>
                )}
                {!task.time && task.dueDate && (
                    <Text style={styles.timeText}>{new Date(task.dueDate).toLocaleDateString()}</Text>
                )}
            </View>
            
            <View style={styles.taskContent}>
                <View style={styles.task}>
                    <View style={styles.taskHeader}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <TouchableOpacity>
                            <Ionicons name="ellipsis-horizontal" size={18} color="#888" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.subTaskContainer}>
                        {task.description && (
                            <Text style={styles.subTaskText} numberOfLines={2}>
                                {task.description}
                            </Text>
                        )}
                        
                        <View style={styles.assignees}>
                            {task.assignees && task.assignees.map((assignee) => (
                                <View key={assignee.id} style={styles.assigneeAvatar}>
                                    <Image 
                                        source={assignee.image} 
                                        style={styles.avatarImage}
                                    />
                                </View>
                            ))}
                            
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>
                                    {translations.tasks[task.status] || task.status}
                                </Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.addSubTaskButton} 
                                onPress={() => onAddSubTask(task.id)}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="#ff7a5c" />
                                <Text style={styles.addSubTaskText}>
                                    {translations.projects.addSubtask || "Ajouter une sous-tâche"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    timeContainer: {
        width: 50,
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        color: '#888',
    },
    taskContent: {
        flex: 1,
        marginLeft: 15,
    },
    task: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { 
            width: 0, 
            height: 1 
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '500',
        width: '80%',
    },
    subTaskContainer: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    subTaskText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    assignees: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    assigneeAvatar: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        marginRight: 5,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    statusBadge: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 5,
        marginLeft: 5,
    },
    statusText: {
        fontSize: 10,
        color: '#555',
    },
    addSubTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginTop: 5,
    },
    addSubTaskText: {
        marginLeft: 5,
        color: '#ff7a5c',
        fontSize: 12,
    },
});

export default TaskCard;