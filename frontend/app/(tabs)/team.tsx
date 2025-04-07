import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTeamMembers, useInviteUser, useRemoveTeamMember, useTeamInvitations, useResendInvitation, useCancelInvitation } from '@/services/queries/team';
import { useProjects } from '@/services/queries/projects';
import { TeamMember, TeamInvitation } from '@/types/team';
import { useAuthStore } from '@/stores/auth'; // Ajout de l'import manquant
import api from '@/services/api';

export default function TeamScreen() {
  const router = useRouter();
  const { translations } = useLanguage();
  const { data: members, isLoading: isLoadingMembers, refetch } = useTeamMembers();
  const { data: projects } = useProjects();
  const { user } = useAuthStore(); // Importer le user pour vérifier l'identité
  const inviteUser = useInviteUser();
  const removeTeamMember = useRemoveTeamMember();

  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Ajouter état pour les onglets (membres/invitations)
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  
  // Récupérer les invitations
  const { 
      data: invitations, 
      isLoading: isLoadingInvitations, 
      refetch: refetchInvitations 
  } = useTeamInvitations();
  
  const resendInvitation = useResendInvitation();
  const cancelInvitation = useCancelInvitation();

  // Ajouter cet effet pour plus de débogage
  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        console.log("Fetching debug info...");
        // Appel à l'API pour récupérer des infos de débogage
        const invitationsDebug = await api.get('/team/invitations/debug');
        console.log("Invitations debug info:", invitationsDebug.data);
      } catch (error) {
        console.error("Error fetching debug info:", error);
      }
    };
    
    if (user?.id) {
      fetchDebugInfo();
    }
  }, [user?.id]);

  // Filtrer les membres pour exclure l'utilisateur connecté
  const filteredMembers = members?.filter((member) => 
    // Exclure l'utilisateur connecté de la liste
    (member.id !== user?.id) && 
    // Appliquer également le filtre de recherche
    (member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.email.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    try {
      await inviteUser.mutateAsync({
        email,
        name: name || email.split('@')[0],
        role,
        sendNotification: true
      });
      
      setShowInviteModal(false);
      setEmail('');
      setName('');
      setRole('member');
      refetch(); // Actualiser la liste des membres
      Alert.alert('Succès', translations.team.invitationSent);
    } catch (error) {
      console.error('Erreur lors de l\'invitation:', error);
      Alert.alert('Erreur', translations.team.errorInviting);
    }
  };

  const handleMemberPress = (member: TeamMember) => {
    setSelectedMember(member);
    setShowMemberDetails(true);
  };

  const handleRemoveMember = async (memberId: number) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir retirer ce membre de l\'équipe ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTeamMember.mutateAsync(memberId);
              setShowMemberDetails(false);
              refetch();
              Alert.alert('Succès', 'Membre retiré avec succès');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de retirer le membre. Veuillez réessayer.');
            }
          },
        },
      ]
    );
  };

  const handleResendInvite = async (invitationId: number) => {
    try {
        await resendInvitation.mutateAsync(invitationId);
        refetchInvitations();
        Alert.alert('Succès', translations.team.invitationResent);
    } catch (error) {
        console.error('Erreur lors du renvoi de l\'invitation:', error);
        Alert.alert('Erreur', translations.team.errorResending);
    }
  };

  const handleCancelInvite = async (invitationId: number) => {
    Alert.alert(
        translations.team.confirmCancel,
        translations.team.confirmCancelMessage,
        [
            {
                text: translations.common.cancel,
                style: 'cancel',
            },
            {
                text: translations.common.confirm,
                style: 'destructive',
                onPress: async () => {
                    try {
                        await cancelInvitation.mutateAsync(invitationId);
                        refetchInvitations();
                        Alert.alert('Succès', translations.team.invitationCanceled);
                    } catch (error) {
                        console.error('Erreur lors de l\'annulation de l\'invitation:', error);
                        Alert.alert('Erreur', translations.team.errorCanceling);
                    }
                },
            },
        ]
    );
  };

  // Fonction pour obtenir la couleur du statut d'invitation
  const getInvitationStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return '#FFC107';
        case 'accepted':
            return '#4CAF50';
        case 'declined':
            return '#F44336';
        case 'expired':
            return '#9E9E9E';
        default:
            return '#9E9E9E';
    }
  };

  // Fonction pour obtenir le libellé du statut d'invitation
  const getInvitationStatusLabel = (status: string) => {
    const defaultLabels: Record<string, string> = {
      pending: 'En attente',
      accepted: 'Acceptée',
      declined: 'Refusée',
      expired: 'Expirée'
    };

    try {
      switch (status) {
        case 'pending':
          return translations?.team?.status?.pending || defaultLabels.pending;
        case 'accepted':
          return translations?.team?.status?.accepted || defaultLabels.accepted;
        case 'declined':
          return translations?.team?.status?.declined || defaultLabels.declined;
        case 'expired':
          return translations?.team?.status?.expired || defaultLabels.expired;
        default:
          return status;
      }
    } catch (error) {
      console.warn('Translation not available for status:', status);
      return defaultLabels[status] || status;
    }
  };

  const renderMemberItem = ({ item }: { item: TeamMember }) => {
    // Calculer le nombre de projets pour ce membre
    const memberProjectCount = item.projectCount || projects?.filter(
      project => project.members?.some(member => member.id === item.id)
    ).length || 0;

    // Obtenir l'état de mutation directement depuis les hooks
    const isInviting = inviteUser.status === 'pending';
    const isRemoving = removeTeamMember.status === 'pending';
    const isResending = resendInvitation.status === 'pending';
    const isCanceling = cancelInvitation.status === 'pending';
    
    // Combiner les états
    const isMutating = isInviting || isRemoving || isResending || isCanceling;
    
    return (
      <TouchableOpacity
        style={[styles.memberCard, shadowStyles.card]}
        onPress={() => handleMemberPress(item)}
        disabled={isMutating}
      >
        <View style={styles.memberAvatarContainer}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.memberAvatar} />
          ) : (
            <View style={[styles.memberAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitials}>
                {item.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[
            styles.statusIndicator, 
            item.status === 'active' ? styles.statusActive : 
            item.status === 'pending' ? styles.statusPending : styles.statusInactive
          ]} />
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>
            {item.fullName}
            {item.status === 'pending' && " (En attente)"}
          </Text>
          <Text style={styles.memberEmail}>{item.email}</Text>
          <Text style={styles.memberRole}>{item.role || 'Membre'}</Text>
        </View>
        {memberProjectCount > 0 && (
          <View style={styles.memberStats}>
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>{memberProjectCount}</Text>
              <Text style={styles.statLabel}>Projets</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderRoleOption = (optionRole: string, label: string) => (
    <TouchableOpacity
      style={[styles.roleOption, role === optionRole && styles.roleOptionSelected]}
      onPress={() => setRole(optionRole)}
    >
      <Text style={[styles.roleOptionText, role === optionRole && styles.roleOptionTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Remplaçons la fonction renderInvitationItem par un composant distinct
  const InvitationItem = React.memo(({ item }: { item: TeamInvitation }) => {
    // États locaux pour ce composant spécifique
    const [isResending, setIsResending] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    
    const isActive = item.status === 'pending';
    
    // Wrappers pour les fonctions de gestion
    const handleResend = async () => {
      if (isResending) return; // Éviter les doubles clics
      try {
        setIsResending(true);
        await handleResendInvite(item.id);
      } finally {
        setIsResending(false);
      }
    };
    
    // Fonction pour gérer l'annulation d'invitation
    const handleCancel = () => {
      if (isCanceling) return; // Éviter les doubles clics
      
      setIsCanceling(true);
      // Cette fonction utilise Alert.confirm avec des callbacks
      handleCancelInvite(item.id);
      
      // On réinitialise après un délai pour permettre à l'alerte de s'afficher
      setTimeout(() => {
        setIsCanceling(false);
      }, 500);
    };

    return (
      <View style={[styles.invitationCard, shadowStyles.card]}>
        <View style={styles.invitationHeader}>
          <View style={styles.invitationInfo}>
            <Text style={styles.invitationName}>{item.name || item.email}</Text>
            <Text style={styles.invitationEmail}>{item.email}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getInvitationStatusColor(item.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getInvitationStatusColor(item.status) }
            ]}>
              {getInvitationStatusLabel(item.status)}
            </Text>
          </View>
        </View>
  
        <View style={styles.invitationDetails}>
          <Text style={styles.invitationRole}>
            {item.role && translations.team.roles && 
             translations.team.roles[item.role as keyof typeof translations.team.roles] || item.role}
          </Text>
          <Text style={styles.invitationDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
  
        {isActive && (
          <View style={styles.invitationActions}>
            <TouchableOpacity 
              style={[styles.resendButton, isResending && styles.disabledButton]}
              onPress={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="mail" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {translations.team.resendInvite}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cancelButton, isCanceling && styles.disabledButton]}
              onPress={handleCancel}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {translations.team.cancelInvite}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  });

  // Ajouter un effet pour du débogage détaillé
  useEffect(() => {
    if (members) {
      console.log('Team members from API:', members);
      console.log('Current user:', user);
      console.log('Filtered members for display:', filteredMembers);
      
      // Vérifier s'il y a des membres qui ne sont pas l'utilisateur courant
      const otherMembers = members.filter(m => m.id !== user?.id);
      console.log('Members excluding current user:', otherMembers);
    }
  }, [members, user, filteredMembers]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{translations.team.title}</Text>
        <TouchableOpacity 
          style={[styles.inviteButton, shadowStyles.button]}
          onPress={() => setShowInviteModal(true)}
          disabled={inviteUser.status === 'pending'}
        >
          <Ionicons name="person-add" size={18} color="#fff" />
          <Text style={styles.inviteButtonText}>
            {inviteUser.status === 'pending' ? translations.common.loading : translations.team.invite}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Onglets pour basculer entre les membres et les invitations */}
      <View style={styles.tabsContainer}>
          <TouchableOpacity 
              style={[styles.tab, activeTab === 'members' && styles.activeTab]}
              onPress={() => setActiveTab('members')}
          >
              <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
                  {translations.team.members}
              </Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={[styles.tab, activeTab === 'invitations' && styles.activeTab]}
              onPress={() => setActiveTab('invitations')}
          >
              <Text style={[styles.tabText, activeTab === 'invitations' && styles.activeTabText]}>
                  {translations.team.invitations}
              </Text>
          </TouchableOpacity>
      </View>

      {activeTab === 'members' ? (
        <>
          <View style={[styles.searchContainer, shadowStyles.card]}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder={translations.team.searchPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          {isLoadingMembers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff7a5c" />
              <Text style={styles.loadingText}>{translations.common.loading}</Text>
            </View>
          ) : filteredMembers.length > 0 ? (
            <FlatList
              data={filteredMembers}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.membersList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `Aucun membre trouvé pour "${searchQuery}"`
                  : translations.team.noMembers}
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setShowInviteModal(true)}
              >
                <Text style={styles.emptyButtonText}>{translations.team.invite}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        // Affichage des invitations
        <>
          {isLoadingInvitations ? (
              <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#ff7a5c" />
                  <Text style={styles.loadingText}>{translations.common.loading}</Text>
              </View>
          ) : invitations && invitations.length > 0 ? (
              <FlatList
                  data={invitations}
                  renderItem={({ item }) => (
                    <InvitationItem 
                      item={item}
                    />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.invitationsList}
                  showsVerticalScrollIndicator={false}
              />
          ) : (
              <View style={styles.emptyContainer}>
                  <Ionicons name="mail" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>
                      {translations.team.noInvitations}
                  </Text>
                  <TouchableOpacity 
                      style={styles.emptyButton}
                      onPress={() => setShowInviteModal(true)}
                  >
                      <Text style={styles.emptyButtonText}>{translations.team.invite}</Text>
                  </TouchableOpacity>
              </View>
          )}
        </>
      )}

      {/* Modal d'invitation */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Inviter un membre</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email*</Text>
              <TextInput
                style={styles.input}
                placeholder="email@exemple.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nom (optionnel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Rôle</Text>
              <View style={styles.roleOptions}>
                {renderRoleOption('admin', 'Administrateur')}
                {renderRoleOption('member', 'Membre')}
                {renderRoleOption('viewer', 'Observateur')}
              </View>
            </View>
            <TouchableOpacity 
              style={[
                styles.inviteModalButton,
                inviteUser.status === 'pending' && styles.disabledButton
              ]}
              onPress={handleInvite}
              disabled={inviteUser.status === 'pending'}
            >
              {inviteUser.status === 'pending' ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.inviteModalButtonText}>Envoyer l'invitation</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de détails du membre */}
      <Modal
        visible={showMemberDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMemberDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMember && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Détails du membre</Text>
                  <TouchableOpacity onPress={() => setShowMemberDetails(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.memberDetailHeader}>
                  {selectedMember.photoURL ? (
                    <Image source={{ uri: selectedMember.photoURL }} style={styles.detailAvatar} />
                  ) : (
                    <View style={[styles.detailAvatar, styles.avatarPlaceholder]}>
                      <Text style={styles.detailAvatarInitials}>
                        {selectedMember.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.memberDetailInfo}>
                    <Text style={styles.memberDetailName}>{selectedMember.fullName}</Text>
                    <Text style={styles.memberDetailRole}>{selectedMember.role || 'Membre'}</Text>
                    <View style={[
                      styles.statusBadge, 
                      selectedMember.status === 'active' ? styles.statusBadgeActive : 
                      selectedMember.status === 'pending' ? styles.statusBadgePending : styles.statusBadgeInactive
                    ]}>
                      <Text style={styles.statusBadgeText}>
                        {selectedMember.status === 'active' ? 'Actif' : 
                         selectedMember.status === 'pending' ? 'En attente' : 'Inactif'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.memberDetailSection}>
                  <Text style={styles.sectionTitle}>Coordonnées</Text>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={20} color="#666" />
                    <Text style={styles.contactText}>{selectedMember.email}</Text>
                  </View>
                </View>

                {selectedMember.status === 'active' && (
                  <View style={styles.memberDetailSection}>
                    <Text style={styles.sectionTitle}>Projets</Text>
                    {projects?.filter(project => 
                      project.members?.some(member => member.id === selectedMember.id)
                    ).length > 0 ? (
                      projects?.filter(project => 
                        project.members?.some(member => member.id === selectedMember.id)
                      ).slice(0, 3).map(project => (
                        <View key={project.id} style={styles.projectItem}>
                          <View style={[styles.projectStatusDot, { backgroundColor: getStatusColor(project.status) }]} />
                          <Text style={styles.projectName}>{project.name}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noProjectsText}>Aucun projet associé</Text>
                    )}
                  </View>
                )}

                <View style={styles.actionsContainer}>
                  {selectedMember.status === 'pending' && (
                    <TouchableOpacity style={styles.resendInviteButton}>
                      <Ionicons name="mail" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Renvoyer l'invitation</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveMember(selectedMember.id)}
                  >
                    <Ionicons name="trash" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      {selectedMember.status === 'pending' 
                        ? 'Annuler l\'invitation' 
                        : 'Retirer de l\'équipe'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Fonction utilitaire pour obtenir la couleur du statut
function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'terminé':
    case 'done':
      return '#43d2c3';
    case 'in_progress':
    case 'en progression':
    case 'in progress':
      return '#ffb443';
    case 'ongoing':
    case 'en cours':
      return '#4d8efc';
    case 'canceled':
    case 'annulé':
      return '#ff7a5c';
    default:
      return '#888';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  inviteButton: {
    flexDirection: 'row',
    backgroundColor: '#ff7a5c',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  inviteButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 10,
    margin: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
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
  membersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  memberAvatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  statusIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    bottom: 0,
    right: 0,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusPending: {
    backgroundColor: '#FFC107',
  },
  statusInactive: {
    backgroundColor: '#F44336',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  memberRole: {
    fontSize: 14,
    color: '#888',
  },
  memberStats: {
    alignItems: 'center',
  },
  statBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 5,
    minWidth: 40,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyButton: {
    backgroundColor: '#ff7a5c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: '#ff7a5c',
    borderColor: '#ff7a5c',
  },
  roleOptionText: {
    color: '#666',
    fontWeight: '500',
  },
  roleOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  inviteModalButton: {
    backgroundColor: '#ff7a5c',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  inviteModalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  memberDetailHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  detailAvatarInitials: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#666',
  },
  memberDetailInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberDetailName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  memberDetailRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  statusBadgeInactive: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  memberDetailSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#666',
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  projectStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  projectName: {
    fontSize: 15,
    color: '#333',
  },
  noProjectsText: {
    color: '#888',
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 25,
    gap: 10,
  },
  resendInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  activeTab: {
    borderBottomColor: '#ff7a5c',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ff7a5c',
    fontWeight: '600',
  },
  invitationCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  invitationInfo: {
    flex: 1,
  },
  invitationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  invitationEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  invitationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  invitationRole: {
    fontSize: 14,
    color: '#666',
  },
  invitationDate: {
    fontSize: 14,
    color: '#888',
  },
  invitationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 5,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  invitationsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
