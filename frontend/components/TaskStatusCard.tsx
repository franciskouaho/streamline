import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaskStatusCardProps {
    title: string;
    count: number;
    icon: string;
    color: string;
}

const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ title, count, icon, color }) => {
    const { translations } = useLanguage();
    
    return (
        <View style={[styles.container, { borderLeftColor: color }]}>
            <View style={styles.contentContainer}>
                <MaterialCommunityIcons name={icon as any} size={24} color={color} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.count}>{count} {count > 1 ? translations.tasks.plural : translations.tasks.singular}</Text>
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
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