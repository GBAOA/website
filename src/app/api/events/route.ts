import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingEvents, getPastEvents, createEvent, EventInput } from '@/lib/db-events';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // 'upcoming' or 'past' or 'all'

        let events = [];
        if (type === 'past') {
            events = await getPastEvents();
        } else if (type === 'all') {
            const upcoming = await getUpcomingEvents();
            const past = await getPastEvents();
            events = [...upcoming, ...past];
        } else {
            // Default to upcoming
            events = await getUpcomingEvents();
        }

        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.title || !body.date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newEvent: EventInput = {
            title: body.title,
            description: body.description || null,
            date: body.date,
            time: body.time || null,
            location: body.location || null,
            image_url: body.image_url || null,
            google_calendar_event_id: body.google_calendar_event_id || null,
        };

        const result = await createEvent(newEvent);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}
