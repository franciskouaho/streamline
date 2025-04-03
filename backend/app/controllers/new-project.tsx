import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateProject } from "@/services/queries/projects";

export default function NewProject() {
    const router = useRouter();
    const { translations } = useLanguage();
    const createProject = useCreateProject();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Sélectionner une date';
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleCreateProject = async () => {
        try {
            if (!name.trim()) {
                alert('Please enter a project name');
                return;
            }

            const projectData = {
                name: name.trim(),
                description: description.trim() || null,
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
                status: 'active'
            };

            console.log('Creating project:', projectData);
            await createProject.mutateAsync(projectData);
            
            router.back();
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{translations.projects.newProject}</Text>
                <View style={{width: 24}} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.formSection}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{translations.projects.projectName}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder={translations.projects.projectName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{translations.projects.description}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder={translations.projects.description}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.datesContainer}>
                        <View style={styles.dateField}>
                            <Text style={styles.label}>Date de début</Text>
                            <TouchableOpacity 
                                style={[styles.dateButton, startDate && styles.dateButtonSelected]}
                                onPress={() => setShowStartDatePicker(true)}
                            >
                                <Ionicons 
                                    name="calendar-outline" 
                                    size={20} 
                                    color={startDate ? "#ff7a5c" : "#666"} 
                                />
                                <Text style={[
                                    styles.dateText,
                                    startDate && styles.dateTextSelected
                                ]}>
                                    {formatDate(startDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateField}>
                            <Text style={styles.label}>Date de fin</Text>
                            <TouchableOpacity 
                                style={[styles.dateButton, endDate && styles.dateButtonSelected]}
                                onPress={() => setShowEndDatePicker(true)}
                            >
                                <Ionicons 
                                    name="calendar-outline" 
                                    size={20} 
                                    color={endDate ? "#ff7a5c" : "#666"} 
                                />
                                <Text style={[
                                    styles.dateText,
                                    endDate && styles.dateTextSelected
                                ]}>
                                    {formatDate(endDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showStartDatePicker && (
                        <DateTimePicker
                            value={startDate || new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={onStartDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {showEndDatePicker && (
                        <DateTimePicker
                            value={endDate || new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={onEndDateChange}
                            minimumDate={startDate || new Date()}
                        />
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateProject}
                    disabled={createProject.isPending}
                >
                    <Text style={styles.createButtonText}>
                        {createProject.isPending ? 'Creating...' : translations.projects.newProject}
                    </Text>
                </TouchableOpacity>
            </View>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    formSection: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 20,
    },
    createButton: {
        backgroundColor: '#ff7a5c',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dateInput: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    dateText: {
        fontSize: 16,
        color: '#000',
    },
    datesContainer: {
        marginTop: 20,
        gap: 15,
    },
    dateField: {
        gap: 8,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        gap: 10,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    dateButtonSelected: {
        borderColor: '#ff7a5c',
        borderWidth: 2,
    },
    dateText: {
        fontSize: 16,
        color: '#666',
        flex: 1,
    },
    dateTextSelected: {
        color: '#ff7a5c',
        fontWeight: '500',
    },
});
