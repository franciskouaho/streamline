import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Types
interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  comments: number;
  hasNotification?: boolean;
  assignee?: {
    id: string;
    name: string;
    image: any;
  };
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  labels?: string[];
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const KanbanBoard: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardColumn, setNewCardColumn] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  
  // État initial des colonnes Kanban
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'todo',
      title: 'To Do',
      color: '#4d8efc', // bleu
      cards: [
        { id: '1', title: 'Task Customization', comments: 12, hasNotification: true },
        { id: '2', title: 'Deadline Management', comments: 8, hasNotification: true },
        { id: '3', title: 'Networking Assistance', comments: 5, hasNotification: true },
        { id: '4', title: 'Data Security Assurance', comments: 3, hasNotification: true },
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: '#ffb443', // orange
      cards: [
        { id: '5', title: 'Application Tracking', comments: 7 },
        { id: '6', title: 'Automated Job Alerts', comments: 4 },
        { id: '7', title: 'Mobile Optimization', comments: 9 },
      ]
    },
    {
      id: 'completed',
      title: 'Completed',
      color: '#43d2c3', // turquoise
      cards: [
        { id: '8', title: 'User Authentication', comments: 2 },
        { id: '9', title: 'Search Functionality', comments: 0 },
      ]
    }
  ]);

  // État pour le drag and drop
  const [draggingCard, setDraggingCard] = useState<KanbanCard | null>(null);
  const [draggingCardColumn, setDraggingCardColumn] = useState<string | null>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        
        // Logic for handling the drop of card
        if (draggingCard && draggingCardColumn) {
          // Determine which column the card was dropped in
          // This would involve calculating positions and checking bounds
          // For simplicity, we're just setting it back to the original position
          
          // Reset position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
          }).start(() => {
            setDraggingCard(null);
            setDraggingCardColumn(null);
          });
        }
      }
    })
  ).current;

  // Fonction pour gérer le glisser-déposer entre colonnes
  const moveCard = (cardId: string, fromColumnId: string, toColumnId: string) => {
    const updatedColumns = [...columns];
    
    // Trouver la colonne source et la carte
    const sourceColIndex = updatedColumns.findIndex(col => col.id === fromColumnId);
    const cardIndex = updatedColumns[sourceColIndex].cards.findIndex(card => card.id === cardId);
    const card = updatedColumns[sourceColIndex].cards[cardIndex];
    
    // Retirer la carte de la colonne source
    updatedColumns[sourceColIndex].cards.splice(cardIndex, 1);
    
    // Ajouter la carte à la colonne de destination
    const destColIndex = updatedColumns.findIndex(col => col.id === toColumnId);
    updatedColumns[destColIndex].cards.push(card);
    
    setColumns(updatedColumns);
  };

  // Fonction pour ajouter une nouvelle carte
  const addNewCard = () => {
    if (!newCardTitle.trim() || !newCardColumn) return;
    
    const updatedColumns = [...columns];
    const colIndex = updatedColumns.findIndex(col => col.id === newCardColumn);
    
    if (colIndex !== -1) {
      updatedColumns[colIndex].cards.push({
        id: Date.now().toString(),
        title: newCardTitle,
        comments: 0
      });
      
      setColumns(updatedColumns);
      setNewCardTitle('');
      setIsAddingCard(false);
      setNewCardColumn(null);
    }
  };

  // Rendu d'une carte Kanban
  const renderCard = (card: KanbanCard, columnId: string) => (
    <TouchableOpacity
      key={card.id}
      style={styles.card}
      onLongPress={() => {
        setDraggingCard(card);
        setDraggingCardColumn(columnId);
      }}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        {card.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {card.description}
          </Text>
        )}
        
        <View style={styles.cardFooter}>
          {card.assignee && (
            <Image source={card.assignee.image} style={styles.cardAssignee} />
          )}
          
          <View style={styles.cardCommentContainer}>
            <Ionicons name="chatbubble-outline" size={14} color="#888" />
            <Text style={styles.cardComments}>{card.comments}</Text>
          </View>
        </View>
      </View>
      
      {card.hasNotification && (
        <View style={styles.notificationDot} />
      )}
    </TouchableOpacity>
  );

  // Rendu d'une colonne Kanban
  const renderColumn = (column: KanbanColumn) => (
    <View style={styles.column} key={column.id}>
      <View style={[styles.columnHeader, { borderBottomColor: column.color }]}>
        <Text style={styles.columnTitle}>{column.title}</Text>
        <View style={styles.columnCount}>
          <Text style={styles.columnCountText}>{column.cards.length}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.columnContent} showsVerticalScrollIndicator={false}>
        {column.cards.map(card => renderCard(card, column.id))}
        
        {isAddingCard && newCardColumn === column.id ? (
          <View style={styles.newCardContainer}>
            <TextInput
              style={styles.newCardInput}
              placeholder="Enter card title..."
              value={newCardTitle}
              onChangeText={setNewCardTitle}
              autoFocus
              multiline
            />
            <View style={styles.newCardActions}>
              <TouchableOpacity 
                style={styles.newCardButton} 
                onPress={addNewCard}
              >
                <Text style={styles.newCardButtonText}>Add</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.newCardButton, styles.newCardCancelButton]} 
                onPress={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
              >
                <Text style={styles.newCardCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addCardButton}
            onPress={() => {
              setIsAddingCard(true);
              setNewCardColumn(column.id);
            }}
          >
            <Ionicons name="add" size={20} color="#888" />
            <Text style={styles.addCardText}>Add Card</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Kanban Board</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="filter-outline" size={22} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#4d8efc' }]} />
          <Text style={styles.statLabel}>To Do</Text>
          <Text style={styles.statCount}>
            {columns.find(col => col.id === 'todo')?.cards.length || 0}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#ffb443' }]} />
          <Text style={styles.statLabel}>In Progress</Text>
          <Text style={styles.statCount}>
            {columns.find(col => col.id === 'in-progress')?.cards.length || 0}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#43d2c3' }]} />
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statCount}>
            {columns.find(col => col.id === 'completed')?.cards.length || 0}
          </Text>
        </View>
      </View>
      
      <ScrollView 
        horizontal
        style={styles.kanbanContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kanbanContent}
      >
        {columns.map(renderColumn)}
      </ScrollView>
      
      <TouchableOpacity style={styles.addColumnButton}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  statCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  kanbanContainer: {
    flex: 1,
  },
  kanbanContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  column: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    height: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 3,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  columnCount: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  columnCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  columnContent: {
    padding: 10,
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    position: 'relative',
  },
  cardContent: {
    minHeight: 60,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardAssignee: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  cardCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardComments: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4d8efc',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    marginTop: 5,
  },
  addCardText: {
    marginLeft: 5,
    color: '#888',
    fontSize: 14,
  },
  newCardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  newCardInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
  },
  newCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  newCardButton: {
    backgroundColor: '#4d8efc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  newCardButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  newCardCancelButton: {
    backgroundColor: 'transparent',
  },
  newCardCancelText: {
    color: '#666',
    fontSize: 12,
  },
  addColumnButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff7a5c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default KanbanBoard;