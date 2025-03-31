import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
interface KanbanCard {
  id: string;
  title: string;
  comments: number;
  hasNotification?: boolean;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const KanbanBoard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initial kanban columns state
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      color: '#8B8B8B',
      cards: [
        { id: '1', title: 'Initial Planning', comments: 5 },
        { id: '2', title: 'Research Phase', comments: 3 },
      ]
    },
    {
      id: 'todo',
      title: 'To Do',
      color: '#FF7A7A',
      cards: [
        { id: '3', title: 'Design Review', comments: 8 },
        { id: '4', title: 'Setup Environment', comments: 2 },
      ]
    },
    {
      id: 'ongoing',
      title: 'On Going',
      color: '#6B96EC',
      cards: [
        { id: '5', title: 'Task Customization', comments: 12, hasNotification: true },
        { id: '6', title: 'Deadline Management', comments: 12, hasNotification: true },
      ]
    },
    {
      id: 'in-process',
      title: 'In Process',
      color: '#FFC466',
      cards: [
        { id: '7', title: 'Application Tracking', comments: 12 },
        { id: '8', title: 'Mobile Optimization', comments: 12 },
      ]
    },
    {
      id: 'done',
      title: 'Done',
      color: '#63C77B',
      cards: [
        { id: '9', title: 'Requirements Gathering', comments: 15 },
        { id: '10', title: 'Initial Setup', comments: 7 },
      ]
    }
  ]);

  const handleGoBack = () => {
    router.back();
  };

  // Render a kanban card
  const renderCard = (card: KanbanCard) => (
    <View key={card.id} style={styles.card}>
      <Text style={styles.cardTitle}>{card.title}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardComments}>{card.comments} Comments</Text>
      </View>
      {card.hasNotification && (
        <View style={styles.notificationDot} />
      )}
    </View>
  );

  // Render a kanban column
  const renderColumn = (column: KanbanColumn) => (
    <View key={column.id} style={styles.columnContainer}>
      <View 
        style={[
          styles.columnHeader, 
          { backgroundColor: column.color }
        ]}
      >
        <Text style={styles.columnTitle}>{column.title}</Text>
      </View>
      
      {column.cards.map(card => renderCard(card))}
    </View>
  );

  // Team members
  const teamMembers = [
    { id: 1, image: require("../../../assets/images/team1.jpeg") },
        { id: 2, image: require("../../../assets/images/team1.jpeg") },
        { id: 3, image: require("../../../assets/images/team1.jpeg") },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Title */}
      <Text style={styles.projectTitle}>Website for Rune.io</Text>
      
      {/* Team members */}
      <View style={styles.teamSection}>
        <Text style={styles.teamLabel}>Team members</Text>
        <View style={styles.teamAvatars}>
          {teamMembers.map(member => (
            <Image
              key={member.id}
              source={member.image} 
              style={styles.avatar}
            />
          ))}
          <TouchableOpacity style={styles.addMemberButton}>
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.deadlineContainer}>
          <Ionicons name="alarm-outline" size={20} color="#000" />
          <Text style={styles.deadlineText}>
            Deadline: <Text style={styles.deadlineDate}>February 6</Text>
          </Text>
        </View>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cards"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
        </View>
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Kanban columns */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columnsContainer}
      >
        {columns.map(column => renderColumn(column))}
        
        {/* Add column placeholder */}
        <View style={styles.addColumnPlaceholder}>
          <TouchableOpacity style={styles.addColumnButton}>
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 20,
  },
  teamSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  teamLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  teamAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: -10,
  },
  addMemberButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#FFD68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  deadlineText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  deadlineDate: {
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    backgroundColor: '#F3F3F3',
    borderRadius: 15,
    overflow: 'hidden',
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  columnContainer: {
    width: 280,
    marginRight: 15,
  },
  columnHeader: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  columnTitle: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  cardComments: {
    fontSize: 12,
    color: '#888',
  },
  notificationDot: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B96EC',
  },
  addColumnPlaceholder: {
    width: 280,
    height: 200,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DADADA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addColumnButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default KanbanBoard;