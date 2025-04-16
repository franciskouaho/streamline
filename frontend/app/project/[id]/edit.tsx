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
    ActivityIndicator,
    Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProject, useUpdateProject } from '@/services/queries/projects';
import { useLanguage } from '@/contexts/LanguageContext';
import ColorPicker from "@/components/ui/ColorPicker";
import { Tag } from "@/types/tag";

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
    
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                description: project.description || '',
                startDate: project.startDate ? new Date(project.startDate) : new Date(),
                endDate: project.endDate ? new Date(project.endDate) : new Date(),
                showStartDatePicker: false,
                showEndDatePicker: false,
                tags: project.tags || [],
                newTag: ''
            });
        }
    }, [project]);
    
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

    const formatDate = (date: Date | null) => {
        if (!date) return 'Sélectionner une date';
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleAddTag = () => {
        if (!tagName.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer un nom pour le tag');
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
        setFormData({
            ...formData,
            tags: formData.tags.filter((_, i) => i !== index)
        });
    };
    
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
                tags: formData.tags
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
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier le projet</Text>
                <View style={{width: 24}} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.formSection}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nom du projet</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({...formData, name: text})}
                            placeholder="Nom du projet"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({...formData, description: text})}
                            placeholder="Description du projet"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.datesContainer}>
                        <View style={styles.dateField}>
                            <Text style={styles.label}>Date de début</Text>
                            <TouchableOpacity 
                                style={[styles.dateButton, formData.startDate && styles.dateButtonSelected]}
                                onPress={() => setFormData({...formData, showStartDatePicker: true})}
                            >
                                <Ionicons 
                                    name="calendar-outline" 
                                    size={20} 
                                    color={formData.startDate ? "#ff7a5c" : "#666"} 
                                />
                                <Text style={[styles.dateText, formData.startDate && styles.dateTextSelected]}>
                                    {formatDate(formData.startDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateField}>
                            <Text style={styles.label}>Date de fin</Text>
                            <TouchableOpacity 
                                style={[styles.dateButton, formData.endDate && styles.dateButtonSelected]}
                                onPress={() => setFormData({...formData, showEndDatePicker: true})}
                            >
                                <Ionicons 
                                    name="calendar-outline" 
                                    size={20} 
                                    color={formData.endDate ? "#ff7a5c" : "#666"} 
                                />
                                <Text style={[styles.dateText, formData.endDate && styles.dateTextSelected]}>
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
                                {formData.showStartDatePicker ? 'Date de début' : 'Date de fin'}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setFormData({
                                    ...formData,
                                    showStartDatePicker: false,
                                    showEndDatePicker: false
                                })}
                            >
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {Platform.OS === "ios" && (
                            <View style={styles.iosButtonContainer}>
                                <TouchableOpacity onPress={() => setFormData({
                                    ...formData,
                                    showStartDatePicker: false,
                                    showEndDatePicker: false
                                })}>
                                    <Text style={styles.iosButtonCancel}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
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
                            value={formData.showStartDatePicker ? formData.startDate : formData.endDate}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, formData.showStartDatePicker ? 'start' : 'end')}
                            minimumDate={formData.showEndDatePicker ? formData.startDate : new Date()}
                            style={styles.datePicker}
                            textColor="#000000"
                        />

                        {Platform.OS === "android" && (
                            <TouchableOpacity 
                                style={styles.modalButton}
                                onPress={() => setFormData({
                                    ...formData,
                                    showStartDatePicker: false,
                                    showEndDatePicker: false
                                })}
                            >
                                <Text style={styles.modalButtonText}>Confirmer</Text>
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
        height: 100,
        textAlignVertical: 'top',
    },
    datesContainer: {
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
    modalButton: {
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
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
    },
    updateButton: {
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
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
