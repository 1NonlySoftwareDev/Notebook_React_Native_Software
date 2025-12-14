import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNotes } from '@/contexts/NotesContext';
import { Plus, LogOut, Search } from 'lucide-react-native';
import { NoteCard } from './NoteCard';
import { NoteModal } from './NoteModal';
import { DeleteModal } from './DeleteModal';
import { Note } from '@/lib/supabase';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const columns = isTablet ? 3 : 2;
const cardWidth = (width - 32 - (columns - 1) * 12) / columns;

export function NotesScreen() {
  const { notes, signOut, refreshNotes } = useNotes();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotes();
    setRefreshing(false);
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setModalVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setModalVisible(true);
  };

  const handleDeleteNote = (note: Note) => {
    setDeletingNote(note);
    setDeleteModalVisible(true);
  };

  const organizeNotesInColumns = () => {
    const columnHeights: number[] = Array(columns).fill(0);
    const columnNotes: Note[][] = Array.from({ length: columns }, () => []);

    notes.forEach((note) => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      columnNotes[shortestColumn].push(note);
      columnHeights[shortestColumn] += estimateNoteHeight(note);
    });

    return columnNotes;
  };

  const estimateNoteHeight = (note: Note) => {
    const baseHeight = 120;
    const titleHeight = Math.ceil(note.title.length / 20) * 20;
    const contentHeight = Math.ceil(note.content.length / 30) * 15;
    return baseHeight + titleHeight + contentHeight;
  };

  const columnNotes = organizeNotesInColumns();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Notes</Text>
          <Text style={styles.headerSubtitle}>{notes.length} notes</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <LogOut size={20} color="#ef4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {notes.length === 0 ? (
        <Animated.View entering={FadeIn} style={styles.emptyContainer}>
          <Search size={64} color="#cbd5e1" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No notes yet</Text>
          <Text style={styles.emptySubtitle}>Tap the + button to create your first note</Text>
        </Animated.View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}>
          <View style={styles.masonryContainer}>
            {columnNotes.map((column, columnIndex) => (
              <View key={columnIndex} style={styles.column}>
                {column.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPress={() => handleEditNote(note)}
                    onLongPress={() => handleDeleteNote(note)}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddNote} activeOpacity={0.8}>
        <Plus size={28} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>

      <NoteModal
        visible={modalVisible}
        note={editingNote}
        onClose={() => setModalVisible(false)}
      />

      <DeleteModal
        visible={deleteModalVisible}
        note={deletingNote}
        onClose={() => setDeleteModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  masonryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
