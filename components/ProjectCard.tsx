import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadowStyles } from '@/constants/CommonStyles';

interface ProjectCardProps {
    title: string;
    type: string;
    tasks: number;
    progress: number;
    color: string;
    onPress: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, type, tasks, progress, color, onPress }) => {
    return (
        <TouchableOpacity style={[styles.container, shadowStyles.card]} onPress={onPress}>
            <View style={styles.contentContainer}>
                <View style={styles.info}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.type}>{type}</Text>
                    <View style={styles.tasksContainer}>
                        <Ionicons name="checkmark-circle" size={16} color="#888" />
                        <Text style={styles.tasks}>{tasks} Tasks</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={[styles.progressCircle, { borderColor: color }]}>
                        <Text style={styles.progressText}>{progress}%</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
    },
    contentContainer: {
        flexDirection: 'row',
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    type: {
        fontSize: 12,
        color: '#888',
        marginBottom: 10,
    },
    tasksContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tasks: {
        fontSize: 12,
        color: '#888',
        marginLeft: 5,
    },
    progressContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ProjectCard;