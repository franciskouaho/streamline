import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shadowStyles } from '@/constants/CommonStyles';

const ShareProject = () => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Share Project</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <TouchableOpacity style={[styles.shareOption, shadowStyles.card]}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="link" size={24} color="#000" />
                    </View>
                    <Text style={styles.optionText}>Copy Link</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.shareOption, shadowStyles.card]}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail" size={24} color="#000" />
                    </View>
                    <Text style={styles.optionText}>Share via Email</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.shareOption, shadowStyles.card]}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="logo-slack" size={24} color="#000" />
                    </View>
                    <Text style={styles.optionText}>Share on Slack</Text>
                </TouchableOpacity>
            </ScrollView>
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
    shareOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ShareProject;
