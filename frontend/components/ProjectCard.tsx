import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadowStyles } from '@/constants/CommonStyles';
import { Project } from '@/types/project';
import { formatDueDate, getStatusColor, getProjectStatusLabel, normalizeProjectStatus } from '@/utils/projectUtils';
import ProjectTagDisplay from '@/components/ui/ProjectTagDisplay';

interface ProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
}

const ProjectCard = ({ project, onPress }: ProjectCardProps) => {
  const [isNewInvitation, setIsNewInvitation] = useState(false);

  // Calculer progression
  const calculateProgress = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    
    const completedTasks = project.tasks.filter(task => 
      task.status.toLowerCase() === 'done' || task.status.toLowerCase() === 'completed'
    ).length;
    
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  // Limiter la description à 20 caractères
  const truncateDescription = (text: string) => {
    if (!text) return '';
    return text.length > 20 ? text.substring(0, 20) + '...' : text;
  };

  // Obtenir la couleur du statut pour les éléments UI
  const normalizedStatus = normalizeProjectStatus(project.status);
  const statusColor = getStatusColor(project.status);

  // Vérifier si le projet est une invitation récente (moins de 24h)
  useEffect(() => {
    if (project.isInvitation) {
      const createdAt = new Date(project.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      setIsNewInvitation(diffDays < 1);
    }
  }, [project]);

  return (
    <TouchableOpacity
      style={[styles.container, shadowStyles.card]}
      onPress={() => onPress(project)}
    >
      <View style={styles.mainInfo}>
        <View style={styles.topRow}>
          <View style={[styles.statusTag, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getProjectStatusLabel(project.status)}</Text>
          </View>
          
          {/* Badge de rôle */}
          <View style={[
            styles.roleTag, 
            { backgroundColor: project.role === 'owner' ? '#4CAF50' : '#2196F3' }
          ]}>
            <Text style={styles.roleText}>
              {project.role === 'owner' ? 'Propriétaire' : 'Membre'}
            </Text>
          </View>
          
          {isNewInvitation && (
            <View style={styles.newInvitationTag}>
              <Text style={styles.newInvitationText}>Nouveau</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.title} numberOfLines={1}>{project.name}</Text>
        
        {project.description && (
          <Text style={styles.description} numberOfLines={1}>
            {truncateDescription(project.description)}
          </Text>
        )}

        {/* Ajout de l'affichage des tags */}
        {project.tags && project.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <ProjectTagDisplay tags={project.tags} maxDisplay={2} size="small" />
          </View>
        )}
      </View>


      <View style={styles.rightInfo}>
        {/* Date avec la bordure de couleur du statut */}
        <View style={[styles.dateContainer, { borderColor: statusColor }]}>
          <Ionicons name="calendar-outline" size={12} color="#666" />
          <Text style={styles.dateText}>
            {project.endDate ? formatDueDate(project.endDate) : 'Non définie'}
          </Text>
        </View>
        
        {/* Cercle de progression avec la couleur du statut */}
        <View style={[styles.progressCircle, { borderColor: statusColor }]}>
          <Text style={[styles.progressText, { color: statusColor }]}>{calculateProgress()}%</Text>
        </View>
        
        {/* Avatar des membres avec la couleur du statut */}
        { project.members && project.members.length > 0 && (
          <View style={[styles.memberAvatar, { backgroundColor: statusColor }]}>
            <Text style={styles.memberCount}>{project.members.length}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#000',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mainInfo: {
    flex: 3,
  },
  rightInfo: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusTag: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 9,
    color: '#666',
    marginLeft: 4,
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#43d2c3',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#43d2c3',
  },
  memberAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4d8efc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  memberCount: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
  newInvitationTag: {
    backgroundColor: '#8E44AD',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
  newInvitationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  roleTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 6,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
});

export default ProjectCard;
