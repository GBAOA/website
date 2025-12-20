import { NextResponse } from 'next/server';
import { AddaClient, AddaResident, AddaFlat } from '@/lib/adda-client';
import { saveResidents, saveFlats, getResidents, getFlats } from '@/lib/db-residents';

export const dynamic = 'force-dynamic'; // No caching

export async function POST(request: Request) {
    try {
        const client = new AddaClient();

        console.log('[API] Starting Sync...');

        // We run these in parallel if possible, but sequential for safety first
        let residents: AddaResident[] = [];
        let flats: AddaFlat[] = [];

        try {
            residents = await client.getResidents();
            // Save to database
            if (residents.length > 0) {
                await saveResidents(residents);
            }
        } catch (e) {
            console.error('[API] Failed to fetch residents:', e);
        }

        try {
            flats = await client.getFlats();
            // Save to database
            if (flats.length > 0) {
                await saveFlats(flats);
            }
        } catch (e) {
            console.error('[API] Failed to fetch flats:', e);
        }

        // Get saved data from database to return
        const savedResidents = await getResidents();
        const savedFlats = await getFlats();

        return NextResponse.json({
            success: true,
            data: {
                residents: savedResidents,
                flats: savedFlats,
                syncedAt: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('[API] Sync failed:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}
