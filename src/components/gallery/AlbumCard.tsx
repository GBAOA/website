import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Image as ImageIcon } from "lucide-react"
import { ExternalAlbum } from "@/config/gallery"
import { Button } from "@/components/ui/button"

interface AlbumCardProps {
    album: ExternalAlbum
}

export function AlbumCard({ album }: AlbumCardProps) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md h-full">
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {album.coverImage ? (
                    <Image
                        src={album.coverImage}
                        alt={album.title || 'Album cover'}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className={`flex h-full w-full items-center justify-center ${album.placeholderColor || 'bg-muted'}`}>
                        <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold tracking-tight text-lg">{album.title}</h3>
                    {album.provider === 'google' && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            Google Photos
                        </span>
                    )}
                </div>

                {album.description && (
                    <p className="mt-2 text-sm text-muted-foreground flex-1 line-clamp-2">
                        {album.description}
                    </p>
                )}

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">External Album</span>
                    <Button asChild variant="secondary" size="sm" className="gap-2">
                        <Link href={album.url} target="_blank" rel="noopener noreferrer">
                            View Album <ExternalLink className="h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
