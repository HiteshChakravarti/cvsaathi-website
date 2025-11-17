import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

// Database row structure (each message-response pair is a row)
export interface AIChatRow {
  id: string;
  user_id: string;
  session_id: string;
  message: string;
  response: string;
  context?: any; // JSONB
  created_at: string;
}

// Grouped conversation structure for UI
export interface AIConversation {
  session_id: string;
  user_id: string;
  title: string;
  messages: AIMessage[];
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const useAIConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchConversations = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all message-response pairs
      const { data: rows, error: fetchError } = await supabase
        .from('ai_chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Group by session_id to create conversations
      const conversationsMap = new Map<string, AIConversation>();
      
      (rows || []).forEach((row: AIChatRow) => {
        if (!conversationsMap.has(row.session_id)) {
          conversationsMap.set(row.session_id, {
            session_id: row.session_id,
            user_id: row.user_id,
            title: row.message.substring(0, 50) || 'New Conversation',
            messages: [],
            created_at: row.created_at,
            updated_at: row.created_at,
          });
        }
        
        const conversation = conversationsMap.get(row.session_id)!;
        
        // Add user message
        conversation.messages.push({
          role: 'user',
          content: row.message,
          timestamp: row.created_at,
        });
        
        // Add assistant response
        conversation.messages.push({
          role: 'assistant',
          content: row.response,
          timestamp: row.created_at,
        });
        
        // Update updated_at to latest message
        if (new Date(row.created_at) > new Date(conversation.updated_at)) {
          conversation.updated_at = row.created_at;
        }
      });

      // Convert map to array and sort by updated_at
      const conversationsArray = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      setConversations(conversationsArray);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchConversations();
  }, [user?.id]);

  const createConversation = async (title?: string, contextType?: 'resume' | 'interview' | 'general') => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      // Generate a unique session_id
      const sessionId = `session_${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Create a new conversation object (not saved to DB yet - will be saved when first message is sent)
      const newConversation: AIConversation = {
        session_id: sessionId,
        user_id: user.id,
        title: title || 'New Conversation',
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add to local state immediately
      setConversations(prev => [newConversation, ...prev]);
      
      return newConversation;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setError(err as Error);
      throw new Error(err?.message || 'Failed to create conversation');
    } finally {
      setSaving(false);
    }
  };

  const addMessage = async (sessionId: string, userMessage: AIMessage, aiResponse?: AIMessage) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      // Save user message and AI response as a single row
      // If AI response is provided, save both; otherwise just save user message (AI response will come later)
      if (aiResponse) {
        const { data, error: insertError } = await supabase
          .from('ai_chat_conversations')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            message: userMessage.content,
            response: aiResponse.content,
            context: { role: 'general' }, // Can be customized based on context
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Update local state
        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.session_id === sessionId) {
              return {
                ...conv,
                messages: [...conv.messages, userMessage, aiResponse],
                updated_at: new Date().toISOString(),
              };
            }
            return conv;
          });
          return updated;
        });

        return data;
      } else {
        // Only user message - AI response will be added later
        // For now, just update local state
        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.session_id === sessionId) {
              return {
                ...conv,
                messages: [...conv.messages, userMessage],
                updated_at: new Date().toISOString(),
              };
            }
            return conv;
          });
          return updated;
        });
      }
    } catch (err) {
      console.error('Error adding message:', err);
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Helper function to save AI response after it's received
  const saveAIResponse = async (sessionId: string, userMessage: string, aiResponse: string, context?: any) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('ai_chat_conversations')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          message: userMessage,
          response: aiResponse,
          context: context || { role: 'general' },
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.session_id === sessionId) {
            const aiMsg: AIMessage = {
              role: 'assistant',
              content: aiResponse,
              timestamp: new Date().toISOString(),
            };
            return {
              ...conv,
              messages: [...conv.messages, aiMsg],
              updated_at: new Date().toISOString(),
            };
          }
          return conv;
        });
        return updated;
      });

      return data;
    } catch (err) {
      console.error('Error saving AI response:', err);
      setError(err as Error);
      throw err;
    }
  };

  const updateConversationTitle = async (sessionId: string, title: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Update local state only (title is derived from first message)
      setConversations(prev => prev.map(c => {
        if (c.session_id === sessionId) {
          return { ...c, title };
        }
        return c;
      }));
    } catch (err) {
      console.error('Error updating conversation title:', err);
      setError(err as Error);
      throw err;
    }
  };

  const deleteConversation = async (sessionId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Delete all rows with this session_id
      const { error: deleteError } = await supabase
        .from('ai_chat_conversations')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setConversations(prev => prev.filter(c => c.session_id !== sessionId));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError(err as Error);
      throw err;
    }
  };

  return {
    conversations,
    loading,
    error,
    saving,
    createConversation,
    addMessage,
    saveAIResponse,
    updateConversationTitle,
    deleteConversation,
    refetch: async () => {
      if (user?.id) {
        await fetchConversations();
      }
    },
  };
};

