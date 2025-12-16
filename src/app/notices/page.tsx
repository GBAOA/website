import { notices } from "@/lib/data"
import { Bell, AlertTriangle } from "lucide-react"

export default function Notices() {
    return (
        <div className="bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Notice Board</h2>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                        Important announcements and updates for residents.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-2xl space-y-8">
                    {notices.map((notice) => (
                        <div key={notice.id} className={`p-6 rounded-xl border-l-4 shadow-sm bg-card ${notice.urgent ? 'border-l-destructive' : 'border-l-primary'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {notice.urgent ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <Bell className="w-5 h-5 text-primary" />}
                                        <h3 className="text-lg font-semibold text-foreground">{notice.title}</h3>
                                        {notice.urgent && <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/10">Urgent</span>}
                                    </div>
                                    <p className="text-muted-foreground text-sm">{notice.content}</p>
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                    {notice.date}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
