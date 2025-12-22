"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, Save, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NoticeRow } from "@/lib/supabase"

export default function AdminNotices() {
    const [notices, setNotices] = useState<NoticeRow[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "General",
        urgent: false
    })

    const fetchNotices = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/notices')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setNotices(data)
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotices()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notice?")) return
        try {
            const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setNotices(notices.filter(n => n.id !== id))
            }
        } catch (error) {
            console.error("Error deleting:", error)
        }
    }

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/notices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setIsCreating(false)
                setFormData({ title: "", content: "", category: "General", urgent: false })
                fetchNotices()
            }
        } catch (error) {
            console.error("Error creating:", error)
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Manage Notices</h1>
                <Button onClick={() => setIsCreating(!isCreating)} gap-2>
                    {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isCreating ? "Cancel" : "Create Notice"}
                </Button>
            </div>

            {isCreating && (
                <div className="bg-card p-6 rounded-xl border shadow-sm mb-8 space-y-4">
                    <h3 className="font-semibold text-lg">New Notice</h3>
                    <div className="grid gap-4">
                        <Input
                            placeholder="Title"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                        <Select
                            value={formData.category}
                            onValueChange={val => setFormData({ ...formData, category: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Events">Events</SelectItem>
                                <SelectItem value="Emergency">Emergency</SelectItem>
                            </SelectContent>
                        </Select>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Content"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="urgent"
                                checked={formData.urgent}
                                onChange={e => setFormData({ ...formData, urgent: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="urgent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Mark as Urgent
                            </label>
                        </div>
                        <Button onClick={handleCreate} disabled={!formData.title || !formData.content}>
                            Post Notice
                        </Button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="space-y-4">
                    {notices.map(notice => (
                        <div key={notice.id} className="flex flex-col sm:flex-row items-start justify-between p-4 bg-card border rounded-lg gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-2 py-1 rounded-full ${notice.urgent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {notice.category}
                                    </span>
                                    {notice.urgent && <span className="text-xs font-bold text-red-600">URGENT</span>}
                                </div>
                                <h3 className="font-semibold">{notice.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(notice.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
