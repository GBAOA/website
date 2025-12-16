import { Button } from "@/components/ui/button"
import { events } from "@/lib/data"
import { Plus, Edit2, Trash2, Calendar } from "lucide-react"

export default function AdminEventsPage() {
    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Event Management</h1>
                    <p className="text-muted-foreground text-sm mt-1">Create and manage community events</p>
                </div>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Create Event
                </Button>
            </div>

            <div className="grid gap-6">
                {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-6 bg-card border rounded-xl shadow-xs">
                        <div className="flex items-start gap-4">
                            <div className={`w-16 h-16 rounded-lg ${event.image} flex-none`} />
                            <div>
                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${event.category === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {event.category.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon">
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
