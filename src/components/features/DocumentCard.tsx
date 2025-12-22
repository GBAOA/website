import { FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentCardProps {
    title: string
    description?: string | null
    url: string
    category: string
    date: string
}

export function DocumentCard({ title, description, url, category, date }: DocumentCardProps) {
    return (
        <div className="flex flex-col p-6 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md capitalize">
                    {category}
                </span>
            </div>

            <h3 className="font-semibold text-lg mb-2 line-clamp-2" title={title}>
                {title}
            </h3>

            {description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                    {description}
                </p>
            )}

            <div className="mt-auto pt-4 flex items-center justify-between border-t gap-4">
                <span className="text-xs text-muted-foreground">
                    Added: {new Date(date).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm" asChild className="gap-2">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        View <ExternalLink className="w-3 h-3" />
                    </a>
                </Button>
            </div>
        </div>
    )
}
