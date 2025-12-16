import { events } from "@/lib/data"
import { Calendar, MapPin, Clock } from "lucide-react"

export default function Events() {
    const upcomingEvents = events.filter(e => e.category === 'upcoming')
    const pastEvents = events.filter(e => e.category === 'past')

    return (
        <div className="bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Community Events</h2>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                        Join us in our community gatherings and celebrations.
                    </p>
                </div>

                <div className="mt-16 space-y-12">
                    {/* Upcoming Section */}
                    <section>
                        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 border-b pb-2">
                            Upcoming Events
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="bg-card border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                                    <div className={`h-48 w-full ${event.image}`} />
                                    <div className="p-6">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.time}</span>
                                        </div>
                                        <h4 className="text-xl font-bold mb-2">{event.title}</h4>
                                        <p className="text-muted-foreground mb-4 text-sm">{event.description}</p>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
                                            <MapPin className="w-4 h-4" /> {event.location}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Past Section */}
                    <section>
                        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 border-b pb-2 text-muted-foreground">
                            Past Events
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-75">
                            {pastEvents.map((event) => (
                                <div key={event.id} className="bg-card border rounded-lg p-4">
                                    <h4 className="font-semibold">{event.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
