import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import type { ProjectData } from "@/types/project";

interface ProjectCardProps {
  project: ProjectData;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  const calculateProgress = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/project/${project.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{project.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{project.status}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {project.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.teamContainer}>
          {/* Afficher les membres du projet */}
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressCircle, { borderColor: '#ff7a5c' }]}>
            <Text style={styles.progressText}>{calculateProgress()}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#ff7a5c',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff7a5c',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamContainer: {
    flexDirection: 'row',
  },
  moreButton: {
    padding: 5,
  },
  progressLabel: {
    fontSize: 10,
    color: '#666',
  },
});
