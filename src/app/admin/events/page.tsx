"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Calendar, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EventRow } from "@/lib/supabase"

export default function AdminEvents() {
    const [events, setEvents] = useState<EventRow[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        google_calendar_event_id: ""
    })

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/events?type=all')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setEvents(data)
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this event?")) return
        try {
            const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setEvents(events.filter(e => e.id !== id))
            }
        } catch (error) {
            console.error("Error deleting:", error)
        }
    }

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setIsCreating(false)
                setFormData({ title: "", date: "", time: "", location: "", description: "", google_calendar_event_id: "" })
                fetchEvents()
            }
        } catch (error) {
            console.error("Error creating:", error)
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Manage Events</h1>
                <Button onClick={() => setIsCreating(!isCreating)} gap-2>
                    {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isCreating ? "Cancel" : "Create Event"}
                </Button>
            </div>

            {isCreating && (
                <div className="bg-card p-6 rounded-xl border shadow-sm mb-8 space-y-4">
                    <h3 className="font-semibold text-lg">New Event</h3>
                    <div className="grid gap-4">
                        <Input
                            placeholder="Event Title"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                            <Input
                                placeholder="Time (e.g. 6:00 PM)"
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                        <Input
                            placeholder="Location"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                        <Input
                            placeholder="Google Calendar Event ID (Optional)"
                            value={formData.google_calendar_event_id}
                            onChange={e => setFormData({ ...formData, google_calendar_event_id: e.target.value })}
                        />
                        <Button onClick={handleCreate} disabled={!formData.title || !formData.date}>
                            Create Event
                        </Button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="space-y-4">
                    {events.map(event => (
                        <div key={event.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card border rounded-lg gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()} • {event.time}
                                </div>
                                <h3 className="font-semibold">{event.title}</h3>
                                {event.location && <p className="text-sm text-muted-foreground">{event.location}</p>}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
