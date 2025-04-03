import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import type { Project } from "@/types/project";
import { calculateProjectProgress, getStatusColor } from "@/utils/projectUtils";
import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  
  const progress = useMemo(() => calculateProjectProgress(project), [
    project, 
    project.tasks?.map(t => t.status).join(',')
  ]);
  
  const taskCount = project.tasks?.length || 0;
  const angle = progress * 3.6;
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/project/${project.id}`)}
    >
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <Text style={styles.title} numberOfLines={1}>{project.name}</Text>
          <Text style={styles.description} numberOfLines={1}>
            {project.description}
          </Text>
          
          <View style={styles.teamContainer}>
            {project.members && project.members.slice(0, 3).map((member, index) => (
              <View key={member.id} style={[styles.memberAvatar, { marginLeft: index > 0 ? -8 : 0 }]}>
                {member.user?.avatar ? (
                  <Text style={styles.memberInitial}>
                    {member.user.fullName.charAt(0)}
                  </Text>
                ) : (
                  <Text style={styles.memberInitial}>
                    {member.user?.fullName?.charAt(0) || "U"}
                  </Text>
                )}
              </View>
            ))}
            
            {project.members && project.members.length > 3 && (
              <View style={[styles.memberAvatar, styles.moreMembers]}>
                <Text style={styles.moreMembersText}>+{project.members.length - 3}</Text>
              </View>
            )}
            
            <View style={styles.taskInfoContainer}>
              <Feather name="check-square" size={10} color="#666" />
              <Text style={styles.taskCount}>{taskCount} tâches</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
              <Text style={styles.statusText}>{project.status}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressCircleOuter}>
              {angle > 0 && (
                <View style={[
                  styles.progressQuarter,
                  styles.progressFirstQuarter,
                  { opacity: angle > 0 ? 1 : 0, transform: [{ rotate: `${Math.min(angle, 90)}deg` }] }
                ]} />
              )}
              
              {angle > 90 && (
                <View style={[
                  styles.progressQuarter,
                  styles.progressSecondQuarter,
                  { opacity: angle > 90 ? 1 : 0, transform: [{ rotate: `${Math.min(angle - 90, 90)}deg` }] }
                ]} />
              )}
              
              {angle > 180 && (
                <View style={[
                  styles.progressQuarter,
                  styles.progressThirdQuarter,
                  { opacity: angle > 180 ? 1 : 0, transform: [{ rotate: `${Math.min(angle - 180, 90)}deg` }] }
                ]} />
              )}
              
              {angle > 270 && (
                <View style={[
                  styles.progressQuarter,
                  styles.progressFourthQuarter,
                  { opacity: angle > 270 ? 1 : 0, transform: [{ rotate: `${Math.min(angle - 270, 90)}deg` }] }
                ]} />
              )}
              
              <View style={styles.progressValueContainer}>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: 12,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 500,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    marginRight: 10,
  },
  rightSection: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    maxWidth: '90%',
  },
  progressContainer: {
    marginTop: 0,
  },
  progressCircleOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  progressQuarter: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    backgroundColor: '#ff7a5c',
  },
  progressFirstQuarter: {
    top: 0,
    right: 0,
    borderTopRightRadius: 18,
    transformOrigin: 'bottom left',
  },
  progressSecondQuarter: {
    top: 0,
    left: 0,
    borderTopLeftRadius: 18,
    transformOrigin: 'bottom right',
  },
  progressThirdQuarter: {
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 18,
    transformOrigin: 'top right',
  },
  progressFourthQuarter: {
    bottom: 0,
    right: 0,
    borderBottomRightRadius: 18,
    transformOrigin: 'top left',
  },
  progressValueContainer: {
    width: 30,
    height: 30, 
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ff7a5c',
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  memberInitial: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  moreMembers: {
    backgroundColor: '#e0e0e0',
  },
  moreMembersText: {
    fontSize: 8,
    color: '#555',
  },
  taskInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  taskCount: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
});
