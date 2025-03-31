import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadowStyles } from '@/constants/CommonStyles';

interface TaskStatusCardProps {
    title: string;
    count: number;
    icon: string;
    color: string;
}

const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ title, count, icon, color }) => {
    return (
        <View style={[styles.container, { borderLeftColor: color }, shadowStyles.card]}>
            <View style={styles.contentContainer}>
                <MaterialCommunityIcons name={icon as any} size={24} color={color} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.count}>{count} Tasks</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 15,
        width: '48%',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderLeftWidth: 4,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        marginLeft: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
    },
    count: {
        fontSize: 12,
        color: '#888',
    },
});

export default TaskStatusCard;