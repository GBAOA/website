"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ExternalLink, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DocumentRow } from "@/lib/supabase"

export default function AdminDocuments() {
    const [documents, setDocuments] = useState<DocumentRow[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        category: "Bylaws",
        google_drive_url: "",
        description: ""
    })

    const fetchDocuments = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/documents')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setDocuments(data)
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this document link?")) return
        try {
            const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setDocuments(documents.filter(d => d.id !== id))
            }
        } catch (error) {
            console.error("Error deleting:", error)
        }
    }

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setIsCreating(false)
                setFormData({ title: "", category: "Bylaws", google_drive_url: "", description: "" })
                fetchDocuments()
            }
        } catch (error) {
            console.error("Error creating:", error)
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Manage Documents</h1>
                <Button onClick={() => setIsCreating(!isCreating)} gap-2>
                    {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isCreating ? "Cancel" : "Add Document"}
                </Button>
            </div>

            {isCreating && (
                <div className="bg-card p-6 rounded-xl border shadow-sm mb-8 space-y-4">
                    <h3 className="font-semibold text-lg">New Document Link</h3>
                    <div className="grid gap-4">
                        <Input
                            placeholder="Document Title"
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
                                <SelectItem value="Bylaws">Bylaws</SelectItem>
                                <SelectItem value="Rules">Rules</SelectItem>
                                <SelectItem value="SOPs">SOPs</SelectItem>
                                <SelectItem value="Circulars">Circulars</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Google Drive Share URL"
                            value={formData.google_drive_url}
                            onChange={e => setFormData({ ...formData, google_drive_url: e.target.value })}
                        />
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Description (optional)"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                        <Button onClick={handleCreate} disabled={!formData.title || !formData.google_drive_url}>
                            Add Document
                        </Button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="space-y-4">
                    {documents.map(doc => (
                        <div key={doc.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card border rounded-lg gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                                        {doc.category}
                                    </span>
                                </div>
                                <h3 className="font-semibold flex items-center gap-2">
                                    {doc.title}
                                    <a href={doc.google_drive_url || '#'} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </h3>
                                {doc.description && <p className="text-sm text-muted-foreground">{doc.description}</p>}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
