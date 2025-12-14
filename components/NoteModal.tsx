import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNotes } from '@/contexts/NotesContext';
import { Note } from '@/lib/supabase';
import { X, Check, Palette } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Rose', value: '#ffe4e6' },
  { name: 'Pink', value: '#fce7f3' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Yellow', value: '#fef3c7' },
  { name: 'Green', value: '#d1fae5' },
  { name: 'Teal', value: '#ccfbf1' },
  { name: 'Blue', value: '#dbeafe' },
  { name: 'Sky', value: '#e0f2fe' },
  { name: 'Lavender', value: '#e0e7ff' },
];

type NoteModalProps = {
  visible: boolean;
  note: Note | null;
  onClose: () => void;
};

export function NoteModal({ visible, note, onClose }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addNote, updateNote } = useNotes();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color);
    } else {
      setTitle('');
      setContent('');
      setColor('#ffffff');
    }
    setShowColorPicker(false);
  }, [note, visible]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Please add a title or content');
      return;
    }

    setSaving(true);
    try {
      if (note) {
        await updateNote(note.id, title.trim(), content.trim(), color);
      } else {
        await addNote(title.trim(), content.trim(), color);
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutDown.springify()}
          style={styles.modalContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modal}>
            <View style={[styles.header, { backgroundColor: color }]}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <X size={24} color="#64748b" strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{note ? 'Edit Note' : 'New Note'}</Text>
              <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={saving}>
                <Check size={24} color="#6366f1" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} bounces={false}>
              <View style={[styles.form, { backgroundColor: color }]}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Title"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#94a3b8"
                  multiline
                />

                <TextInput
                  style={styles.contentInput}
                  placeholder="Start writing..."
                  value={content}
                  onChangeText={setContent}
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.colorButton}
                onPress={() => setShowColorPicker(!showColorPicker)}>
                <Palette size={20} color="#64748b" strokeWidth={2} />
                <Text style={styles.colorButtonText}>Color</Text>
              </TouchableOpacity>

              {showColorPicker && (
                <Animated.View entering={FadeIn} style={styles.colorPicker}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.colorList}>
                      {COLORS.map((c) => (
                        <TouchableOpacity
                          key={c.value}
                          style={[
                            styles.colorOption,
                            { backgroundColor: c.value },
                            color === c.value && styles.colorOptionSelected,
                          ]}
                          onPress={() => setColor(c.value)}
                          activeOpacity={0.7}>
                          {color === c.value && (
                            <View style={styles.colorCheckmark}>
                              <Check size={16} color="#6366f1" strokeWidth={3} />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </Animated.View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    maxHeight: '90%',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    maxHeight: 400,
  },
  form: {
    padding: 20,
    gap: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    minHeight: 40,
  },
  contentInput: {
    fontSize: 16,
    color: '#334155',
    minHeight: 200,
    lineHeight: 24,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  colorButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  colorPicker: {
    marginTop: 12,
  },
  colorList: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderColor: '#6366f1',
    borderWidth: 3,
  },
  colorCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
