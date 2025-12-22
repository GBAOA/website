import { NextRequest, NextResponse } from 'next/server';
import { getAllNotices, searchNotices, createNotice, NoticeInput } from '@/lib/db-notices';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category') || undefined;
        const search = searchParams.get('search') || undefined;

        let notices;
        if (search) {
            notices = await searchNotices(search);
            // If category is also provided, filter the search results
            if (category && category !== 'All') {
                notices = notices.filter(n => n.category === category);
            }
        } else {
            notices = await getAllNotices(category);
        }

        return NextResponse.json(notices);
    } catch (error) {
        console.error('Error fetching notices:', error);
        return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.title || !body.content || !body.category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newNotice: NoticeInput = {
            title: body.title,
            content: body.content,
            category: body.category,
            urgent: body.urgent || false,
            published_date: body.published_date || new Date().toISOString(),
        };

        const result = await createNotice(newNotice);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating notice:', error);
        return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 });
    }
}
