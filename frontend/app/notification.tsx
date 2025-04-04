import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/services/notifications';
import { INotification } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Notification() {
    const router = useRouter();
    const { translations } = useLanguage();
    const [activeTab, setActiveTab] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<INotification[]>([]);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await fetchNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to load notifications:", error);
            Alert.alert(
                "Erreur",
                "Impossible de charger les notifications. Veuillez réessayer plus tard."
            );
            // Initialiser avec un tableau vide pour éviter les erreurs
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(notifications.map(n => 
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            Alert.alert(
                "Erreur",
                "Impossible de marquer toutes les notifications comme lues."
            );
        }
    };

    const handleDelete = async (notificationId: number) => {
        try {
            await deleteNotification(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error("Failed to delete notification:", error);
            Alert.alert(
                "Erreur",
                "Impossible de supprimer la notification."
            );
        }
    };

    const formatNotificationTime = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !n.read;
        return false;
    });

    // Grouper les notifications par jour (aujourd'hui, hier, cette semaine, plus ancien)
    const groupNotifications = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const groups: { [key: string]: INotification[] } = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: []
        };
        
        filteredNotifications.forEach(notification => {
            const notifDate = new Date(notification.createdAt);
            notifDate.setHours(0, 0, 0, 0);
            
            if (notifDate.getTime() === today.getTime()) {
                groups.today.push(notification);
            } else if (notifDate.getTime() === yesterday.getTime()) {
                groups.yesterday.push(notification);
            } else if (notifDate >= oneWeekAgo) {
                groups.thisWeek.push(notification);
            } else {
                groups.older.push(notification);
            }
        });
        
        return groups;
    };
    
    const notificationGroups = groupNotifications();

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{translations.notifications.title}</Text>
                    <View style={{ width: 80 }} />
                </View>
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#ff7a5c" />
                </View>
            </SafeAreaView>
        );
    }

    const renderNotificationIcon = (type: string) => {
        switch (type) {
            case 'task_assigned':
                return (
                    <View style={[styles.iconBg, { backgroundColor: '#4CAF50' }]}>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    </View>
                );
            case 'task_comment':
                return (
                    <View style={[styles.iconBg, { backgroundColor: '#2196F3' }]}>
                        <Ionicons name="chatbubble" size={20} color="#fff" />
                    </View>
                );
            case 'task_deadline':
                return (
                    <View style={[styles.iconBg, { backgroundColor: '#FFC107' }]}>
                        <Ionicons name="time" size={20} color="#fff" />
                    </View>
                );
            case 'project_update':
                return (
                    <View style={[styles.iconBg, { backgroundColor: '#9C27B0' }]}>
                        <Ionicons name="folder-open" size={20} color="#fff" />
                    </View>
                );
            default:
                return (
                    <View style={[styles.iconBg, { backgroundColor: '#795548' }]}>
                        <Ionicons name="notifications" size={20} color="#fff" />
                    </View>
                );
        }
    };

    const renderNotificationItem = (notification: INotification) => {
        const data = notification.data as any;
        return (
            <TouchableOpacity
                key={notification.id}
                style={[styles.notificationItem, notification.read && styles.notificationRead]}
                onPress={() => !notification.read && handleMarkAsRead(notification.id)}
            >
                <View style={styles.iconContainer}>
                    {renderNotificationIcon(notification.type)}
                </View>

                <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                        <Text style={styles.notificationType}>{notification.type.replace('_', ' ')}</Text>
                        <Text style={styles.notificationTime}>{formatNotificationTime(notification.createdAt)}</Text>
                    </View>
                    <Text style={styles.notificationMessage}>{data.message || JSON.stringify(data)}</Text>
                </View>

                {!notification.read && (
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDelete(notification.id)}
                    >
                        <Ionicons name="trash-outline" size={20} color="#000" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{translations.notifications.title}</Text>
                <TouchableOpacity onPress={handleMarkAllAsRead}>
                    <Text style={styles.markAllReadText}>{translations.notifications.markAllRead}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
                    onPress={() => setActiveTab('unread')}
                >
                    <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>Non lus</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationsContainer}>
                {filteredNotifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={60} color="#888" />
                        <Text style={styles.emptyStateText}>Aucune notification</Text>
                    </View>
                ) : (
                    <>
                        {notificationGroups.today.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Aujourd'hui</Text>
                                {notificationGroups.today.map(renderNotificationItem)}
                            </>
                        )}

                        {notificationGroups.yesterday.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Hier</Text>
                                {notificationGroups.yesterday.map(renderNotificationItem)}
                            </>
                        )}

                        {notificationGroups.thisWeek.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Cette semaine</Text>
                                {notificationGroups.thisWeek.map(renderNotificationItem)}
                            </>
                        )}

                        {notificationGroups.older.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Plus ancien</Text>
                                {notificationGroups.older.map(renderNotificationItem)}
                            </>
                        )}
                    </>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    markAllReadText: {
        fontSize: 14,
        color: '#ff7a5c',
        fontWeight: '500',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    activeTab: {
        backgroundColor: '#ff7a5c',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '500',
    },
    notificationsContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    notificationRead: {
        opacity: 0.8,
    },
    iconContainer: {
        marginRight: 15,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    notificationType: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    notificationTime: {
        fontSize: 12,
        color: '#888',
    },
    notificationMessage: {
        fontSize: 13,
        color: '#666',
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        marginTop: 10,
        fontSize: 16,
        color: '#888',
    },
});