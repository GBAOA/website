"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { DocumentCard } from "@/components/features/DocumentCard"
import { DocumentRow } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Documents() {
    const [documents, setDocuments] = useState<DocumentRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await fetch('/api/documents')
                if (!res.ok) throw new Error('Failed to fetch documents')
                const data = await res.json()
                setDocuments(data)
            } catch (error) {
                console.error("Error fetching documents:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDocuments()
    }, [])

    const categories = ['All', ...Array.from(new Set(documents.map(d => d.category)))]

    return (
        <div className="bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Documents Library</h2>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                        Access official society documents, bylaws, and guidelines.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        No documents available yet.
                    </div>
                ) : (
                    <Tabs defaultValue="All" className="mx-auto max-w-5xl">
                        <div className="flex justify-center mb-8">
                            <TabsList className="flex flex-wrap h-auto">
                                {categories.map(cat => (
                                    <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {categories.map(cat => (
                            <TabsContent key={cat} value={cat}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {documents
                                        .filter(d => cat === 'All' || d.category === cat)
                                        .map(doc => (
                                            <DocumentCard
                                                key={doc.id}
                                                title={doc.title}
                                                description={doc.description}
                                                url={doc.google_drive_url || '#'}
                                                category={doc.category}
                                                date={doc.created_at}
                                            />
                                        ))}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </div>
    )
}
