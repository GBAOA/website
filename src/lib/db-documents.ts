import { DocumentRow } from './supabase';
import { supabaseAdmin } from './supabase-admin';

export type DocumentInput = Omit<DocumentRow, 'id' | 'created_at' | 'updated_at'>;

/**
 * Get all documents, optionally filtered by category
 */
export async function getAllDocuments(category?: string): Promise<DocumentRow[]> {
    try {
        let query = supabaseAdmin
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[DB] Error getting documents:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('[DB] Failed to get documents:', error);
        return [];
    }
}

/**
 * Create a new document
 */
export async function createDocument(doc: DocumentInput): Promise<DocumentRow | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('documents')
            .insert([doc])
            .select()
            .single();

        if (error) {
            console.error('[DB] Error creating document:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('[DB] Failed to create document:', error);
        throw error;
    }
}

/**
 * Update a document
 */
export async function updateDocument(id: string, updates: Partial<DocumentInput>): Promise<DocumentRow | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('documents')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[DB] Error updating document:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('[DB] Failed to update document:', error);
        throw error;
    }
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<boolean> {
    try {
        const { error } = await supabaseAdmin
            .from('documents')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[DB] Error deleting document:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('[DB] Failed to delete document:', error);
        throw error;
    }
}
