import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNotes } from '@/contexts/NotesContext';
import { AuthScreen } from '@/components/AuthScreen';
import { NotesScreen } from '@/components/NotesScreen';

export default function Index() {
  const { session, loading } = useNotes();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return session ? <NotesScreen /> : <AuthScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});
