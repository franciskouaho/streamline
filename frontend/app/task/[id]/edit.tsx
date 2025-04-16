import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTask, useUpdateTask } from "@/services/queries/tasks";
import { useProjects } from "@/services/queries/projects";
import { useProjectTags } from "@/services/queries/projectTags";

export default function EditTask() {
  const router = useRouter();
  const { id, projectId } = useLocalSearchParams();
  const taskId = Array.isArray(id) ? id[0] : id as string;
  const { translations } = useLanguage();
  
  const { data: task, isLoading } = useTask(taskId);
  const { data: projects } = useProjects();
  const updateTask = useUpdateTask();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | string | null>(null);
  const { data: projectTags } = useProjectTags(selectedProjectId);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showTagsModal, setShowTagsModal] = useState<boolean>(false);
  
  // Initialiser les données du formulaire quand la tâche est chargée
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "todo");
      setPriority(task.priority || "medium");
      setSelectedProjectId(task.projectId || null);
      
      if (task.dueDate) {
        setDueDate(new Date(task.dueDate));
      }
      
      // Initialiser les tags si présents
      if (task.tags && task.tags.length > 0) {
        setSelectedTags(task.tags);
      }
    }
  }, [task]);
  
  // Gérer le changement de date
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };
  
  // Gérer la sélection de tags
  const toggleTagSelection = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Mettre à jour la tâche
  const handleUpdateTask = async () => {
    try {
      if (!title) {
        Alert.alert(translations.errors?.validation?.title || "Erreur", translations.errors?.validation?.requiredFields || "Le titre de la tâche est requis");
        return;
      }
      
      // S'assurer que les valeurs sont du bon type
      const updateData = {
        id: Number(taskId),
        title,
        description,
        status,
        priority,
        dueDate: dueDate.toISOString(),
        projectId: selectedProjectId ? Number(selectedProjectId) : undefined,
        tagIds: selectedTags.length > 0 ? selectedTags.map(tag => tag.id) : undefined
      };
      
      console.log("Données de mise à jour envoyées:", updateData);
      
      const result = await updateTask.mutateAsync(updateData);
      
      console.log("Résultat de la mise à jour:", result);
      
      Alert.alert(
        translations.common?.save || "Succès", 
        translations.tasks?.updateSuccess || "La tâche a été mise à jour avec succès", 
        [
          {
            text: "OK",
            onPress: () => {
              // Simplifier la navigation
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.error("Erreur détaillée lors de la mise à jour de la tâche:", error);
      
      // Message d'erreur plus descriptif
      const errorMessage = error instanceof Error ? 
        `${translations.tasks?.errors?.update || "Une erreur est survenue lors de la mise à jour de la tâche"}: ${error.message}` :
        translations.tasks?.errors?.update || "Une erreur est survenue lors de la mise à jour de la tâche";
      
      Alert.alert(translations.errors?.validation?.title || "Erreur", errorMessage);
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff7a5c" />
          <Text style={styles.loadingText}>{translations.common?.loading || "Chargement de la tâche..."}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{translations.tasks?.errors?.taskNotFound || "Tâche non trouvée"}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>{translations.common?.back || "Retour"}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations.common?.edit || "Modifier"} {translations.tasks?.singular?.toLowerCase() || "la tâche"}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{translations.editProfile?.title || "Informations générales"}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{translations.tasks?.taskName || "Titre"}</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={translations.tasks?.taskName || "Titre de la tâche"}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{translations.tasks?.description || "Description"}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder={translations.tasks?.description || "Description de la tâche"}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{translations.tasks?.dueDate || "Date d'échéance"}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateButtonText}>
                  {dueDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                  style={styles.datePicker}
                  textColor="#000000"
                />
              )}
            </View>
          </View>
          
          {projects && projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{translations.projects?.newProject || "Projet"}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.projectsScrollView}
              >
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.projectButton,
                      selectedProjectId === project.id && styles.selectedProjectButton
                    ]}
                    onPress={() => setSelectedProjectId(project.id)}
                  >
                    <Text
                      style={[
                        styles.projectButtonText,
                        selectedProjectId === project.id && styles.selectedProjectButtonText
                      ]}
                    >
                      {project.name}
                    </Text>
                    {selectedProjectId === project.id && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedProjectId && projectTags && projectTags.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <TouchableOpacity 
                  style={styles.selectTagsButton}
                  onPress={() => setShowTagsModal(true)}
                >
                  <Ionicons name="pricetags-outline" size={18} color="#ff7a5c" />
                  <Text style={styles.selectTagsButtonText}>Gérer les tags</Text>
                </TouchableOpacity>
              </View>
              
              {selectedTags.length > 0 ? (
                <View style={styles.tagsContainer}>
                  {selectedTags.map(tag => (
                    <View 
                      key={tag.id} 
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
                      <TouchableOpacity onPress={() => toggleTagSelection(tag)}>
                        <Ionicons name="close-circle" size={16} color={tag.color} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noTagsContainer}>
                  <Text style={styles.noTagsText}>Aucun tag sélectionné</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTagsModal}
        onRequestClose={() => setShowTagsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner des tags</Text>
              <TouchableOpacity onPress={() => setShowTagsModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.tagsList}>
              {projectTags && projectTags.map(tag => {
                const isSelected = selectedTags.some(t => t.id === tag.id);
                return (
                  <TouchableOpacity 
                    key={tag.id}
                    style={[styles.tagItem, isSelected && styles.tagItemSelected]}
                    onPress={() => toggleTagSelection(tag)}
                  >
                    <View style={[styles.tagColorDot, { backgroundColor: tag.color }]} />
                    <Text style={styles.tagItemName}>{tag.name}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#ff7a5c" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowTagsModal(false)}
            >
              <Text style={styles.modalButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, updateTask.isPending && styles.disabledButton]}
          onPress={handleUpdateTask}
          disabled={updateTask.isPending}
        >
          {updateTask.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{translations.editProfile?.save || "Enregistrer les modifications"}</Text>
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
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ff3b30',
    marginTop: 20,
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
  backButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    backgroundColor: '#fff',
    borderRadius: 25,  // Valeur plus élevée pour rendre le bouton rond
    width: 50,        // Largeur fixe pour garantir un cercle parfait
    height: 50,       // Hauteur fixe pour garantir un cercle parfait
    alignItems: 'center',  // Centrer l'icône horizontalement
    justifyContent: 'center', // Centrer l'icône verticalement
  },
  backButtonText: {
    fontSize: 16,
    color: '#ff7a5c',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  priorityButtonLow: {
    backgroundColor: "#43d2c3",
  },
  priorityButtonMedium: {
    backgroundColor: "#ffb443",
  },
  priorityButtonHigh: {
    backgroundColor: "#ff3b30",
  },
  priorityText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  projectsScrollView: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  projectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedProjectButton: {
    backgroundColor: "#ff7a5c",
    borderColor: "#ff7a5c",
  },
  projectButtonText: {
    fontSize: 14,
    color: "#333",
  },
  selectedProjectButtonText: {
    color: "#fff",
    marginRight: 5,
  },
  footer: {
    padding: 20,
    backgroundColor: "#f2f2f2",
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
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
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  datePicker: {
    color: '#000000', // Assurer une bonne visibilité sur iOS
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: "#aaa",
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectTagsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  selectTagsButtonText: {
    color: '#ff7a5c',
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
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
    marginBottom: 15,
  },
  noTagsText: {
    color: '#888',
    fontSize: 14,
  },
  tagsList: {
    maxHeight: 300,
    marginBottom: 15,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tagItemSelected: {
    backgroundColor: 'rgba(255, 122, 92, 0.1)',
  },
  tagColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  tagItemName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
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
});
