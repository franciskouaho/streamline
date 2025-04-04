import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTasks } from '@/services/queries/tasks';
import { useProjects } from '@/services/queries/projects';
import { getStatusColor, formatDueDate } from '@/utils/projectUtils';

// Temporairement, définir ici les couleurs pour éviter des problèmes d'import
const TEMP_COLORS = {
  ONGOING: "#4d8efc",
  IN_PROGRESS: "#ffb443",
  COMPLETED: "#43d2c3",
  CANCELED: "#ff7a5c",
  PRIMARY: "#ff7a5c",
  TODO: "#ffb443",
  DONE: "#43d2c3",
  LOW: "#43d2c3",
  MEDIUM: "#ffb443",
  HIGH: "#ff3b30",
  DEFAULT: "#666666"
};

interface Day {
    day: string;
    date: number;
    fullDate: Date;
}

interface CalendarItem {
    id: number;
    title: string;
    type: 'task' | 'project';
    status: string;
    date: string;
    priority?: string;
    description?: string;
    projectId?: number; // ID du projet pour les tâches
}

type ViewMode = 'day' | 'week' | 'month';

export default function Calendar() {
    const router = useRouter();
    const { translations } = useLanguage();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [days, setDays] = useState<Day[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    
    // Récupérer les tâches et les projets
    const { data: allTasks, isLoading: isLoadingTasks } = useTasks();
    const { data: allProjects, isLoading: isLoadingProjects } = useProjects();
    
    // Items filtrés pour la date sélectionnée
    const [filteredItems, setFilteredItems] = useState<CalendarItem[]>([]);
    const isLoading = isLoadingTasks || isLoadingProjects;

    // Filtrer les tâches et projets par date sélectionnée
    useEffect(() => {
        console.log("Filtrage des éléments pour le calendrier...");
        if (!isLoading && (allTasks || allProjects)) {
            // Formater la date sélectionnée pour comparer (YYYY-MM-DD)
            const selectedDateString = selectedDate.toISOString().split('T')[0];
            console.log("Date sélectionnée:", selectedDateString);
            
            const calendarItems: CalendarItem[] = [];
            
            // Ajouter les tâches
            if (allTasks && allTasks.length > 0) {
                console.log("Nombre total de tâches:", allTasks.length);
                
                allTasks.forEach(task => {
                    // Vérifier les différents formats de date possibles
                    let taskDate = null;
                    
                    if (task.dueDate) {
                        taskDate = new Date(task.dueDate).toISOString().split('T')[0];
                    } else if (task.date) {
                        taskDate = new Date(task.date).toISOString().split('T')[0];
                    }
                    
                    console.log(`Tâche ${task.id}: ${task.title}, date: ${taskDate}, date sélectionnée: ${selectedDateString}`);
                    
                    if (taskDate === selectedDateString) {
                        console.log("Correspondance trouvée pour la tâche:", task.title);
                        calendarItems.push({
                            id: task.id,
                            title: task.title,
                            type: 'task',
                            status: task.status || 'todo',
                            date: task.dueDate || task.date || '',
                            priority: task.priority,
                            description: task.description,
                            projectId: task.projectId // Ajout de l'ID du projet
                        });
                    }
                });
            }
            
            // Ajouter les projets
            if (allProjects && allProjects.length > 0) {
                console.log("Nombre total de projets:", allProjects.length);
                
                allProjects.forEach(project => {
                    // Vérifier pour le début du projet
                    let startDate = null;
                    let endDate = null;
                    
                    if (project.startDate) {
                        startDate = new Date(project.startDate).toISOString().split('T')[0];
                    }
                    
                    if (project.endDate) {
                        endDate = new Date(project.endDate).toISOString().split('T')[0];
                    }
                    
                    console.log(`Projet ${project.id}: ${project.name}, début: ${startDate}, fin: ${endDate}`);
                    
                    const isStartDate = startDate === selectedDateString;
                    const isEndDate = endDate === selectedDateString;
                    
                    if (isStartDate || isEndDate) {
                        console.log(`Correspondance trouvée pour le projet ${project.name}: ${isStartDate ? 'date de début' : 'date de fin'}`);
                        
                        calendarItems.push({
                            id: project.id,
                            title: project.name,
                            type: 'project',
                            status: project.status || 'active',
                            date: isStartDate ? project.startDate : project.endDate,
                            description: `${isStartDate ? 'Début' : 'Fin'} du projet: ${project.description?.substring(0, 50) || ''}`
                        });
                    }
                    
                    // Vérifier également si la date sélectionnée est entre la date de début et de fin
                    if (startDate && endDate && selectedDateString >= startDate && selectedDateString <= endDate) {
                        // Si ce n'est pas déjà dans la liste en tant que date de début ou de fin
                        if (!isStartDate && !isEndDate) {
                            console.log(`Le projet ${project.name} est en cours à cette date`);
                            calendarItems.push({
                                id: project.id,
                                title: project.name,
                                type: 'project',
                                status: project.status || 'active',
                                date: project.startDate,
                                description: `Projet en cours: ${project.description?.substring(0, 50) || ''}`
                            });
                        }
                    }
                });
            }
            
            // Trier les éléments par heure
            calendarItems.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA.getTime() - dateB.getTime();
            });
            
            console.log("Nombre d'éléments filtrés pour le calendrier:", calendarItems.length);
            setFilteredItems(calendarItems);
        }
    }, [selectedDate, allTasks, allProjects, isLoading]);

    // Générer les jours de la semaine ou du mois selon le mode
    useEffect(() => {
        if (viewMode === 'day') {
            // Pour la vue journalière, nous n'avons besoin que du jour sélectionné
            const day = {
                day: selectedDate.toLocaleDateString('fr-FR', { weekday: 'short' }),
                date: selectedDate.getDate(),
                fullDate: new Date(selectedDate)
            };
            setDays([day]);
        } else if (viewMode === 'week') {
            generateWeekDays();
        } else if (viewMode === 'month') {
            generateMonthDays();
        }
    }, [viewMode, selectedDate]);

    // Générer les jours de la semaine
    const generateWeekDays = () => {
        const today = new Date(selectedDate);
        const currentDay = today.getDay();
        const mondayOfWeek = new Date(today);
        mondayOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

        const weekDays: Day[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(mondayOfWeek);
            date.setDate(mondayOfWeek.getDate() + i);
            weekDays.push({
                day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                date: date.getDate(),
                fullDate: new Date(date)
            });
        }
        setDays(weekDays);
    };

    // Générer les jours du mois
    const generateMonthDays = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        
        // Déterminer le premier jour du mois
        const firstDayOfMonth = new Date(year, month, 1);
        const dayOfWeek = firstDayOfMonth.getDay();
        
        // Déterminer le dernier jour du mois
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        
        // Générer tous les jours du mois
        const monthDays: Day[] = [];
        
        // Ajouter les jours du mois précédent pour compléter la première semaine
        const previousMonthLastDay = new Date(year, month, 0).getDate();
        const daysFromPreviousMonth = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        for (let i = daysFromPreviousMonth; i > 0; i--) {
            const date = new Date(year, month - 1, previousMonthLastDay - i + 1);
            monthDays.push({
                day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                date: date.getDate(),
                fullDate: date
            });
        }
        
        // Ajouter les jours du mois actuel
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            monthDays.push({
                day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                date: i,
                fullDate: date
            });
        }
        
        // Ajouter les jours du mois suivant pour compléter la dernière semaine
        const nextMonthDays = 42 - monthDays.length; // 6 semaines de 7 jours = 42
        for (let i = 1; i <= nextMonthDays; i++) {
            const date = new Date(year, month + 1, i);
            monthDays.push({
                day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                date: i,
                fullDate: date
            });
        }
        
        setDays(monthDays);
    };

    // Gestionnaire pour changer la date sélectionnée
    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    // Gestionnaire pour changer le mode d'affichage
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
    };

    // Gérer les clics sur les éléments du calendrier
    const handleItemPress = (item: CalendarItem) => {
        if (item.type === 'task') {
            // Vérifier si la tâche a un ID de projet associé
            if (item.projectId) {
                // Si oui, rediriger vers la page du projet
                router.push(`/project/${item.projectId}`);
            } else {
                // Sinon, rediriger vers la page de la tâche
                router.push(`/task/${item.id}`);
            }
        } else {
            // Pour les projets, simplement rediriger vers la page du projet
            router.push(`/project/${item.id}`);
        }
    };

    // Fonction pour afficher le titre du calendrier en fonction du mode
    const getCalendarTitle = () => {
        if (viewMode === 'day') {
            return selectedDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } else if (viewMode === 'week') {
            const startOfWeek = days[0]?.fullDate;
            const endOfWeek = days[days.length - 1]?.fullDate;
            
            if (!startOfWeek || !endOfWeek) return "";
            
            // Si même mois
            if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${startOfWeek.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
            }
            // Si différents mois
            return `${startOfWeek.getDate()} ${startOfWeek.toLocaleDateString('fr-FR', { month: 'long' })} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
        } else {
            return selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        }
    };

    // Fonction pour changer de mois ou de semaine
    const navigatePeriod = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        
        if (viewMode === 'month') {
            // Naviguer au mois précédent ou suivant
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        } else if (viewMode === 'week') {
            // Naviguer à la semaine précédente ou suivante
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else if (viewMode === 'day') {
            // Naviguer au jour précédent ou suivant
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        }
        
        setSelectedDate(newDate);
    };

    // Fonction pour revenir au jour/semaine/mois actuel
    const goToToday = () => {
        setSelectedDate(new Date());
    };

    // Rendu spécifique pour la vue mensuelle
    const renderMonthView = () => {
        const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        
        return (
            <View style={styles.monthContainer}>
                {/* Afficher les jours de la semaine */}
                <View style={styles.weekdayHeader}>
                    {weekDays.map((day, index) => (
                        <Text key={index} style={styles.weekdayText}>{day}</Text>
                    ))}
                </View>
                
                {/* Grille des jours du mois */}
                <View style={styles.monthGrid}>
                    {days.map((item, index) => {
                        const isCurrentMonth = item.fullDate.getMonth() === selectedDate.getMonth();
                        const isToday = new Date().toDateString() === item.fullDate.toDateString();
                        const isSelected = selectedDate.toDateString() === item.fullDate.toDateString();
                        
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.monthDayItem,
                                    isToday && styles.todayItem,
                                    isSelected && styles.selectedMonthDay,
                                    !isCurrentMonth && styles.otherMonthDay
                                ]}
                                onPress={() => handleDateChange(item.fullDate)}
                            >
                                <Text style={[
                                    styles.monthDayText,
                                    isSelected && styles.selectedMonthDayText,
                                    !isCurrentMonth && styles.otherMonthDayText
                                ]}>
                                    {item.date}
                                </Text>
                                
                                {/* Indicateurs d'événements */}
                                <View style={styles.eventIndicators}>
                                    {filteredItems.some(event => 
                                        new Date(event.date).toDateString() === item.fullDate.toDateString() && 
                                        event.type === 'task'
                                    ) && (
                                        <View style={[styles.eventDot, { backgroundColor: TEMP_COLORS.ONGOING }]} />
                                    )}
                                    
                                    {filteredItems.some(event => 
                                        new Date(event.date).toDateString() === item.fullDate.toDateString() && 
                                        event.type === 'project'
                                    ) && (
                                        <View style={[styles.eventDot, { backgroundColor: TEMP_COLORS.CANCELED }]} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.navigationControls}>
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => navigatePeriod('prev')}
                    >
                        <Ionicons name="chevron-back" size={20} color="#666" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.todayButton}
                        onPress={goToToday}
                    >
                        <Text style={styles.todayButtonText}>{translations.calendar.today}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => navigatePeriod('next')}
                    >
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.headerTitle}>
                    {getCalendarTitle()}
                </Text>
            </View>

            <View style={styles.calendarContainer}>
                <View style={styles.viewSelector}>
                    <TouchableOpacity 
                        style={[styles.viewOption, viewMode === 'day' && styles.activeViewOption]}
                        onPress={() => handleViewModeChange('day')}
                    >
                        <Text style={viewMode === 'day' ? styles.activeViewText : styles.viewText}>
                            {translations.calendar.day}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.viewOption, viewMode === 'week' && styles.activeViewOption]}
                        onPress={() => handleViewModeChange('week')}
                    >
                        <Text style={viewMode === 'week' ? styles.activeViewText : styles.viewText}>
                            {translations.calendar.week}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.viewOption, viewMode === 'month' && styles.activeViewOption]}
                        onPress={() => handleViewModeChange('month')}
                    >
                        <Text style={viewMode === 'month' ? styles.activeViewText : styles.viewText}>
                            {translations.calendar.month}
                        </Text>
                    </TouchableOpacity>
                </View>

                {viewMode === 'month' ? (
                    renderMonthView()
                ) : (
                    <View style={styles.calendarStrip}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.daysContainer}
                        >
                            {days.map((item) => (
                                <TouchableOpacity
                                    key={`${item.fullDate.getDate()}-${item.fullDate.getMonth()}`}
                                    style={[
                                        styles.dayItem,
                                        selectedDate.getDate() === item.fullDate.getDate() && 
                                        selectedDate.getMonth() === item.fullDate.getMonth() && 
                                        styles.selectedDay
                                    ]}
                                    onPress={() => handleDateChange(item.fullDate)}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            selectedDate.getDate() === item.fullDate.getDate() &&
                                            selectedDate.getMonth() === item.fullDate.getMonth() &&
                                            styles.selectedDayText
                                        ]}
                                    >
                                        {item.day}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.dateText,
                                            selectedDate.getDate() === item.fullDate.getDate() &&
                                            selectedDate.getMonth() === item.fullDate.getMonth() &&
                                            styles.selectedDateText
                                        ]}
                                    >
                                        {item.date}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff7a5c" />
                        <Text style={styles.loadingText}>Chargement des éléments...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.tasksContainer} showsVerticalScrollIndicator={false}>
                        {filteredItems.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="calendar-outline" size={50} color="#ccc" />
                                <Text style={styles.emptyText}>
                                    {translations.calendar.emptyDate} {selectedDate.toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.dateHeader}>
                                    {selectedDate.toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </Text>
                                {filteredItems.map((item) => (
                                    <View key={`${item.type}-${item.id}`} style={styles.taskItem}>
                                        <View style={styles.timeContainer}>
                                            {item.date && (
                                                <Text style={styles.timeText}>
                                                    {new Date(item.date).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Text>
                                            )}
                                            <View style={[styles.itemTypeBadge, {
                                                backgroundColor: item.type === 'task' ? '#4d8efc' : '#ff7a5c'
                                            }]}>
                                                <Text style={styles.itemTypeText}>
                                                    {item.type === 'task' ? 'T' : 'P'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.taskContent}>
                                            <TouchableOpacity 
                                                style={[styles.task, shadowStyles.card]}
                                                onPress={() => handleItemPress(item)}
                                            >
                                                <View style={styles.taskHeader}>
                                                    <Text style={styles.taskTitle}>{item.title}</Text>
                                                    <Ionicons 
                                                        name={item.type === 'task' ? 'checkmark-circle-outline' : 'folder-outline'} 
                                                        size={18} 
                                                        color={item.type === 'task' ? '#4d8efc' : '#ff7a5c'} 
                                                    />
                                                </View>

                                                {item.description && (
                                                    <Text style={styles.description} numberOfLines={2}>
                                                        {item.description}
                                                    </Text>
                                                )}

                                                <View style={styles.taskFooter}>
                                                    <View style={[
                                                        styles.statusBadge, 
                                                        { backgroundColor: getStatusColor(item.status) }
                                                    ]}>
                                                        <Text style={styles.statusText}>
                                                            {translations.tasks[item.status.toLowerCase()] || item.status}
                                                        </Text>
                                                    </View>
                                                    
                                                    {item.type === 'task' && item.priority && (
                                                        <View style={styles.priorityBadge}>
                                                            <Ionicons 
                                                                name="flag" 
                                                                size={12} 
                                                                color={getPriorityColor(item.priority)} 
                                                            />
                                                            <Text style={styles.priorityText}>
                                                                {translations.tasks[item.priority.toLowerCase()] || item.priority}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

// Fonction pour obtenir la couleur en fonction de la priorité
function getPriorityColor(priority: string): string {
    const colors = {
        low: TEMP_COLORS.LOW,
        medium: TEMP_COLORS.MEDIUM,
        high: TEMP_COLORS.HIGH,
    };
    return colors[priority.toLowerCase()] || TEMP_COLORS.DEFAULT;
}

const styles = StyleSheet.create({
    // Styles pour les modes jour/semaine/mois
    viewText: {
        color: '#666',
    },
    activeViewText: {
        color: TEMP_COLORS.PRIMARY,
        fontWeight: '600',
    },
    
    // Styles spécifiques pour la vue mensuelle
    monthContainer: {
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    weekdayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    weekdayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        width: 32,
        textAlign: 'center',
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    monthDayItem: {
        width: '14%', // 7 jours par semaine
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        borderRadius: 8,
    },
    monthDayText: {
        fontSize: 14,
    },
    selectedMonthDay: {
        backgroundColor: '#ff7a5c',
    },
    selectedMonthDayText: {
        color: '#fff',
        fontWeight: '600',
    },
    todayItem: {
        borderWidth: 1,
        borderColor: '#ff7a5c',
    },
    otherMonthDay: {
        opacity: 0.4,
    },
    otherMonthDayText: {
        color: '#999',
    },
    eventIndicators: {
        flexDirection: 'row',
        marginTop: 2,
    },
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 1,
    },
    
    dateHeader: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        textTransform: 'capitalize',
    },
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    calendarContainer: {
        flex: 1,
    },
    viewSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    viewOption: {
        padding: 10,
    },
    activeViewOption: {
        borderBottomWidth: 2,
        borderBottomColor: '#ff7a5c',
    },
    calendarStrip: {
        marginBottom: 20,
    },
    daysContainer: {
        paddingHorizontal: 15,
    },
    dayItem: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        width: 40,
        height: 70,
        borderRadius: 20,
    },
    selectedDay: {
        backgroundColor: '#ff7a5c',
    },
    dayText: {
        fontSize: 12,
        color: '#888',
        marginBottom: 5,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '500',
    },
    selectedDayText: {
        color: '#fff',
    },
    selectedDateText: {
        color: '#fff',
        fontWeight: '600',
    },
    tasksContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    taskItem: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    timeContainer: {
        width: 50,
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        color: '#888',
        marginBottom: 5,
    },
    itemTypeBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTypeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    taskContent: {
        flex: 1,
        marginLeft: 15,
    },
    task: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '500',
        width: '90%',
    },
    description: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    taskFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 10,
        marginRight: 10,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '500',
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityText: {
        fontSize: 10,
        color: '#666',
        marginLeft: 4,
    },
    navigationControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    navButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    todayButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: TEMP_COLORS.PRIMARY,
        marginHorizontal: 10,
    },
    todayButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});