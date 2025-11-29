import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string | null; // Time string (HH:MM:SS) or null
  type: 'interview' | 'deadline' | 'followup' | 'networking';
  company: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCalendarEventInput {
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time?: string | null; // Time string (HH:MM) or null
  type: 'interview' | 'deadline' | 'followup' | 'networking';
  company?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface UpdateCalendarEventInput {
  title?: string;
  date?: string;
  time?: string | null;
  type?: 'interview' | 'deadline' | 'followup' | 'networking';
  company?: string | null;
  location?: string | null;
  notes?: string | null;
}

export const useCalendarEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch all events for the user
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true })
          .order('time', { ascending: true, nullsFirst: false });

        if (fetchError) throw fetchError;
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Set up real-time subscription for calendar events
    const channel = supabase
      .channel('calendar_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEvents(prev => [...prev, payload.new as CalendarEvent].sort((a, b) => {
              if (a.date !== b.date) return a.date.localeCompare(b.date);
              if (!a.time && !b.time) return 0;
              if (!a.time) return 1;
              if (!b.time) return -1;
              return a.time.localeCompare(b.time);
            }));
          } else if (payload.eventType === 'UPDATE') {
            setEvents(prev => prev.map(event => 
              event.id === payload.new.id ? payload.new as CalendarEvent : event
            ).sort((a, b) => {
              if (a.date !== b.date) return a.date.localeCompare(b.date);
              if (!a.time && !b.time) return 0;
              if (!a.time) return 1;
              if (!b.time) return -1;
              return a.time.localeCompare(b.time);
            }));
          } else if (payload.eventType === 'DELETE') {
            setEvents(prev => prev.filter(event => event.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Create a new event
  const createEvent = async (input: CreateCalendarEventInput): Promise<CalendarEvent> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      // Format time if provided (convert HH:MM to HH:MM:SS)
      let formattedTime: string | null = null;
      if (input.time) {
        const timeParts = input.time.split(':');
        if (timeParts.length === 2) {
          formattedTime = `${input.time}:00`;
        } else {
          formattedTime = input.time;
        }
      }

      const eventData = {
        user_id: user.id,
        title: input.title.trim(),
        date: input.date,
        time: formattedTime,
        type: input.type,
        company: input.company?.trim() || null,
        location: input.location?.trim() || null,
        notes: input.notes?.trim() || null,
      };

      const { data, error: insertError } = await supabase
        .from('calendar_events')
        .insert(eventData)
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(`Failed to create event: ${insertError.message}`);
      }

      // Event will be added via real-time subscription, but we can also update state directly
      setEvents(prev => [...prev, data].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      }));

      return data;
    } catch (err: any) {
      console.error('Error creating calendar event:', err);
      setError(err as Error);
      throw new Error(err?.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  // Update an existing event
  const updateEvent = async (eventId: string, input: UpdateCalendarEventInput): Promise<CalendarEvent> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      // Format time if provided
      let formattedTime: string | null | undefined = input.time;
      if (input.time !== undefined && input.time !== null) {
        const timeParts = input.time.split(':');
        if (timeParts.length === 2) {
          formattedTime = `${input.time}:00`;
        }
      }

      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title.trim();
      if (input.date !== undefined) updateData.date = input.date;
      if (input.time !== undefined) updateData.time = formattedTime;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.company !== undefined) updateData.company = input.company?.trim() || null;
      if (input.location !== undefined) updateData.location = input.location?.trim() || null;
      if (input.notes !== undefined) updateData.notes = input.notes?.trim() || null;

      const { data, error: updateError } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', eventId)
        .eq('user_id', user.id) // Ensure user can only update their own events
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw new Error(`Failed to update event: ${updateError.message}`);
      }

      // Event will be updated via real-time subscription
      return data;
    } catch (err: any) {
      console.error('Error updating calendar event:', err);
      setError(err as Error);
      throw new Error(err?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string): Promise<void> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id); // Ensure user can only delete their own events

      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
        throw new Error(`Failed to delete event: ${deleteError.message}`);
      }

      // Event will be removed via real-time subscription
    } catch (err: any) {
      console.error('Error deleting calendar event:', err);
      setError(err as Error);
      throw new Error(err?.message || 'Failed to delete event');
    } finally {
      setSaving(false);
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date: string): CalendarEvent[] => {
    return events.filter(event => event.date === date);
  };

  // Get events for a date range
  const getEventsForDateRange = (startDate: string, endDate: string): CalendarEvent[] => {
    return events.filter(event => event.date >= startDate && event.date <= endDate);
  };

  // Get upcoming events (next N events)
  const getUpcomingEvents = (limit: number = 5): CalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    
    return events
      .filter(event => {
        if (event.date > today) return true;
        if (event.date === today && event.time && event.time >= now) return true;
        return false;
      })
      .slice(0, limit);
  };

  return {
    events,
    loading,
    error,
    saving,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsForDateRange,
    getUpcomingEvents,
    refetch: async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true })
          .order('time', { ascending: true, nullsFirst: false });
        
        if (fetchError) throw fetchError;
        setEvents(data || []);
      } catch (err) {
        console.error('Error refetching calendar events:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
  };
};

