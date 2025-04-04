import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProjects } from '@/services/queries/projects';
import ProjectCard from '@/components/ProjectCard';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardCharts from '@/components/DashboardCharts';
import { calculateProjectProgress } from '@/utils/projectUtils';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { TopBar } from '@/components/ui/TopBar';
import { CHART_COLORS } from '@/constants/StatusColors';
import { Project } from '@/types/project';

export default function Home() {
  const router = useRouter();
  const { translations } = useLanguage();
  const { data: projects, isLoading } = useProjects();

  const handleProjectPress = (project: Project) => {
    router.push(`/project/${project.id}`);
  };

  const projectsWithProgress = React.useMemo(() => {
    if (!projects) return [];
    
    return projects.map(project => {
      const progressData = calculateProjectProgress(project);
      return {
        ...project,
        progressPercentage: progressData.progress
      };
    });
  }, [projects]);

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <DashboardCharts />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{translations.projects.recentProjects}</Text>
          <TouchableOpacity onPress={() => router.push('/projects')}>
            <Text style={styles.viewAll}>{translations.common.viewAll}</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <View style={styles.projectsContainer}>
            {projects && projects.length > 0 ? (
              <View>
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onPress={handleProjectPress}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>{translations.projects.noProjects}</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 50,
  },
  header: {
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    color: CHART_COLORS.PRIMARY,
    fontWeight: '500',
  },
  projectsContainer: {
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
