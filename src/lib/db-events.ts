import { EventRow } from './supabase';
import { supabaseAdmin } from './supabase-admin';

export type EventInput = Omit<EventRow, 'id' | 'created_at' | 'updated_at'>;

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(): Promise<EventRow[]> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .gte('date', today)
            .order('date', { ascending: true });

        if (error) {
            console.error('[DB] Error getting upcoming events:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('[DB] Failed to get upcoming events:', error);
        return [];
    }
}

/**
 * Get past events
 */
export async function getPastEvents(): Promise<EventRow[]> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .lt('date', today)
            .order('date', { ascending: false });

        if (error) {
            console.error('[DB] Error getting past events:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('[DB] Failed to get past events:', error);
        return [];
    }
}

/**
 * Create a new event
 */
export async function createEvent(event: EventInput): Promise<EventRow | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('events')
            .insert([event])
            .select()
            .single();

        if (error) {
            console.error('[DB] Error creating event:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('[DB] Failed to create event:', error);
        throw error;
    }
}

/**
 * Update an event
 */
export async function updateEvent(id: string, updates: Partial<EventInput>): Promise<EventRow | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('events')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[DB] Error updating event:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('[DB] Failed to update event:', error);
        throw error;
    }
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<boolean> {
    try {
        const { error } = await supabaseAdmin
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[DB] Error deleting event:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('[DB] Failed to delete event:', error);
        throw error;
    }
}
