import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Modal, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateProject } from "@/services/queries/projects";
import { useAuthStore } from "@/stores/auth";
import api from "@/services/api";
import ColorPicker from "@/components/ui/ColorPicker";
import { Tag } from "@/types/tag";

export default function NewProject() {
    const router = useRouter();
    const { translations } = useLanguage();
    const createProject = useCreateProject();
    const { isAuthenticated } = useAuthStore();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        showStartDatePicker: false,
        showEndDatePicker: false,
        tags: [] as Omit<Tag, 'id'>[],
        newTag: ''
    });

    const [showTagModal, setShowTagModal] = useState(false);
    const [tagName, setTagName] = useState('');
    const [tagColor, setTagColor] = useState('#ff7a5c');
    const [tagIcon, setTagIcon] = useState('pricetag');

    const availableIcons = [
        'pricetag', 'flag', 'bookmark', 'star', 'heart', 'alert',
        'information-circle', 'help-circle', 'checkmark-circle'
    ];

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            startDate: new Date(),
            endDate: new Date(),
            showStartDatePicker: false,
            showEndDatePicker: false,
            tags: [],
            newTag: ''
        });
    };

    const handleDateChange = (event: any, selectedDate?: Date, dateType?: string) => {
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

            if (!formData.name.trim()) {
                Alert.alert('Erreur', 'Veuillez saisir un nom de projet');
                return;
            }

            if (!formData.startDate || !formData.endDate) {
                Alert.alert('Erreur', 'Veuillez sélectionner les dates de début et de fin');
                return;
            }

            const projectData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                startDate: formData.startDate.toISOString().split('T')[0],
                endDate: formData.endDate.toISOString().split('T')[0],
                status: 'active',
                tags: formData.tags.length > 0 ? formData.tags : undefined
            };

            console.log('Sending project data:', projectData);
            const response = await createProject.mutateAsync(projectData);
            console.log('Project created:', response);

            resetForm();
            router.back();
        } catch (error) {
            console.error('Error creating project:', error);
            resetForm();
            let errorMessage = 'Erreur lors de la création du projet';

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Vous n\'êtes pas autorisé à créer un projet. Veuillez vous reconnecter.';

                    try {
                        const { token } = useAuthStore.getState();
                        if (token) {
                            console.log('Tentative avec token explicite');
                            const result = await api.post('/projects', {
                                name: formData.name.trim(),
                                description: formData.description.trim(),
                                startDate: formData.startDate?.toISOString().split('T')[0],
                                endDate: formData.endDate?.toISOString().split('T')[0],
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

    const handleAddTag = () => {
        if (!tagName.trim()) {
            Alert.alert('Erreur', 'Veuillez saisir un nom de tag');
            return;
        }

        const newTag = {
            name: tagName.trim(),
            color: tagColor,
            icon: tagIcon
        };

        setFormData({
            ...formData,
            tags: [...formData.tags, newTag]
        });

        setTagName('');
        setTagColor('#ff7a5c');
        setTagIcon('pricetag');
        setShowTagModal(false);
    };

    const handleRemoveTag = (index: number) => {
        const updatedTags = [...formData.tags];
        updatedTags.splice(index, 1);
        setFormData({
            ...formData,
            tags: updatedTags
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{translations.projects.newProject}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.formSection}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{translations.projects.projectName}</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder={translations.projects.projectName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{translations.projects.description}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
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
                                style={[styles.dateButton, formData.startDate && styles.dateButtonSelected]}
                                onPress={() => setFormData({ ...formData, showStartDatePicker: true })}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color={formData.startDate ? "#ff7a5c" : "#666"}
                                />
                                <Text style={[
                                    styles.dateText,
                                    formData.startDate && styles.dateTextSelected
                                ]}>
                                    {formatDate(formData.startDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateField}>
                            <Text style={styles.label}>{translations.projects.endDate}</Text>
                            <TouchableOpacity
                                style={[styles.dateButton, formData.endDate && styles.dateButtonSelected]}
                                onPress={() => setFormData({ ...formData, showEndDatePicker: true })}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color={formData.endDate ? "#ff7a5c" : "#666"}
                                />
                                <Text style={[
                                    styles.dateText,
                                    formData.endDate && styles.dateTextSelected
                                ]}>
                                    {formatDate(formData.endDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.tagsSectionHeader}>
                            <Text style={styles.label}>Tags</Text>
                            <TouchableOpacity 
                                style={styles.addTagButton}
                                onPress={() => setShowTagModal(true)}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.addTagButtonText}>Ajouter un tag</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {formData.tags.length > 0 ? (
                            <View style={styles.tagsContainer}>
                                {formData.tags.map((tag, index) => (
                                    <View 
                                        key={index} 
                                        style={[styles.tagChip, { backgroundColor: tag.color + '20', borderColor: tag.color }]}
                                    >
                                        {tag.icon && (
                                            <Ionicons 
                                                name={`${tag.icon}-outline`} 
                                                size={14} 
                                                color={tag.color}
                                                style={styles.tagIcon} 
                                            />
                                        )}
                                        <Text style={[styles.tagText, { color: tag.color }]}>
                                            {tag.name}
                                        </Text>
                                        <TouchableOpacity onPress={() => handleRemoveTag(index)}>
                                            <Ionicons name="close-circle" size={16} color={tag.color} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.noTagsContainer}>
                                <Text style={styles.noTagsText}>Aucun tag ajouté</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={formData.showStartDatePicker || formData.showEndDatePicker}
                onRequestClose={() => {
                    setFormData({
                        ...formData,
                        showStartDatePicker: false,
                        showEndDatePicker: false
                    });
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {formData.showStartDatePicker ? translations.projects.startDate : translations.projects.endDate}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setFormData({
                                        ...formData,
                                        showStartDatePicker: false,
                                        showEndDatePicker: false
                                    });
                                }}
                            >
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {Platform.OS === "ios" && (
                            <View style={styles.iosButtonContainer}>
                                <TouchableOpacity onPress={() => {
                                    setFormData({
                                        ...formData,
                                        showStartDatePicker: false,
                                        showEndDatePicker: false
                                    });
                                }}>
                                    <Text style={styles.iosButtonCancel}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    if (formData.showStartDatePicker) {
                                        handleDateChange(null, formData.startDate || new Date(), 'start');
                                    } else {
                                        handleDateChange(null, formData.endDate || new Date(), 'end');
                                    }
                                    setFormData({
                                        ...formData,
                                        showStartDatePicker: false,
                                        showEndDatePicker: false
                                    });
                                }}>
                                    <Text style={styles.iosButtonConfirm}>Confirmer</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <DateTimePicker
                            value={formData.showStartDatePicker ? (formData.startDate || new Date()) : (formData.endDate || new Date())}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, formData.showStartDatePicker ? 'start' : 'end')}
                            minimumDate={formData.showEndDatePicker ? formData.startDate || new Date() : new Date()}
                            style={styles.datePicker}
                            textColor="#000000"
                        />

                        {Platform.OS === "android" && (
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    setFormData({
                                        ...formData,
                                        showStartDatePicker: false,
                                        showEndDatePicker: false
                                    });
                                }}
                            >
                                <Text style={styles.modalButtonText}>{translations.common.confirm}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showTagModal}
                onRequestClose={() => setShowTagModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Créer un tag</Text>
                            <TouchableOpacity onPress={() => setShowTagModal(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nom</Text>
                            <TextInput
                                style={styles.input}
                                value={tagName}
                                onChangeText={setTagName}
                                placeholder="Nom du tag"
                            />
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Couleur</Text>
                            <ColorPicker
                                selectedColor={tagColor}
                                onSelectColor={setTagColor}
                                colors={['#ff7a5c', '#ffb443', '#4d8efc', '#43d2c3', '#9c88ff', '#8c7ae6', '#e84393']}
                            />
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Icône</Text>
                            <View style={styles.iconsContainer}>
                                {availableIcons.map((iconName) => (
                                    <TouchableOpacity
                                        key={iconName}
                                        style={[
                                            styles.iconButton,
                                            tagIcon === iconName && { backgroundColor: tagColor }
                                        ]}
                                        onPress={() => setTagIcon(iconName)}
                                    >
                                        <Ionicons
                                            name={`${iconName}-outline`}
                                            size={20}
                                            color={tagIcon === iconName ? '#fff' : '#000'}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.modalButton}
                            onPress={handleAddTag}
                        >
                            <Text style={styles.modalButtonText}>Sauvegarder</Text>
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
        color: '#000000',
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
    iosButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    iosButtonCancel: {
        color: '#ff3b30',
        fontSize: 16,
    },
    iosButtonConfirm: {
        color: '#ff7a5c',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    tagsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    addTagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff7a5c',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 5,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    addTagButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        gap: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    tagIcon: {
        marginRight: 4,
    },
    noTagsContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    noTagsText: {
        color: '#888',
        fontSize: 14,
    },
    iconsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
});