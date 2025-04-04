import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateProject } from "@/services/queries/projects";
import { useAuthStore } from "@/stores/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from "@/services/api";

export default function NewProject() {
    const router = useRouter();
    const { translations } = useLanguage();
    const createProject = useCreateProject();
    const { isAuthenticated } = useAuthStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const resetForm = () => {
        setName('');
        setDescription('');
        setStartDate(null);
        setEndDate(null);
    };

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
            if (!isAuthenticated) {
                Alert.alert('Erreur', 'Vous devez être connecté pour créer un projet');
                router.push('/login');
                return;
            }

            if (!name.trim()) {
                Alert.alert('Erreur', 'Veuillez saisir un nom de projet');
                return;
            }

            if (!startDate || !endDate) {
                Alert.alert('Erreur', 'Veuillez sélectionner les dates de début et de fin');
                return;
            }

            const projectData = {
                name: name.trim(),
                description: description.trim(),
                startDate: startDate.toISOString().split('T')[0],  // Format YYYY-MM-DD
                endDate: endDate.toISOString().split('T')[0],      // Format YYYY-MM-DD
                status: 'active',
            };

            console.log('Sending project data:', projectData);
            const response = await createProject.mutateAsync(projectData);
            console.log('Project created:', response);
            
            resetForm();
            router.back();
        } catch (error) {
            console.error('Error creating project:', error);
            
            let errorMessage = 'Erreur lors de la création du projet';
            
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Vous n\'êtes pas autorisé à créer un projet. Veuillez vous reconnecter.';
                    
                    // Si l'erreur est due à l'authentification, on peut essayer de récupérer le token
                    try {
                        const { token } = useAuthStore.getState();
                        if (token) {
                            console.log('Tentative avec token explicite');
                            const result = await api.post('/projects', {
                                name: name.trim(),
                                description: description.trim(),
                                startDate: startDate?.toISOString().split('T')[0],
                                endDate: endDate?.toISOString().split('T')[0],
                                status: 'active',
                            });
                            console.log('Project created with explicit token:', result.data);
                            resetForm();
                            router.back();
                            return;
                        }
                    } catch (tokenError) {
                        console.error('Failed with explicit token:', tokenError);
                        router.push('/login');
                    }
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }
            
            Alert.alert('Erreur', errorMessage);
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
                            <Text style={styles.label}>{translations.projects.startDate}</Text>
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
                            <Text style={styles.label}>{translations.projects.endDate}</Text>
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
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showStartDatePicker || showEndDatePicker}
                onRequestClose={() => {
                    setShowStartDatePicker(false);
                    setShowEndDatePicker(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {showStartDatePicker ? translations.projects.startDate : translations.projects.endDate}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => {
                                    setShowStartDatePicker(false);
                                    setShowEndDatePicker(false);
                                }}
                            >
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <DateTimePicker
                            value={showStartDatePicker ? (startDate || new Date()) : (endDate || new Date())}
                            mode="date"
                            display="spinner"
                            onChange={showStartDatePicker ? onStartDateChange : onEndDateChange}
                            minimumDate={showEndDatePicker ? startDate || new Date() : new Date()}
                            style={styles.datePicker}
                        />

                        <TouchableOpacity 
                            style={styles.modalButton}
                            onPress={() => {
                                setShowStartDatePicker(false);
                                setShowEndDatePicker(false);
                            }}
                        >
                            <Text style={styles.modalButtonText}>{translations.common.confirm}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    datePicker: {
        marginBottom: 20,
        height: 200,
    },
    modalButton: {
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
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
