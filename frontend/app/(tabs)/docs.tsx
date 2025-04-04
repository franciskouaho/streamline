import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyles } from '@/constants/CommonStyles';
import { useLanguage } from '@/contexts/LanguageContext';

interface Document {
    id: string;
    title: string;
    date: string;
    type: string;
}

export default function Docs() {
    const { translations } = useLanguage();

    const documents: Document[] = [
        { id: '1', title: 'Project Proposal', date: '2024-01-15', type: 'pdf' },
        { id: '2', title: 'User Research', date: '2024-01-18', type: 'doc' },
        { id: '3', title: 'Design Guidelines', date: '2024-01-20', type: 'pdf' },
        { id: '4', title: 'Sprint Planning', date: '2024-01-22', type: 'xls' },
        { id: '5', title: 'Marketing Assets', date: '2024-01-25', type: 'zip' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <Ionicons name="document-text" size={24} color="#ff7a5c" />;
            case 'doc':
                return <Ionicons name="document-text" size={24} color="#4d8efc" />;
            case 'xls':
                return <Ionicons name="grid" size={24} color="#43d2c3" />;
            case 'zip':
                return <Ionicons name="folder" size={24} color="#ffb443" />;
            default:
                return <Ionicons name="document" size={24} color="#888" />;
        }
    };

    const renderItem = ({ item }: { item: Document }) => (
        <TouchableOpacity style={[styles.documentItem, shadowStyles.card]}>
            <View style={styles.iconContainer}>
                {getIcon(item.type)}
            </View>
            <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{item.title}</Text>
                <Text style={styles.documentDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={20} color="#888" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{translations.projects.files}</Text>
                <TouchableOpacity style={[styles.sortButton, shadowStyles.button]}>
                    <Ionicons name="filter" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
                    <Text style={styles.activeFilterText}>Tous</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                    <Text style={styles.filterText}>Partagés</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                    <Text style={styles.filterText}>Favoris</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={documents}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.documentList}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={[styles.uploadButton, shadowStyles.button]}>
                <Ionicons name="cloud-upload" size={24} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    sortButton: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    filterContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    activeFilter: {
        backgroundColor: "#ff7a5c",
    },
    filterText: {
        color: "#666",
    },
    activeFilterText: {
        color: "#fff",
        fontWeight: "500",
    },
    documentList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    documentItem: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f8f8f8",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
    },
    documentInfo: {
        flex: 1,
    },
    documentTitle: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 5,
    },
    documentDate: {
        fontSize: 12,
        color: "#888",
    },
    moreButton: {
        padding: 5,
    },
    uploadButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#ff7a5c",
        alignItems: "center",
        justifyContent: "center",
    },
});