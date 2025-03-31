import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TaskCardProps {
    task: {
        id: number;
        title: string;
        type: string;
        date: string;
        time?: string;
        assignees?: Array<{ id: number; image: any }>;
        subTask?: string;
        isCompleted: boolean;
    };
    onPress: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.timeContainer}>
                {task.time && (
                    <Text style={styles.timeText}>{task.time.split(' - ')[0]}</Text>
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
                    
                    {task.subTask && (
                        <View style={styles.subTaskContainer}>
                            <Text style={styles.subTaskText}>{task.subTask}</Text>
                            
                            {task.assignees && (
                                <View style={styles.assignees}>
                                    {task.assignees.map((assignee) => (
                                        <View key={assignee.id} style={styles.assigneeAvatar}>
                                            <Image 
                                                source={assignee.image} 
                                                style={styles.avatarImage}
                                            />
                                        </View>
                                    ))}
                                    <TouchableOpacity style={styles.nextButton}>
                                        <Ionicons name="chevron-forward" size={16} color="#000" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
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
    nextButton: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
});

export default TaskCard;