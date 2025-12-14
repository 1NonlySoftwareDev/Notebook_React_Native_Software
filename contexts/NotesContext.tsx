import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Note } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

type NotesContextType = {
  notes: Note[];
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  addNote: (title: string, content: string, color: string) => Promise<void>;
  updateNote: (id: string, title: string, content: string, color: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setSession(session);
        if (session) {
          await fetchNotes();
        } else {
          setNotes([]);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchNotes();
    }
  }, [session]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setNotes([]);
  };

  const addNote = async (title: string, content: string, color: string) => {
    try {
      const { error } = await supabase.from('notes').insert([
        {
          user_id: session?.user?.id,
          title,
          content,
          color,
        },
      ]);

      if (error) throw error;
      await fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, title: string, content: string, color: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ title, content, color, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);

      if (error) throw error;
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  const refreshNotes = async () => {
    await fetchNotes();
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        session,
        signIn,
        signUp,
        signOut,
        addNote,
        updateNote,
        deleteNote,
        refreshNotes,
      }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
