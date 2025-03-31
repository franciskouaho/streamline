import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shadowStyles } from '@/constants/CommonStyles';

const ProjectSettings = () => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Project Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={[styles.settingItem, shadowStyles.card]}>
                    <View style={styles.settingContent}>
                        <Ionicons name="color-palette" size={24} color="#000" />
                        <Text style={styles.settingText}>Change Theme Color</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#888" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.settingItem, shadowStyles.card]}>
                    <View style={styles.settingContent}>
                        <Ionicons name="notifications" size={24} color="#000" />
                        <Text style={styles.settingText}>Notifications</Text>
                    </View>
                    <Switch value={true} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.deleteButton, shadowStyles.button]}
                    onPress={() => {
                        // Logique de suppression
                        router.back();
                    }}
                >
                    <Text style={styles.deleteButtonText}>Delete Project</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

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
    content: {
        flex: 1,
        padding: 20,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    settingContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        marginLeft: 15,
    },
    deleteButton: {
        backgroundColor: '#ff4c4c',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProjectSettings;
