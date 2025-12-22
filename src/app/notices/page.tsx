"use client"

import { useState, useEffect } from "react"
import { Bell, AlertTriangle, Loader2 } from "lucide-react"
import { NoticeFilter } from "@/components/features/NoticeFilter"
import { NoticeRow } from "@/lib/supabase"

export default function Notices() {
    const [notices, setNotices] = useState<NoticeRow[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState("All")
    const [search, setSearch] = useState("")

    useEffect(() => {
        const fetchNotices = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (category !== 'All') params.append('category', category)
                if (search) params.append('search', search)

                const res = await fetch(`/api/notices?${params.toString()}`)
                if (!res.ok) throw new Error('Failed to fetch notices')

                const data = await res.json()
                setNotices(data)
            } catch (error) {
                console.error("Error fetching notices:", error)
            } finally {
                setLoading(false)
            }
        }

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchNotices()
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [category, search])

    return (
        <div className="bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Notice Board</h2>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                        Important announcements and updates for residents.
                    </p>
                </div>

                <div className="mx-auto max-w-3xl">
                    <NoticeFilter
                        category={category}
                        onCategoryChange={setCategory}
                        search={search}
                        onSearchChange={setSearch}
                    />

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : notices.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                            No notices found matching your criteria.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {notices.map((notice) => (
                                <div key={notice.id} className={`p-6 rounded-xl border-l-4 shadow-sm bg-card transition-all hover:shadow-md ${notice.urgent ? 'border-l-destructive' : 'border-l-primary'}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                                {notice.urgent ? <AlertTriangle className="w-5 h-5 text-destructive shrink-0" /> : <Bell className="w-5 h-5 text-primary shrink-0" />}
                                                <h3 className="text-lg font-semibold text-foreground">{notice.title}</h3>
                                                {notice.urgent && <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/10">Urgent</span>}
                                                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                                                    {notice.category}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground text-sm whitespace-pre-wrap">{notice.content}</p>
                                        </div>
                                        <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                                            {new Date(notice.published_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t sm:hidden text-xs text-muted-foreground">
                                        Posted: {new Date(notice.published_date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
