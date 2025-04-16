import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProjectTags, useCreateProjectTag, useDeleteProjectTag } from '@/services/queries/projectTags';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tag } from '@/types/tag';
import ColorPicker from '@/components/ui/ColorPicker';

interface ProjectTagsManagerProps {
  projectId: string | number;
  onClose: () => void;
  visible: boolean;
}

export default function ProjectTagsManager({ projectId, onClose, visible }: ProjectTagsManagerProps) {
  const { translations } = useLanguage();
  const { data: tags, isLoading, refetch } = useProjectTags(projectId);
  const createTag = useCreateProjectTag(projectId);
  const deleteTag = useDeleteProjectTag(projectId);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ff7a5c');
  const [icon, setIcon] = useState('pricetag');
  
  // Liste d'icônes disponibles
  const availableIcons = [
    'pricetag', 'flag', 'bookmark', 'star', 'heart', 'alert',
    'information-circle', 'help-circle', 'checkmark-circle'
  ];
  
  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible, refetch]);
  
  const handleCreateTag = async () => {
    if (!name.trim()) {
      Alert.alert(
        translations.errors?.validation?.title || "Erreur",
        translations.tags?.errors?.nameRequired || "Le nom du tag est obligatoire"
      );
      return;
    }
    
    try {
      await createTag.mutateAsync({
        name: name.trim(),
        color,
        icon
      });
      
      setName('');
      setColor('#ff7a5c');
      setIcon('pricetag');
      setShowAddModal(false);
      
      Alert.alert(
        translations.tags?.alerts?.createSuccess || "Succès",
        translations.tags?.alerts?.tagCreated || "Tag créé avec succès"
      );
    } catch (error) {
      console.error('Erreur lors de la création du tag:', error);
      Alert.alert(
        translations.errors?.validation?.title || "Erreur",
        translations.tags?.errors?.createFailed || "Impossible de créer le tag"
      );
    }
  };
  
  const handleDeleteTag = async (tag: Tag) => {
    Alert.alert(
      translations.tags?.alerts?.confirmDelete || "Confirmer la suppression",
      translations.tags?.alerts?.deleteMessage || "Êtes-vous sûr de vouloir supprimer ce tag ?",
      [
        {
          text: translations.common?.cancel || "Annuler",
          style: 'cancel'
        },
        {
          text: translations.common?.delete || "Supprimer",
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTag.mutateAsync(tag.id);
              Alert.alert(
                translations.tags?.alerts?.deleteSuccess || "Succès",
                translations.tags?.alerts?.tagDeleted || "Tag supprimé avec succès"
              );
            } catch (error) {
              console.error('Erreur lors de la suppression du tag:', error);
              Alert.alert(
                translations.errors?.validation?.title || "Erreur",
                translations.tags?.errors?.deleteFailed || "Impossible de supprimer le tag"
              );
            }
          }
        }
      ]
    );
  };
  
  const renderTag = ({ item }: { item: Tag }) => (
    <View style={styles.tagItem}>
      <View style={[styles.tagColorDot, { backgroundColor: item.color }]} />
      <View style={styles.tagInfo}>
        <Text style={styles.tagName}>{item.name}</Text>
        {item.icon && (
          <Ionicons name={`${item.icon}-outline`} size={16} color="#666" />
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTag(item)}
      >
        <Ionicons name="trash-outline" size={18} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{translations.tags?.manageTags || "Gérer les tags"}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff7a5c" />
              <Text style={styles.loadingText}>{translations.common?.loading || "Chargement..."}</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={tags}
                renderItem={renderTag}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {translations.tags?.noTags || "Aucun tag trouvé"}
                  </Text>
                }
                contentContainerStyle={styles.tagsList}
              />
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>{translations.tags?.createTag || "Créer un tag"}</Text>
              </TouchableOpacity>
            </>
          )}
          
          {/* Modal pour créer un nouveau tag */}
          <Modal
            visible={showAddModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowAddModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{translations.tags?.createTag || "Créer un tag"}</Text>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{translations.tags?.name || "Nom"}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={translations.tags?.namePlaceholder || "Entrer le nom du tag"}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{translations.tags?.color || "Couleur"}</Text>
                  <ColorPicker
                    selectedColor={color}
                    onSelectColor={setColor}
                    colors={['#ff7a5c', '#ffb443', '#4d8efc', '#43d2c3', '#9c88ff', '#8c7ae6', '#e84393']}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{translations.tags?.icon || "Icône"}</Text>
                  <View style={styles.iconsContainer}>
                    {availableIcons.map((iconName) => (
                      <TouchableOpacity
                        key={iconName}
                        style={[
                          styles.iconButton,
                          icon === iconName && { backgroundColor: color }
                        ]}
                        onPress={() => setIcon(iconName)}
                      >
                        <Ionicons
                          name={`${iconName}-outline`}
                          size={20}
                          color={icon === iconName ? '#fff' : '#000'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleCreateTag}
                  disabled={createTag.isPending}
                >
                  {createTag.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {translations.common?.save || "Enregistrer"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  tagsList: {
    flexGrow: 1,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 5,
  },
  tagColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  tagInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagName: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: '#ff7a5c',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 40,
    marginTop: 40,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 15,
    color: '#333',
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 15,
    marginTop: 20,
    marginBottom: 50,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    margin: 5,
  },
  saveButton: {
    backgroundColor: '#ff7a5c',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 4,
  },
});
