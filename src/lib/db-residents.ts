import { supabaseAdmin, ResidentRow, FlatRow } from './supabase';
import { AddaResident, AddaFlat } from './adda-client';

/**
 * Save residents to database
 */
export async function saveResidents(residents: AddaResident[]): Promise<void> {
    try {
        const residentsData = residents.map(resident => ({
            adda_id: resident.id,
            name: resident.name,
            flat: resident.flat,
            email: resident.email,
            phone: resident.phone,
            type: resident.type,
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // Upsert residents (update if exists, insert if new)
        const { error } = await supabaseAdmin
            .from('residents')
            .upsert(residentsData, {
                onConflict: 'adda_id',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('[DB] Error saving residents:', error);
            throw error;
        }

        console.log(`[DB] Saved ${residents.length} residents`);
    } catch (error) {
        console.error('[DB] Failed to save residents:', error);
        throw error;
    }
}

/**
 * Save flats to database
 */
export async function saveFlats(flats: AddaFlat[]): Promise<void> {
    try {
        const flatsData = flats.map(flat => ({
            adda_id: flat.id,
            block: flat.block,
            number: flat.number,
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // Upsert flats
        const { error } = await supabaseAdmin
            .from('flats')
            .upsert(flatsData, {
                onConflict: 'adda_id',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('[DB] Error saving flats:', error);
            throw error;
        }

        console.log(`[DB] Saved ${flats.length} flats`);
    } catch (error) {
        console.error('[DB] Failed to save flats:', error);
        throw error;
    }
}

/**
 * Get all residents from database
 */
export async function getResidents(): Promise<ResidentRow[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('residents')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('[DB] Error getting residents:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('[DB] Failed to get residents:', error);
        return [];
    }
}

/**
 * Get all flats from database
 */
export async function getFlats(): Promise<FlatRow[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('flats')
            .select('*')
            .order('block', { ascending: true })
            .order('number', { ascending: true });

        if (error) {
            console.error('[DB] Error getting flats:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('[DB] Failed to get flats:', error);
        return [];
    }
}

