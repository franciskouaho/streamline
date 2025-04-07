import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProject, useUpdateProject } from '@/services/queries/projects';
import { useLanguage } from '@/contexts/LanguageContext';
import { getStatusColor } from '@/utils/projectUtils';

export default function EditProject() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const projectId = Array.isArray(id) ? id[0] : id as string;
    const { translations } = useLanguage();
    
    const { data: project, isLoading: isLoadingProject } = useProject(projectId);
    const updateProject = useUpdateProject();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        showStartDatePicker: false,
        showEndDatePicker: false,
        status: ''
    });
    
    // Initialiser les données du projet
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                description: project.description || '',
                startDate: project.startDate ? new Date(project.startDate) : new Date(),
                endDate: project.endDate ? new Date(project.endDate) : new Date(),
                showStartDatePicker: false,
                showEndDatePicker: false,
                status: project.status
            });
        }
    }, [project]);
    
    // Gérer les changements de date
    const handleDateChange = (event, selectedDate, dateType) => {
        if (Platform.OS === 'android') {
            setFormData({
                ...formData,
                showStartDatePicker: false,
                showEndDatePicker: false
            });
        }
        
        if (selectedDate) {
            if (dateType === 'start') {
                setFormData({
                    ...formData,
                    startDate: selectedDate
                });
            } else {
                setFormData({
                    ...formData,
                    endDate: selectedDate
                });
            }
        }
    };
    
    // Fonction pour mettre à jour le projet
    const handleUpdateProject = async () => {
        try {
            if (!formData.name.trim()) {
                Alert.alert('Erreur', 'Le nom du projet est requis');
                return;
            }

            const updateData = {
                id: Number(projectId),
                name: formData.name,
                description: formData.description,
                startDate: formData.startDate.toISOString(),
                endDate: formData.endDate.toISOString(),
                status: formData.status
            };

            await updateProject.mutateAsync(updateData);
            Alert.alert(
                'Succès', 
                'Le projet a été mis à jour avec succès',
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error updating project:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour du projet');
        }
    };

    if (isLoadingProject) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff7a5c" />
                    <Text style={styles.loadingText}>{translations.common.loading}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!project) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Projet non trouvé</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier le projet</Text>
                <View style={{width: 40}} />
            </View>
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nom du projet</Text>
                    <TextInput
                        style={styles.textInput}
                        value={formData.name}
                        onChangeText={(text) => setFormData({...formData, name: text})}
                        placeholder="Nom du projet"
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                        style={[styles.textInput, styles.textAreaInput]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({...formData, description: text})}
                        placeholder="Description du projet"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Statut</Text>
                    <View style={styles.statusButtonsContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.statusButton,
                                formData.status === 'ongoing' && styles.statusButtonActive,
                                { borderColor: getStatusColor('ongoing') }
                            ]}
                            onPress={() => setFormData({...formData, status: 'ongoing'})}
                        >
                            <Text style={[
                                styles.statusButtonText,
                                formData.status === 'ongoing' && { color: getStatusColor('ongoing') }
                            ]}>En cours</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.statusButton,
                                formData.status === 'in_progress' && styles.statusButtonActive,
                                { borderColor: getStatusColor('in_progress') }
                            ]}
                            onPress={() => setFormData({...formData, status: 'in_progress'})}
                        >
                            <Text style={[
                                styles.statusButtonText,
                                formData.status === 'in_progress' && { color: getStatusColor('in_progress') }
                            ]}>En progression</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.statusButton,
                                formData.status === 'completed' && styles.statusButtonActive,
                                { borderColor: getStatusColor('completed') }
                            ]}
                            onPress={() => setFormData({...formData, status: 'completed'})}
                        >
                            <Text style={[
                                styles.statusButtonText,
                                formData.status === 'completed' && { color: getStatusColor('completed') }
                            ]}>Terminé</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Date de début</Text>
                    <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => setFormData({
                            ...formData, 
                            showStartDatePicker: true
                        })}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={styles.dateButtonText}>
                            {formData.startDate.toLocaleDateString('fr-FR')}
                        </Text>
                    </TouchableOpacity>
                    
                    {formData.showStartDatePicker && (
                        <DateTimePicker
                            value={formData.startDate}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(event, date) => handleDateChange(event, date, 'start')}
                            textColor="#000000"
                        />
                    )}
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Date de fin</Text>
                    <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => setFormData({
                            ...formData, 
                            showEndDatePicker: true
                        })}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={styles.dateButtonText}>
                            {formData.endDate.toLocaleDateString('fr-FR')}
                        </Text>
                    </TouchableOpacity>
                    
                    {formData.showEndDatePicker && (
                        <DateTimePicker
                            value={formData.endDate}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(event, date) => handleDateChange(event, date, 'end')}
                            minimumDate={formData.startDate}
                            textColor="#000000"
                        />
                    )}
                </View>
            </ScrollView>
            
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.updateButton}
                    onPress={handleUpdateProject}
                    disabled={updateProject.isPending}
                >
                    {updateProject.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.updateButtonText}>Mettre à jour le projet</Text>
                    )}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    backButton: {
        backgroundColor: '#fff',
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    textInput: {
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    textAreaInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
    },
    dateButtonText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    statusButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        marginHorizontal: 2,
    },
    statusButtonActive: {
        backgroundColor: '#f0f0f0',
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
    footer: {
        padding: 20,
    },
    updateButton: {
        backgroundColor: '#ff7a5c',
        borderRadius: 10,
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
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
