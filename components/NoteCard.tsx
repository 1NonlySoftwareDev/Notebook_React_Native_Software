import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Note } from '@/lib/supabase';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type NoteCardProps = {
  note: Note;
  onPress: () => void;
  onLongPress: () => void;
};

export function NoteCard({ note, onPress, onLongPress }: NoteCardProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = true;
      scale.value = withSpring(0.95);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      pressed.value = false;
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <GestureDetector gesture={tap}>
      <AnimatedTouchable
        entering={FadeIn.duration(400)}
        style={[styles.card, { backgroundColor: note.color }, animatedStyle]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={1}>
        {note.title ? (
          <Text style={styles.title} numberOfLines={3}>
            {note.title}
          </Text>
        ) : null}
        {note.content ? (
          <Text style={styles.content} numberOfLines={8}>
            {note.content}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(note.updated_at)}</Text>
        </View>
      </AnimatedTouchable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 24,
  },
  content: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});
