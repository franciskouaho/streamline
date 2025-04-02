import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import NewSubTaskModal from "@/components/NewSubTaskModal";

interface Day {
    day: string;
    date: number;
    fullDate: Date;
}

interface Assignee {
    id: number;
    image: any;
}

interface SubTask {
    id: number;
    title: string;
    isCompleted: boolean;
    taskId: number;
}

interface Task {
    id: number;
    time: string;
    title: string;
    isCompleted: boolean;
    subTask?: string;
    subTasks?: SubTask[];
    assignees?: Assignee[];
}

export default function Calendar() {
    const { translations } = useLanguage();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [days, setDays] = useState<Day[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    useEffect(() => {
        const generateWeekDays = () => {
            const today = new Date();
            const currentDay = today.getDay();
            const monday = new Date(today);
            monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

            const weekDays: Day[] = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);
                weekDays.push({
                    day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                    date: date.getDate(),
                    fullDate: date
                });
            }
            setDays(weekDays);
        };

        generateWeekDays();
    }, []);

    const [tasks, setTasks] = useState<Task[]>([
        {
            id: 1,
            time: '09:00 am - 10:15 am',
            title: 'Optimize server response time',
            isCompleted: false,
            subTasks: []
        },
        {
            id: 2,
            time: '10:45 am - 11:45 am',
            title: 'Team Meeting (Designer and Developer)',
            isCompleted: false,
            subTask: 'Optimization Website for Rune.io',
            subTasks: [],
            assignees: [
                { id: 1, image: require("../../assets/images/team1.jpeg") },
                { id: 2, image: require("../../assets/images/team1.jpeg") },
                { id: 3, image: require("../../assets/images/team1.jpeg") },
            ]
        },
        {
            id: 3,
            time: '03:00 pm - 04:15 pm',
            title: 'Optimize Homepage Design',
            isCompleted: false,
            subTasks: []
        }
    ]);

    const handleAddSubTask = (title: string) => {
        if (selectedTaskId) {
            const newSubTask: SubTask = {
                id: Date.now(), // Générer un ID unique
                title,
                isCompleted: false,
                taskId: selectedTaskId
            };

            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === selectedTaskId 
                        ? {
                            ...task,
                            subTasks: [...(task.subTasks || []), newSubTask]
                          }
                        : task
                )
            );
            setIsModalVisible(false);
        }
    };

    const openNewSubTaskModal = (taskId: number) => {
        setSelectedTaskId(taskId);
        setIsModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {translations.calendar.schedule}
                </Text>
            </View>

            <View style={styles.calendarContainer}>
                <View style={styles.viewSelector}>
                    <TouchableOpacity style={styles.viewOption}>
                        <Text>{translations.calendar.day}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.viewOption, styles.activeViewOption]}>
                        <Text>{translations.calendar.week}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.viewOption}>
                        <Text>{translations.calendar.month}</Text>
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
                                    selectedDate.getDate() === item.date && 
                                    selectedDate.getMonth() === item.fullDate.getMonth() && 
                                    styles.selectedDay
                                ]}
                                onPress={() => setSelectedDate(item.fullDate)}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        selectedDate.getDate() === item.date &&
                                        selectedDate.getMonth() === item.fullDate.getMonth() &&
                                        styles.selectedDayText
                                    ]}
                                >
                                    {item.day}
                                </Text>
                                <Text
                                    style={[
                                        styles.dateText,
                                        selectedDate.getDate() === item.date &&
                                        selectedDate.getMonth() === item.fullDate.getMonth() &&
                                        styles.selectedDateText
                                    ]}
                                >
                                    {item.date}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView style={styles.tasksContainer} showsVerticalScrollIndicator={false}>
                    {tasks.map((task) => (
                        <View key={task.id} style={styles.taskItem}>
                            <View style={styles.timeContainer}>
                                <Text style={styles.timeText}>{task.time.split(' - ')[0]}</Text>
                            </View>

                            <View style={styles.taskContent}>
                                <View style={[styles.task, shadowStyles.card]}>
                                    <View style={styles.taskHeader}>
                                        <Text style={styles.taskTitle}>{task.title}</Text>
                                        <TouchableOpacity onPress={() => openNewSubTaskModal(task.id)}>
                                            <Ionicons name="add-circle-outline" size={24} color="#ff7a5c" />
                                        </TouchableOpacity>
                                    </View>

                                    {task.subTasks && task.subTasks.length > 0 && (
                                        <View style={styles.subTaskContainer}>
                                            {task.subTasks.map(subTask => (
                                                <View key={subTask.id} style={styles.subTaskItem}>
                                                    <Text style={styles.subTaskText}>{subTask.title}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

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
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}

                    <View style={styles.addTaskContainer}>
                        <TouchableOpacity
                            style={styles.addTaskButton}
                            onPress={openNewSubTaskModal}
                        >
                            <View style={styles.plusIcon}>
                                <Ionicons name="add" size={20} color="#000" />
                            </View>
                            <Text style={styles.addTaskText}>Add new subtask</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            <NewSubTaskModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onAdd={handleAddSubTask}
            />
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
    calendarContainer: {
        flex: 1,
    },
    viewSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    viewOption: {
        padding: 10,
    },
    activeViewOption: {
        borderBottomWidth: 2,
        borderBottomColor: '#ff7a5c',
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
    subTaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 4,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12.5,
    },
});