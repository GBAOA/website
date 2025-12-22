import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, createDocument, DocumentInput } from '@/lib/db-documents';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category') || undefined;

        const documents = await getAllDocuments(category);

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.title || !body.category || !body.google_drive_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newDoc: DocumentInput = {
            title: body.title,
            category: body.category,
            google_drive_url: body.google_drive_url,
            google_drive_id: body.google_drive_id || null,
            description: body.description || null,
        };

        const result = await createDocument(newDoc);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }
}
