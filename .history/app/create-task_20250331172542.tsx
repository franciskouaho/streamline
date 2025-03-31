import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shadowStyles } from '@/constants/CommonStyles';

export default function CreateTask() {
    const router = useRouter();
    const [taskName, setTaskName] = useState('');
    const [description, setDescription] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={[styles.backButton, shadowStyles.button]}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New Task</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.inputContainer, shadowStyles.card]}>
                    <Text style={styles.label}>Task Name</Text>
                    <TextInput
                        style={styles.input}
                        value={taskName}
                        onChangeText={setTaskName}
                        placeholder="Enter task name"
                    />
                </View>

                <View style={[styles.inputContainer, shadowStyles.card]}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Enter task description"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.createButton, shadowStyles.button]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.createButtonText}>Create Task</Text>
                </TouchableOpacity>
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        color: '#666',
    },
    input: {
        fontSize: 16,
        color: '#000',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    createButton: {
        backgroundColor: '#ff7a5c',
        width: '100%',
        borderRadius: 15,
        padding: 18,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
