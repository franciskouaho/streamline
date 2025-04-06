"use client"

import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import { LineChart, BarChart, PieChart } from "react-native-chart-kit"
import { useProjects, useProjectStats, useProjectTimeline } from "@/services/queries/projects"
import { useTasks, calculateTaskStats } from "@/services/queries/tasks"
import { LoadingIndicator } from "./ui/LoadingIndicator"
import { calculateProjectStats, calculateProjectProgress } from "@/utils/projectUtils"
import { Ionicons } from "@expo/vector-icons"
import { shadowStyles } from "@/constants/CommonStyles"
import { STATUS_COLORS, CHART_COLORS } from "@/constants/StatusColors"
import { Project, Task } from "@/types/project"
import { useLanguage } from "@/contexts/LanguageContext"

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
  legend?: string[];
}

const screenWidth = Dimensions.get("window").width - 40

const DashboardCharts = () => {
  const { data: projects, isLoading: isLoadingProjects } = useProjects()
  const { data: projectStats, isLoading: isLoadingStats } = useProjectStats()
  const { data: timelineData, isLoading: isLoadingTimeline } = useProjectTimeline()
  const { data: tasks, isLoading: isLoadingTasks } = useTasks() // Récupération des tâches
  const { translations } = useLanguage() // Ajout de l'accès aux traductions

  const [taskStats, setTaskStats] = useState({ todo: 0, inProgress: 0, done: 0, total: 0 }) // État pour les statistiques de tâches

  const [activeChart, setActiveChart] = React.useState("pie")
  const [monthlyStats, setMonthlyStats] = useState<{
    labels: string[]
    ongoing: number[]
    completed: number[]
  }>({
    labels: [],
    ongoing: [],
    completed: [],
  })

  useEffect(() => {
    if (projects && projects.length > 0) {
      // Analyser les dates pour créer des données mensuelles
      processProjectsForMonthlyStats()
    }
  }, [projects])

  useEffect(() => {
    if (timelineData && timelineData.length > 0) {
      // Si nous avons des données de timeline de l'API, les utiliser directement
      const labels: string[] = []
      const ongoing: number[] = []
      const completed: number[] = []

      // Trier par date
      const sortedData = [...timelineData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Extraire les labels et données pour les graphiques
      sortedData.forEach((item) => {
        // Formater la date pour l'affichage (e.g., "Jan", "Fév", etc.)
        const date = new Date(item.date)
        const month = date.toLocaleDateString("fr-FR", { month: "short" })

        labels.push(month)
        ongoing.push(item.inProcess)
        completed.push(item.completed)
      })

      setMonthlyStats({ labels, ongoing, completed })
    }
  }, [timelineData])

  // Fonction pour traiter les projets et extraire des statistiques mensuelles si timelineData n'est pas disponible
  const processProjectsForMonthlyStats = () => {
    if (!projects || projects.length === 0) return

    // Si nous n'avons pas de données timeline de l'API, générer à partir des projets
    if (!timelineData || timelineData.length === 0) {
      const monthlyData: Record<string, { ongoing: number; completed: number }> = {}

      // Initialiser les derniers 6 mois
      const today = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today)
        d.setMonth(d.getMonth() - i)
        const monthKey = d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
        monthlyData[monthKey] = { ongoing: 0, completed: 0 }
      }

      // Analyser les projets pour chaque mois
      projects.forEach((project) => {
        const createdDate = new Date(project.createdAt)
        const monthKey = createdDate.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })

        // Normaliser le statut pour une meilleure correspondance
        const normalizedStatus = project.status.toLowerCase().trim()

        // Si le mois est dans notre période d'analyse (6 derniers mois)
        if (monthlyData[monthKey]) {
          if (normalizedStatus === "completed") {
            monthlyData[monthKey].completed += 1
          } else if (["ongoing", "in_progress", "in progress", "en cours"].includes(normalizedStatus)) {
            monthlyData[monthKey].ongoing += 1
          }
        }
      })

      // Transformer les données pour le graphique
      const labels = Object.keys(monthlyData).map((key) => key.split(" ")[0]) // Juste le mois
      const ongoing = Object.values(monthlyData).map((v) => v.ongoing)
      const completed = Object.values(monthlyData).map((v) => v.completed)

      setMonthlyStats({ labels, ongoing, completed })
    }
  }

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

  // Déboguer les données des projets pour vérifier les statuts
  console.log(
      "Projets disponibles:",
      projects?.map((p) => ({ id: p.id, status: p.status })),
  )
  console.log("Statistiques calculées:", stats)

  // Si vous utilisez calculateProjectProgress dans ce fichier, assurez-vous d'extraire uniquement la valeur progress
  const projectProgressData = projects?.map(project => {
    const result = calculateProjectProgress(project);
    return {
      id: project.id,
      name: project.name,
      progress: typeof result === 'object' && 'progress' in result ? result.progress : 0,
      status: project.status
    };
  });

  // Données pour le graphique circulaire (Pie) - Utilisation des constantes de couleur
  const pieChartData = [
    {
      name: "Ongoing",
      population: stats?.ongoing || 0,
      color: STATUS_COLORS.ONGOING,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "In Progress",
      population: stats?.inProgress || 0,
      color: STATUS_COLORS.IN_PROGRESS,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Completed",
      population: stats?.completed || 0,
      color: STATUS_COLORS.COMPLETED,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Canceled",
      population: stats?.canceled || 0,
      color: STATUS_COLORS.CANCELED,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ]

  // Données pour le graphique linéaire (Trend) avec les vraies données
  const lineChartData: ChartData = {
    labels: monthlyStats.labels.length > 0 ? monthlyStats.labels : ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
    datasets: [
      {
        data: monthlyStats.completed.length > 0 ? monthlyStats.completed : [0, 0, 0, 0, 0, stats?.completed || 0],
        color: (opacity = 1) => `rgba(67, 210, 195, ${opacity})`, // Completed
        strokeWidth: 2,
      },
      {
        data: monthlyStats.ongoing.length > 0 ? monthlyStats.ongoing : [0, 0, 0, 0, 0, stats?.ongoing || 0],
        color: (opacity = 1) => `rgba(77, 142, 252, ${opacity})`, // Ongoing
        strokeWidth: 2,
      },
    ],
    legend: ["Terminés", "En cours"],
  }

  // Données pour le graphique à barres
  const barChartData = {
    labels: ["Ongoing", "In Progress", "Completed", "Canceled"],
    datasets: [
      {
        data: [stats?.ongoing || 0, stats?.inProgress || 0, stats?.completed || 0, stats?.canceled || 0],
      },
    ],
  }

  // Configuration des graphiques
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#fff",
    },
  }

  const barChartConfig = {
    ...chartConfig,
    color: (opacity = 1, index) => {
      const colors = ["#4d8efc", "#ffb443", "#43d2c3", "#ff7a5c"]
      return `rgba(${colors[index % colors.length]}, ${opacity})`
    },
    barPercentage: 0.7,
    barRadius: 5,
    fillShadowGradient: "#4d8efc",
    fillShadowGradientOpacity: 1,
  }

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

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{translations.dashboardCharts.projectOverview}</Text>

            <View style={styles.chartTypesContainer}>
              <TouchableOpacity
                  style={[styles.chartTypeButton, activeChart === "pie" && styles.activeChartTypeButton]}
                  onPress={() => setActiveChart("pie")}
              >
                <Ionicons name="pie-chart" size={18} color={activeChart === "pie" ? "#fff" : "#666"} />
              </TouchableOpacity>

              <TouchableOpacity
                  style={[styles.chartTypeButton, activeChart === "bar" && styles.activeChartTypeButton]}
                  onPress={() => setActiveChart("bar")}
              >
                <Ionicons name="bar-chart" size={18} color={activeChart === "bar" ? "#fff" : "#666"} />
              </TouchableOpacity>

              <TouchableOpacity
                  style={[styles.chartTypeButton, activeChart === "line" && styles.activeChartTypeButton]}
                  onPress={() => setActiveChart("line")}
              >
                <Ionicons name="trending-up" size={18} color={activeChart === "line" ? "#fff" : "#666"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Affichage du graphique selon le type choisi */}
          {activeChart === "pie" && (
              <View style={styles.chartWrapper}>
                <PieChart
                    data={pieChartData}
                    width={screenWidth}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="30"
                    absolute
                    hasLegend={true}
                    center={[5, 0]}
                    legendOffset={screenWidth / 2 + 100}
                />
              </View>
          )}

          {activeChart === "bar" && (
              <View style={styles.chartWrapper}>
                <BarChart
                    data={barChartData}
                    width={screenWidth - 30}
                    height={200}
                    chartConfig={barChartConfig}
                    style={styles.chart}
                    flatColor={false}
                    showBarTops={false}
                    fromZero
                    withHorizontalLabels
                    withInnerLines={false}
                    showValuesOnTopOfBars
                />
              </View>
          )}

          {activeChart === "line" && (
              <View style={styles.chartWrapper}>
                <LineChart
                    data={lineChartData}
                    width={screenWidth - 30}
                    height={200}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    withDots={true}
                    withShadow={false}
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={false}
                    fromZero
                />
              </View>
          )}
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  chartsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    ...shadowStyles.card,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  chartTypesContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 25,
    padding: 4,
  },
  chartTypeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  activeChartTypeButton: {
    backgroundColor: CHART_COLORS.PRIMARY,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -15,
    marginRight: -15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
  statsSection: {
    marginBottom: 15,
    width: '100%',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    marginLeft: 5,
  },

  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
})

export default DashboardCharts

