import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Category {
    id: string;
    label: string;
}

export default function NewTask() {
    const router = useRouter();
    const [title, setTitle] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [assignee, setAssignee] = useState<string>('');
    const [details, setDetails] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [alertEnabled, setAlertEnabled] = useState<boolean>(true);

    const categories: Category[] = [
        { id: 'design', label: 'Design' },
        { id: 'development', label: 'Development' },
        { id: 'coding', label: 'Coding' },
        { id: 'meeting', label: 'Meeting' },
        { id: 'office', label: 'Office Time' },
        { id: 'user', label: 'User Experience' },
    ];

    const toggleCategory = (categoryId: string) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Tasks</Text>
                <TouchableOpacity>
                    <Ionicons name="search" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Task Title"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Date"
                        value={date}
                        onChangeText={setDate}
                    />
                    <TouchableOpacity style={styles.inputIcon}>
                        <Ionicons name="chevron-down" size={20} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Assignee"
                        value={assignee}
                        onChangeText={setAssignee}
                    />
                    <TouchableOpacity style={styles.inputIcon}>
                        <Ionicons name="search" size={20} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainerMultiline}>
                    <TextInput
                        style={styles.inputMultiline}
                        placeholder="Add your task details"
                        multiline
                        value={details}
                        onChangeText={setDetails}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.toolsContainer}>
                    <TouchableOpacity style={styles.toolIcon}>
                        <Ionicons name="grid" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolIcon}>
                        <Ionicons name="text" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolIcon}>
                        <Ionicons name="brush" size={20} color="#000" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Category</Text>

                <View style={styles.categoriesContainer}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryItem,
                                selectedCategories.includes(category.id) && styles.categorySelected
                            ]}
                            onPress={() => toggleCategory(category.id)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategories.includes(category.id) && styles.categoryTextSelected
                                ]}
                            >
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.alertSection}>
                    <Text style={styles.alertText}>Get alert for this task</Text>
                    <TouchableOpacity
                        style={[
                            styles.alertToggle,
                            alertEnabled ? styles.alertToggleOn : styles.alertToggleOff
                        ]}
                        onPress={() => setAlertEnabled(!alertEnabled)}
                    >
                        <View
                            style={[
                                styles.alertToggleCircle,
                                alertEnabled ? styles.alertToggleCircleOn : styles.alertToggleCircleOff
                            ]}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => {
                        router.back();
                    }}
                >
                    <Text style={styles.createButtonText}>Create Task</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    inputContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
    },
    inputContainerMultiline: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 15,
        height: 120,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 15,
        fontSize: 15,
    },
    inputMultiline: {
        flex: 1,
        padding: 15,
        fontSize: 15,
        height: "100%",
    },
    inputIcon: {
        padding: 10,
    },
    toolsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    toolIcon: {
        marginHorizontal: 15,
        padding: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 15,
    },
    categoriesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
    },
    categoryItem: {
        backgroundColor: "#f8f8f8",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
    },
    categorySelected: {
        backgroundColor: "#333",
    },
    categoryText: {
        color: "#333",
        fontSize: 14,
    },
    categoryTextSelected: {
        color: "#fff",
    },
    alertSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
    },
    alertText: {
        fontSize: 16,
        fontWeight: "500",
    },
    alertToggle: {
        width: 50,
        height: 26,
        borderRadius: 13,
        padding: 3,
    },
    alertToggleOn: {
        backgroundColor: "#ff7a5c",
    },
    alertToggleOff: {
        backgroundColor: "#e0e0e0",
    },
    alertToggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "white",
    },
    alertToggleCircleOn: {
        marginLeft: "auto",
    },
    alertToggleCircleOff: {
        marginLeft: 0,
    },
    footer: {
        padding: 20,
    },
    createButton: {
        backgroundColor: "#ff7a5c",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
    },
    createButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});