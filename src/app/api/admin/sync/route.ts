import { NextResponse } from 'next/server';
import { AddaClient, AddaResident, AddaFlat } from '@/lib/adda-client';

export const dynamic = 'force-dynamic'; // No caching

export async function POST(request: Request) {
    try {
        const client = new AddaClient();

        // 1. Fetch Residents
        // Note: In a real sync, we would save this to our own DB.
        // For this investigative task, we return the data to display in the Dashboard.
        console.log('[API] Starting Sync...');

        // We run these in parallel if possible, but sequential for safety first
        let residents: AddaResident[] = [];
        let flats: AddaFlat[] = [];

        try {
            residents = await client.getResidents();
        } catch (e) {
            console.error('[API] Failed to fetch residents:', e);
        }

        try {
            flats = await client.getFlats();
        } catch (e) {
            console.error('[API] Failed to fetch flats:', e);
        }

        return NextResponse.json({
            success: true,
            data: {
                residents,
                flats,
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
