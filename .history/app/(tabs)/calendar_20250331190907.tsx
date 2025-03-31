import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';

interface Day {
    day: string;
    date: number;
}

interface Assignee {
    id: number;
    image: any;
}

interface Task {
    id: number;
    time: string;
    title: string;
    isCompleted: boolean;
    subTask?: string;
    assignees?: Assignee[];
}

const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState<number>(17);

    const days: Day[] = [
        { day: 'Mon', date: 14 },
        { day: 'Tue', date: 15 },
        { day: 'Wed', date: 16 },
        { day: 'Thu', date: 17 },
        { day: 'Fri', date: 18 },
        { day: 'Sat', date: 19 },
        { day: 'Sun', date: 20 },
    ];

    const tasks: Task[] = [
        {
            id: 1,
            time: '09:00 am - 10:15 am',
            title: 'Optimize server response time',
            isCompleted: false
        },
        {
            id: 2,
            time: '10:45 am - 11:45 am',
            title: 'Team Meeting (Designer and Developer)',
            isCompleted: false,
            subTask: 'Optimization Website for Rune.io',
            assignees: [
                { id: 1, image: require("../../assets//images/team1.jpeg") },
                { id: 2, image: require("../../assets//images/team1.jpeg") },
                { id: 3, image: require("../../assets//images/team1.jpeg") },
            ]
        },
        {
            id: 3,
            time: '03:00 pm - 04:15 pm',
            title: 'Optimize Homepage Design',
            isCompleted: false
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Text style={styles.title}>Wednesday, 17 January 2024</Text>
                </View>
                <TouchableOpacity style={[styles.addButton, shadowStyles.button]}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.calendarStrip}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.daysContainer}
                >
                    {days.map((item) => (
                        <TouchableOpacity
                            key={item.date}
                            style={[
                                styles.dayItem,
                                selectedDate === item.date && styles.selectedDay
                            ]}
                            onPress={() => setSelectedDate(item.date)}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    selectedDate === item.date && styles.selectedDayText
                                ]}
                            >
                                {item.day}
                            </Text>
                            <Text
                                style={[
                                    styles.dateText,
                                    selectedDate === item.date && styles.selectedDateText
                                ]}
                            >
                                {item.date}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.tasksContainer} showsVerticalScrollIndicator={false}>
                {tasks.map((task, index) => (
                    <View key={task.id} style={styles.taskItem}>
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>{task.time.split(' - ')[0]}</Text>
                        </View>

                        <View style={styles.taskContent}>
                            <TouchableOpacity style={[styles.task, shadowStyles.card]}>
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
                                                    <View key={assignee.id} style={styles.assigneeAvatar} />
                                                ))}
                                                <TouchableOpacity style={styles.nextButton}>
                                                    <Ionicons name="chevron-forward" size={16} color="#000" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={styles.addTaskContainer}>
                    <TouchableOpacity
                        style={styles.addTaskButton}
                        onPress={() => {/* Navigation vers new-task */}}
                    >
                        <View style={styles.plusIcon}>
                            <Ionicons name="add" size={20} color="#000" />
                        </View>
                        <Text style={styles.addTaskText}>Add new subtask</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Calendar;

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
    headerTitle: {
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarStrip: {
        marginBottom: 20,
    },
    daysContainer: {
        paddingHorizontal: 15,
    },
    dayItem: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        width: 40,
        height: 70,
        borderRadius: 20,
    },
    selectedDay: {
        backgroundColor: '#ff7a5c',
    },
    dayText: {
        fontSize: 12,
        color: '#888',
        marginBottom: 5,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '500',
    },
    selectedDayText: {
        color: '#fff',
    },
    selectedDateText: {
        color: '#fff',
        fontWeight: '600',
    },
    tasksContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    taskItem: {
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
        backgroundColor: '#ddd',
        marginRight: 5,
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
    addTaskContainer: {
        alignItems: 'center',
        marginVertical: 20,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: '#fff',
        padding: 5,
    },
    addTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    plusIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    addTaskText: {
        fontSize: 14,
        color: '#666',
    },
});