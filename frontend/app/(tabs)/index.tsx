import React, { useState } from 'react';
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
  const [filter, setFilter] = useState<'all' | 'owned' | 'member'>('all');
  const { data: projects, isLoading } = useProjects(filter);

  const filterOptions = [
    { value: 'all', label: translations.projects.filters.all },
    { value: 'owned', label: translations.projects.filters.owned },
    { value: 'member', label: translations.projects.filters.member }
  ];

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

        <View style={styles.filterContainer}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterButton,
                filter === option.value && styles.filterButtonActive
              ]}
              onPress={() => setFilter(option.value as typeof filter)}
            >
              <Text style={[
                styles.filterText,
                filter === option.value && styles.filterTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{translations.projects.recentProjects}</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/projects')}
          >
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#ff7a5c',
    borderColor: '#ff7a5c',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  viewAllButton: {
    padding: 5, // Ajouter un padding pour une meilleure zone tactile
  },
});
