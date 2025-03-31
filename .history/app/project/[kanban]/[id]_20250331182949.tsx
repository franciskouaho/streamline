import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shadowStyles } from '@/constants/CommonStyles';

interface Task {
    id: number;
    title: string;
    status: 'todo' | 'inProgress' | 'done';
}

export default function KanbanBoard() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [tasks] = useState<Task[]>([
        { id: 1, title: 'Design System', status: 'todo' },
        { id: 2, title: 'User Flow', status: 'inProgress' },
        { id: 3, title: 'Wireframes', status: 'done' },
        { id: 4, title: 'Prototype', status: 'todo' },
    ]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={[styles.backButton, shadowStyles.button]}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kanban Board</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView horizontal style={styles.boardContainer}>
                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#ffb443' }]}>
                        <Text style={styles.columnTitle}>To Do</Text>
                        <Text style={styles.taskCount}>
                            {tasks.filter(t => t.status === 'todo').length}
                        </Text>
                    </View>
                    {tasks
                        .filter(task => task.status === 'todo')
                        .map(task => (
                            <View key={task.id} style={[styles.taskCard, shadowStyles.card]}>
                                <Text style={styles.taskTitle}>{task.title}</Text>
                            </View>
                        ))}
                </View>

                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#4d8efc' }]}>
                        <Text style={styles.columnTitle}>In Progress</Text>
                        <Text style={styles.taskCount}>
                            {tasks.filter(t => t.status === 'inProgress').length}
                        </Text>
                    </View>
                    {tasks
                        .filter(task => task.status === 'inProgress')
                        .map(task => (
                            <View key={task.id} style={[styles.taskCard, shadowStyles.card]}>
                                <Text style={styles.taskTitle}>{task.title}</Text>
                            </View>
                        ))}
                </View>

                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#43d2c3' }]}>
                        <Text style={styles.columnTitle}>Done</Text>
                        <Text style={styles.taskCount}>
                            {tasks.filter(t => t.status === 'done').length}
                        </Text>
                    </View>
                    {tasks
                        .filter(task => task.status === 'done')
                        .map(task => (
                            <View key={task.id} style={[styles.taskCard, shadowStyles.card]}>
                                <Text style={styles.taskTitle}>{task.title}</Text>
                            </View>
                        ))}
                </View>
            </ScrollView>

            <TouchableOpacity 
                style={[styles.addButton, shadowStyles.button]}
                onPress={() => router.push('/new-task')}
            >
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
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
    },
});
