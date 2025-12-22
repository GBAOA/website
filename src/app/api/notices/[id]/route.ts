import { NextRequest, NextResponse } from 'next/server';
import { updateNotice, deleteNotice } from '@/lib/db-notices';

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const result = await updateNotice(id, body);

        if (!result) {
            return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating notice:', error);
        return NextResponse.json({ error: 'Failed to update notice' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const success = await deleteNotice(id);

        if (!success) {
            return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting notice:', error);
        return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 });
    }
}
