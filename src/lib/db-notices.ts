import { NoticeRow } from './supabase';
import { supabaseAdmin } from './supabase-admin';

export type NoticeInput = Omit<NoticeRow, 'id' | 'created_at' | 'updated_at'>;

/**
 * Get all notices, optionally filtered by category
 */
export async function getAllNotices(category?: string): Promise<NoticeRow[]> {
    try {
        let query = supabaseAdmin
            .from('notices')
            .select('*')
            .order('published_date', { ascending: false });

        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[DB] Error getting notices:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('[DB] Failed to get notices:', error);
        return [];
    }
}

/**
 * Search notices by title or content
 */
export async function searchNotices(searchQuery: string): Promise<NoticeRow[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('notices')
            .select('*')
            .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
            .order('published_date', { ascending: false });

        if (error) {
            console.error('[DB] Error searching notices:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('[DB] Failed to search notices:', error);
        return [];
    }
}

/**
 * Create a new notice
 */
export async function createNotice(notice: NoticeInput): Promise<NoticeRow | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('notices')
            .insert([notice])
            .select()
            .single();

        if (error) {
            console.error('[DB] Error creating notice:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('[DB] Failed to create notice:', error);
        throw error;
    }
}

/**
 * Update a notice
 */
export async function updateNotice(id: string, updates: Partial<NoticeInput>): Promise<NoticeRow | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('notices')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[DB] Error updating notice:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('[DB] Failed to update notice:', error);
        throw error;
    }
}

/**
 * Delete a notice
 */
export async function deleteNotice(id: string): Promise<boolean> {
    try {
        const { error } = await supabaseAdmin
            .from('notices')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[DB] Error deleting notice:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('[DB] Failed to delete notice:', error);
        throw error;
    }
}
