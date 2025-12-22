"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Clock, Loader2 } from "lucide-react"
import { GoogleCalendarEmbed } from "@/components/features/GoogleCalendarEmbed"
import { EventRow } from "@/lib/supabase"

export default function Events() {
    const [events, setEvents] = useState<EventRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/events?type=all')
                if (!res.ok) throw new Error('Failed to fetch events')
                const data = await res.json()
                setEvents(data)
            } catch (error) {
                console.error("Error fetching events:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    }, [])

    const today = new Date().toISOString().split('T')[0]
    const upcomingEvents = events.filter(e => e.date >= today)
    const pastEvents = events.filter(e => e.date < today)

    // TODO: Replace with real calendar ID via env var or admin setting
    const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || "";

    return (
        <div className="bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Community Events</h2>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                        Join us in our community gatherings and celebrations.
                    </p>
                </div>

                <div className="mt-16 space-y-16">
                    {/* Upcoming Section */}
                    <section>
                        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 border-b pb-2">
                            Upcoming Events
                        </h3>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : upcomingEvents.length === 0 ? (
                            <p className="text-muted-foreground italic">No upcoming events scheduled.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {upcomingEvents.map((event) => (
                                    <div key={event.id} className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                        {event.image_url && (
                                            <div className={`h-48 w-full bg-cover bg-center ${event.image_url.startsWith('http') ? '' : event.image_url}`} style={event.image_url.startsWith('http') ? { backgroundImage: `url(${event.image_url})` } : {}} />
                                        )}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}</span>
                                                {event.time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.time}</span>}
                                            </div>
                                            <h4 className="text-xl font-bold mb-2">{event.title}</h4>
                                            <p className="text-muted-foreground mb-4 text-sm flex-1">{event.description}</p>
                                            {event.location && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium mt-auto">
                                                    <MapPin className="w-4 h-4" /> {event.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Google Calendar Embed */}
                    <section>
                        <h3 className="text-2xl font-semibold mb-6 border-b pb-2">
                            Event Calendar
                        </h3>
                        {calendarId ? (
                            <GoogleCalendarEmbed calendarId={calendarId} />
                        ) : (
                            <div className="p-12 border border-dashed rounded-xl text-center text-muted-foreground bg-muted/30">
                                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Calendar integration is currently pending configuration.</p>
                            </div>
                        )}
                    </section>

                    {/* Past Section */}
                    {pastEvents.length > 0 && (
                        <section>
                            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 border-b pb-2 text-muted-foreground">
                                Past Events
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-75">
                                {pastEvents.map((event) => (
                                    <div key={event.id} className="bg-card border rounded-lg p-4">
                                        <h4 className="font-semibold">{event.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{new Date(event.date).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}
