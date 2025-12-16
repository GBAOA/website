import Link from "next/link"
import { Calendar, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { events, notices } from "@/lib/data"

export function Highlights() {
    return (
        <div className="bg-muted/30 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Happenings at Golden Blossom</h2>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                        Stay updated with the latest events and community announcements.
                    </p>
                </div>

                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">

                    {/* Upcoming Events */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-semibold leading-7 flex items-center gap-2">
                                <Calendar className="h-6 w-6 text-primary" /> Upcoming Events
                            </h3>
                            <Link href="/events" className="text-sm font-semibold leading-6 text-primary">View all <span aria-hidden="true">→</span></Link>
                        </div>
                        <div className="space-y-8">
                            {events.map((event) => (
                                <div key={event.id} className="relative flex flex-col gap-4 sm:flex-row sm:items-center bg-card p-4 rounded-xl border shadow-xs">
                                    <div className={`aspect-video w-full sm:w-32 rounded-lg ${event.image} flex-none`} />
                                    <div>
                                        <div className="text-xs leading-6 text-muted-foreground">{event.date}</div>
                                        <h4 className="mt-1 text-lg font-semibold text-foreground">
                                            <a href="#">
                                                <span className="absolute inset-0" />
                                                {event.title}
                                            </a>
                                        </h4>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Latest Announcements */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-semibold leading-7 flex items-center gap-2">
                                <Bell className="h-6 w-6 text-primary" /> Latest Notices
                            </h3>
                            <Link href="/notices" className="text-sm font-semibold leading-6 text-primary">View all <span aria-hidden="true">→</span></Link>
                        </div>
                        <ul role="list" className="divide-y divide-border border rounded-xl bg-card">
                            {notices.map((notice) => (
                                <li key={notice.id} className="flex gap-x-4 p-4 hover:bg-muted/50 transition-colors">
                                    <div className="min-w-0 flex-auto">
                                        <p className="text-sm font-semibold leading-6 text-foreground flex items-center gap-2">
                                            {notice.title}
                                            {notice.urgent && <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/10">Urgent</span>}
                                        </p>
                                        <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">{notice.date}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    )
}
