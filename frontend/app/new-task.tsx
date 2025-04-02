import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateTask } from "@/services/queries/tasks";

interface Category {
    id: string;
    label: string;
}

interface Person {
    id: string;
    name: string;
    avatar?: string;
}

export default function NewTask() {
    const router = useRouter();
    const { translations } = useLanguage();
    const createTask = useCreateTask();
    const [title, setTitle] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [assignee, setAssignee] = useState<string>('');
    const [details, setDetails] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [alertEnabled, setAlertEnabled] = useState<boolean>(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPersonSelector, setShowPersonSelector] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);

    const categories: Category[] = [
        { id: 'design', label: translations.tasks.categories.design },
        { id: 'development', label: translations.tasks.categories.development },
        { id: 'coding', label: translations.tasks.categories.coding },
        { id: 'meeting', label: translations.tasks.categories.meeting },
        { id: 'office', label: 'Office Time' },
        { id: 'user', label: 'User Experience' },
    ];

    const people: Person[] = [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
        { id: '3', name: 'Mike Johnson' },
        { id: '4', name: 'Sarah Wilson' },
    ];

    const toggleCategory = (categoryId: string) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setSelectedDate(selectedDate);
            setDate(selectedDate.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }));
        }
    };

    const selectPerson = (person: Person) => {
        setSelectedPerson(person);
        setShowPersonSelector(false);
        setAssignee(person.name);
    };

    const togglePerson = (person: Person) => {
        const isSelected = selectedPeople.some(p => p.id === person.id);
        if (isSelected) {
            setSelectedPeople(selectedPeople.filter(p => p.id !== person.id));
        } else {
            setSelectedPeople([...selectedPeople, person]);
        }
        setAssignee(selectedPeople.map(p => p.name).join(', '));
    };

    const handleCreateTask = async () => {
        try {
            if (!title) {
                alert('Please enter a task title');
                return;
            }

            const taskData = {
                title,
                description: details,
                dueDate: selectedDate.toISOString(),
                assigneeId: selectedPerson?.id ? parseInt(selectedPerson.id) : undefined,
                status: 'todo',
                priority: 'medium',
                projectId: 1 // Ajouter un projectId par défaut pour test
            };

            console.log('Sending task data:', taskData);
            await createTask.mutateAsync(taskData);
            console.log('Task created successfully');
            router.back();
        } catch (error) {
            console.error('Create task error details:', {
                error,
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            alert('Failed to create task. Please check console for details.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{translations.tasks.newTask}</Text>
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
                        editable={false}
                    />
                    <TouchableOpacity 
                        style={styles.inputIcon} 
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#888" />
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onDateChange}
                    />
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Assignee"
                        value={assignee}
                        editable={false}
                    />
                    <TouchableOpacity 
                        style={styles.inputIcon}
                        onPress={() => setShowPersonSelector(!showPersonSelector)}
                    >
                        <Ionicons name="person" size={20} color="#888" />
                    </TouchableOpacity>
                </View>

                {showPersonSelector && (
                    <View style={styles.personSelector}>
                        {people.map((person) => (
                            <TouchableOpacity
                                key={person.id}
                                style={[
                                    styles.personItem,
                                    selectedPeople.some(p => p.id === person.id) && styles.personItemSelected
                                ]}
                                onPress={() => togglePerson(person)}
                            >
                                <View style={styles.personAvatar}>
                                    <Ionicons name="person-circle-outline" size={24} color="#000" />
                                </View>
                                <Text style={styles.personName}>{person.name}</Text>
                                {selectedPeople.some(p => p.id === person.id) && (
                                    <View style={styles.checkmark}>
                                        <Ionicons name="checkmark" size={20} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

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
                    onPress={handleCreateTask}
                    disabled={createTask.isPending}
                >
                    <Text style={styles.createButtonText}>
                        {createTask.isPending ? 'Creating...' : translations.tasks.createTask}
                    </Text>
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
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 15,
        fontSize: 15,
    },
    inputIcon: {
        padding: 10,
    },
    inputContainerMultiline: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 15,
        height: 120,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    inputMultiline: {
        flex: 1,
        padding: 15,
        fontSize: 15,
        height: "100%",
    },
    toolsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    toolIcon: {
        marginHorizontal: 15,
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
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
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
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
    personSelector: {
        position: 'absolute',
        top: 200, // Position après le champ assignee
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        zIndex: 1000,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    personItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    personAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    personName: {
        fontSize: 16,
        color: '#000',
        flex: 1,
    },
    personItemSelected: {
        backgroundColor: '#ff7a5c',
    },
    checkmark: {
        marginLeft: 'auto',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
});