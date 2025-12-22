"use client"

interface GoogleCalendarEmbedProps {
    calendarId: string
    title?: string
}

export function GoogleCalendarEmbed({ calendarId, title = "Society Events" }: GoogleCalendarEmbedProps) {
    if (!calendarId) return null;

    // Construct the embed URL safely
    // Using a public calendar embed URL format
    const src = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=Asia%2FKolkata`;

    return (
        <div className="w-full h-[600px] border rounded-xl overflow-hidden bg-card shadow-sm">
            <iframe
                src={src}
                style={{ border: 0 }}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                title={title}
            ></iframe>
        </div>
    )
}
