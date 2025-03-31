import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import TaskStatusCard from "@/components/TaskStatusCard";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import { TopBar } from "@/components/ui/TopBar";

interface StatusData {
    type: string;
    title: string;
    count: number;
    icon: string;
    color: string;
}

interface ProjectData {
    id: number;
    title: string;
    type: string;
    tasks: number;
    progress: number;
    color: string;
}

interface TaskData {
    id: number;
    title: string;
    type: string; // "todo", "inprogress", "completed"
    date: string;
    time?: string;
    assignees?: Array<{ id: number; image: any }>;
    subTask?: string;
    priority?: "low" | "medium" | "high";
    isCompleted: boolean;
}

const Home = () => {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<"projects" | "tasks">("projects");

    const statusData: StatusData[] = [
        { type: "ongoing", title: "On going", count: 24, icon: "sync", color: "#4d8efc" },
        { type: "inprogress", title: "In Process", count: 12, icon: "clock-outline", color: "#ffb443" },
        { type: "completed", title: "Completed", count: 42, icon: "file-document-outline", color: "#43d2c3" },
        { type: "canceled", title: "Canceled", count: 8, icon: "file-cancel-outline", color: "#ff7a5c" },
    ];

    const projectsData: ProjectData[] = [
        { id: 1, title: "Website for Rune.io", type: "Digital Product Design", tasks: 12, progress: 40, color: "#ff7a5c" },
        { id: 2, title: "Dashboard for ProSavvy", type: "Digital Product Design", tasks: 12, progress: 75, color: "#43d2c3" },
        { id: 3, title: "Mobile Apps for Track.id", type: "Digital Product Design", tasks: 12, progress: 50, color: "#ffb443" },
        { id: 4, title: "Website for CourierGo.com", type: "Digital Product Design", tasks: 12, progress: 40, color: "#4d8efc" },
    ];

    const tasksData: TaskData[] = [
        {
            id: 1,
            title: "Optimize server response time",
            type: "todo",
            date: "Today",
            time: "09:00 am - 10:15 am",
            isCompleted: false
        },
        {
            id: 2,
            title: "Team Meeting (Designer and Developer)",
            type: "inprogress",
            date: "Today",
            time: "10:45 am - 11:45 am",
            subTask: "Optimization Website for Rune.io",
            assignees: [
                { id: 1, image: require("../assets/team1.png") },
                { id: 2, image: require("../assets/team2.png") },
                { id: 3, image: require("../assets/team3.png") },
            ],
            isCompleted: false
        },
        {
            id: 3,
            title: "Optimize Homepage Design",
            type: "inprogress",
            date: "Today",
            time: "03:00 pm - 04:15 pm",
            isCompleted: false
        },
        {
            id: 4,
            title: "User Authentication Implementation",
            type: "completed",
            date: "Yesterday",
            isCompleted: true
        },
        {
            id: 5,
            title: "Mobile Responsiveness Testing",
            type: "completed",
            date: "Yesterday",
            isCompleted: true
        }
    ];

    // Grouper les tâches par date
    const groupedTasks = tasksData.reduce((acc, task) => {
        if (!acc[task.date]) {
            acc[task.date] = [];
        }
        acc[task.date].push(task);
        return acc;
    }, {} as Record<string, TaskData[]>);

    // Dates dans l'ordre (Aujourd'hui en premier, puis Hier, etc.)
    const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
        if (a === "Today") return -1;
        if (b === "Today") return 1;
        if (a === "Yesterday") return -1;
        if (b === "Yesterday") return 1;
        return a.localeCompare(b);
    });

    return (
        <SafeAreaView style={styles.container}>
            <TopBar />
            <View style={styles.viewToggle}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        viewMode === "projects" && styles.activeToggleButton
                    ]}
                    onPress={() => setViewMode("projects")}
                >
                    <Ionicons
                        name="grid-outline"
                        size={20}
                        color={viewMode === "projects" ? "#fff" : "#666"}
                    />
                    <Text
                        style={[
                            styles.toggleText,
                            viewMode === "projects" && styles.activeToggleText
                        ]}
                    >
                        Projects
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        viewMode === "tasks" && styles.activeToggleButton
                    ]}
                    onPress={() => setViewMode("tasks")}
                >
                    <Ionicons
                        name="list-outline"
                        size={20}
                        color={viewMode === "tasks" ? "#fff" : "#666"}
                    />
                    <Text
                        style={[
                            styles.toggleText,
                            viewMode === "tasks" && styles.activeToggleText
                        ]}
                    >
                        Tasks
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.content}>
                    <View style={styles.statusCardsContainer}>
                        {statusData.map((status) => (
                            <TaskStatusCard
                                key={status.type}
                                title={status.title}
                                count={status.count}
                                icon={status.icon}
                                color={status.color}
                            />
                        ))}
                    </View>

                    {viewMode === "projects" ? (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Projects</Text>
                            </View>

                            <View style={styles.projectsContainer}>
                                {projectsData.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        title={project.title}
                                        type={project.type}
                                        tasks={project.tasks}
                                        progress={project.progress}
                                        color={project.color}
                                        onPress={() => router.push(`/project/${project.id}`)}
                                    />
                                ))}
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.taskViewHeader}>
                                <Text style={styles.taskViewTitle}>My Tasks</Text>
                                <View style={styles.calendarButton}>
                                    <Ionicons name="calendar-outline" size={20} color="#000" />
                                </View>
                            </View>

                            {sortedDates.map(date => (
                                <View key={date} style={styles.taskDateSection}>
                                    <Text style={styles.taskDateTitle}>{date}</Text>
                                    
                                    {groupedTasks[date].map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onPress={() => router.push(`/task/${task.id}`)}
                                        />
                                    ))}
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addTaskButton} onPress={() => router.push('/new-task')}>
                                <Text style={styles.addTaskText}>Add new task</Text>
                                <Ionicons name="add-circle" size={24} color="#ff7a5c" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color="#ff7a5c" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.navItem}
                    onPress={() => router.push("/calendar")}
                >
                    <Ionicons name="calendar-outline" size={24} color="#888" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => router.push("/new-task")}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.navItem}
                    onPress={() => router.push("/docs")}
                >
                    <Ionicons name="document-text-outline" size={24} color="#888" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.navItem}
                    onPress={() => router.push("/profile")}
                >
                    <Ionicons name="person-outline" size={24} color="#888" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    viewToggle: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 85,
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    toggleButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: "#f0f0f0",
    },
    activeToggleButton: {
        backgroundColor: "#ff7a5c",
    },
    toggleText: {
        marginLeft: 5,
        color: "#666",
        fontWeight: "500",
    },
    activeToggleText: {
        color: "#fff",
    },
    statusCardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 10,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    projectsContainer: {
        paddingHorizontal: 20,
        marginBottom: 80,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    content: {
        flex: 1,
    },
    taskViewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 15,
    },
    taskViewTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    calendarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
    },
    taskDateSection: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    taskDateTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
        color: "#666",
    },
    addTaskButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 80,
    },
    addTaskText: {
        color: "#ff7a5c",
        fontSize: 16,
        fontWeight: "500",
        marginRight: 5,
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        paddingBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 5,
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
    },
    addButton: {
        backgroundColor: "#ff7a5c",
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        bottom: 10,
        shadowColor: "#ff7a5c",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
});