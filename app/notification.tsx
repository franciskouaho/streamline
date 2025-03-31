import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';

interface Notification {
    id: number;
    type: string;
    message: string;
    time: string;
    isRead: boolean;
    category?: string;
}

export default function Notification() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>('all');

    const notifications: Notification[] = [
        {
            id: 1,
            type: 'email',
            message: 'An email was sent to everyone on this board',
            time: '1 hr ago',
            isRead: false,
        },
        {
            id: 2,
            type: 'event',
            message: 'Event date has arrived! An email was sent to @LaraCroft',
            time: '1 hr ago',
            isRead: false,
        },
        {
            id: 3,
            type: 'document',
            message: 'A new document was signed and added to your board',
            time: '1 hr ago',
            isRead: false,
        },
        {
            id: 4,
            type: 'assignment',
            message: 'Event date has arrived! Clark Kent assigned WRC-40 to you',
            time: '1 hr ago',
            isRead: true,
        },
        {
            id: 5,
            type: 'email',
            message: 'An email was sent to everyone on this board',
            time: '1 hr ago',
            isRead: true,
            category: 'yesterday',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notification</Text>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
                    onPress={() => setActiveTab('unread')}
                >
                    <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>Unread</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'mentioned' && styles.activeTab]}
                    onPress={() => setActiveTab('mentioned')}
                >
                    <Text style={[styles.tabText, activeTab === 'mentioned' && styles.activeTabText]}>I was mentioned</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationsContainer}>
                <Text style={styles.sectionTitle}>Today</Text>

                {notifications
                    .filter(n => !n.category)
                    .map((notification) => (
                        <View
                            key={notification.id}
                            style={[
                                styles.notificationItem,
                                notification.isRead && styles.notificationRead
                            ]}
                        >
                            <View style={styles.iconContainer}>
                                {notification.type === 'email' && (
                                    <View style={[styles.iconBg, { backgroundColor: '#DB4437' }]}>
                                        <Text style={styles.iconText}>M</Text>
                                    </View>
                                )}
                                {notification.type === 'event' && (
                                    <Image source={require('../assets/images/profile.jpeg')} style={styles.notificationAvatar} />
                                )}
                                {notification.type === 'document' && (
                                    <Image source={require('../assets//images/team1.jpeg')} style={styles.notificationAvatar} />
                                )}
                                {notification.type === 'assignment' && (
                                    <Image source={require('../assets//images/team1.jpeg')} style={styles.notificationAvatar} />
                                )}
                            </View>

                            <View style={styles.notificationContent}>
                                <View style={styles.notificationHeader}>
                                    <Text style={styles.notificationType}>Automation</Text>
                                    <Text style={styles.notificationTime}>{notification.time}</Text>
                                </View>
                                <Text style={styles.notificationMessage}>{notification.message}</Text>
                            </View>

                            {!notification.isRead && (
                                <TouchableOpacity style={styles.deleteButton}>
                                    <Ionicons name="trash-outline" size={20} color="#000" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                <Text style={styles.sectionTitle}>Yesterday</Text>

                {notifications
                    .filter(n => n.category === 'yesterday')
                    .map((notification) => (
                        <View
                            key={notification.id}
                            style={[
                                styles.notificationItem,
                                notification.isRead && styles.notificationRead
                            ]}
                        >
                            <View style={styles.iconContainer}>
                                {notification.type === 'email' && (
                                    <View style={[styles.iconBg, { backgroundColor: '#DB4437' }]}>
                                        <Text style={styles.iconText}>M</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.notificationContent}>
                                <View style={styles.notificationHeader}>
                                    <Text style={styles.notificationType}>Automation</Text>
                                    <Text style={styles.notificationTime}>{notification.time}</Text>
                                </View>
                                <Text style={styles.notificationMessage}>{notification.message}</Text>
                            </View>
                        </View>
                    ))}
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
    notificationAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
});