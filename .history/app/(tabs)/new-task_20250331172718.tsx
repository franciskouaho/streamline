import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';

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
                        // Logic to create task
                        router.back();
                    }}   <Text style={styles.createButtonText}>Create Task</Text>
                >
                    <Text style={styles.createButtonText}>Create Task</Text>
                </TouchableOpacity>iew>
            </View>
        </SafeAreaView>
    );
}const styles = StyleSheet.create({

const styles = StyleSheet.create({
    container: {ndColor: "#f2f2f2",
        flex: 1,
        backgroundColor: "#f2f2f2",ader: {
    },irection: "row",
    header: {e-between",
        flexDirection: "row",
        justifyContent: "space-between",,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,aderTitle: {
    },18,
    headerTitle: {700",
        fontSize: 18,
        fontWeight: "700",ntent: {
    },1,
    content: {orizontal: 20,
        flex: 1,
        paddingHorizontal: 20,putContainer: {
    },or: "#fff",
    inputContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,ow",
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",putContainerMultiline: {
        borderWidth: 1,",
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,put: {
        elevation: 8,: 1,
    },ertical: 15,
    inputContainerMultiline: {5,
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 15,putMultiline: {
        height: 120,
        borderWidth: 1, 15,
        borderColor: '#000',,
        shadowColor: '#000',",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,putIcon: {
        shadowRadius: 0, 10,
        elevation: 8,
    },olsContainer: {
    input: {: "row",
        flex: 1,er",
        paddingVertical: 15,
        paddingHorizontal: 15,
        fontSize: 15,olIcon: {
    },orizontal: 15,
    inputMultiline: {
        flex: 1,
        padding: 15,ctionTitle: {
        fontSize: 15,6,
        height: "100%",600",
    },
    inputIcon: {
        padding: 10,tegoriesContainer: {
    },w",
    toolsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,tegoryItem: {
    },olor: "#f8f8f8",
    toolIcon: {
        marginHorizontal: 15,15,
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 8,,
        borderWidth: 1,
        borderColor: '#000',tegorySelected: {
        shadowColor: '#000',: "#333",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,tegoryText: {
        shadowRadius: 0,3",
        elevation: 4,
    },
    sectionTitle: {tegoryTextSelected: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 15,ertSection: {
    },on: "row",
    categoriesContainer: {e-between",
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
    },ertText: {
    categoryItem: {: 16,
        backgroundColor: "#f8f8f8",500",
        paddingVertical: 8,
        paddingHorizontal: 15,ertToggle: {
        borderRadius: 20,
        marginRight: 10,,
        marginBottom: 10,s: 13,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',ertToggleOn: {
        shadowOffset: { width: 4, height: 4 },lor: "#ff7a5c",
        shadowOpacity: 1,
        shadowRadius: 0,ertToggleOff: {
        elevation: 8,or: "#e0e0e0",
    },
    categorySelected: {ertToggleCircle: {
        backgroundColor: "#333",
    },,
    categoryText: {s: 10,
        color: "#333","white",
        fontSize: 14,
    },ertToggleCircleOn: {
    categoryTextSelected: {,
        color: "#fff",
    },ertToggleCircleOff: {
    alertSection: {
        flexDirection: "row",
        justifyContent: "space-between",oter: {
        alignItems: "center",ng: 20,
        marginBottom: 30,
    },eateButton: {
    alertText: {olor: "#ff7a5c",
        fontSize: 16,
        fontWeight: "500",
    },"center",
    alertToggle: {
        width: 50,eateButtonText: {
        height: 26,
        borderRadius: 13,
        padding: 3,600",
    },
    alertToggleOn: {        backgroundColor: "#ff7a5c",
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
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    createButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});