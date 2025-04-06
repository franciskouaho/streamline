"use client"

import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { useProjects, useProjectStats } from "@/services/queries/projects"
import { useTasks, calculateTaskStats } from "@/services/queries/tasks"
import { LoadingIndicator } from "./ui/LoadingIndicator"
import { calculateProjectStats } from "@/utils/projectUtils"
import { Ionicons } from "@expo/vector-icons"
import { shadowStyles } from "@/constants/CommonStyles"
import { STATUS_COLORS } from "@/constants/StatusColors"
import { useLanguage } from "@/contexts/LanguageContext"

const screenWidth = Dimensions.get("window").width - 40

const DashboardCharts = () => {
  const { data: projects, isLoading: isLoadingProjects } = useProjects()
  const { data: projectStats, isLoading: isLoadingStats } = useProjectStats()
  const { data: tasks, isLoading: isLoadingTasks } = useTasks() // Récupération des tâches
  const { translations } = useLanguage() // Ajout de l'accès aux traductions
  
  const [taskStats, setTaskStats] = useState({ todo: 0, inProgress: 0, done: 0, total: 0 }) // État pour les statistiques de tâches

  // Calcul des statistiques de tâches quand les données sont disponibles
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setTaskStats(calculateTaskStats(tasks))
    }
  }, [tasks])

  if (isLoadingProjects || isLoadingStats) {
    return <LoadingIndicator />
  }

  // Si aucune donnée de statistiques directe, calculer à partir des projets
  const stats = projectStats || (projects ? calculateProjectStats(projects) : null)

  return (
    <View style={styles.chartsContainer}>
      {/* Cartes de statistiques */}
      <View style={styles.statsContainer}>
        {/* Statistiques de projets et tâches */}
        <Text style={styles.sectionTitle}>{translations.dashboardCharts.overview}</Text>
        
        <View style={styles.statsGrid}>
          {/* Statistiques des projets */}
          <View style={[styles.statCard, { backgroundColor: "#f9f9f9", borderLeftColor: STATUS_COLORS.ONGOING }]}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats?.ongoing || 0}</Text>
              <Text style={styles.statLabel}>{translations.dashboardCharts.ongoingProjects}</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: STATUS_COLORS.ONGOING }]}>
              <Ionicons name="sync" size={18} color="#fff" />
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#f9f9f9", borderLeftColor: STATUS_COLORS.IN_PROGRESS }]}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats?.inProgress || 0}</Text>
              <Text style={styles.statLabel}>{translations.dashboardCharts.inProgress}</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: STATUS_COLORS.IN_PROGRESS }]}>
              <Ionicons name="time" size={18} color="#fff" />
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#f9f9f9", borderLeftColor: STATUS_COLORS.COMPLETED }]}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats?.completed || 0}</Text>
              <Text style={styles.statLabel}>{translations.dashboardCharts.completedProjects}</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: STATUS_COLORS.COMPLETED }]}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#f9f9f9", borderLeftColor: STATUS_COLORS.TODO }]}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{taskStats?.todo || 0}</Text>
              <Text style={styles.statLabel}>{translations.dashboardCharts.todoTasks}</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: STATUS_COLORS.TODO }]}>
              <Ionicons name="list" size={18} color="#fff" />
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#f9f9f9", borderLeftColor: STATUS_COLORS.COMPLETED }]}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{taskStats?.done || 0}</Text>
              <Text style={styles.statLabel}>{translations.dashboardCharts.completedTasks}</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: STATUS_COLORS.COMPLETED }]}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#f9f9f9", borderLeftColor: STATUS_COLORS.DEFAULT }]}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{taskStats?.total || 0}</Text>
              <Text style={styles.statLabel}>{translations.dashboardCharts.totalTasks}</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: STATUS_COLORS.DEFAULT }]}>
              <Ionicons name="apps" size={18} color="#fff" />
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  chartsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "48%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    ...shadowStyles.card,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    marginLeft: 5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
})

export default DashboardCharts
