import Link from "next/link"
import Image from "next/image"
import { GALLERY_ALBUMS } from "@/config/gallery"
import { AlbumCard } from "@/components/gallery/AlbumCard"
import { getEnrichedAlbums } from "@/lib/metadata-utils"

const images = [
    { id: 1, src: "/images/pool.png", category: "Amenities", title: "Swimming Pool" },
    { id: 2, src: "/images/hall.png", category: "Amenities", title: "Club House" },
    { id: 3, src: null, placeholder: "bg-green-100", category: "Nature", title: "Central Park" },
    { id: 4, src: null, placeholder: "bg-yellow-100", category: "Events", title: "Diwali Night" },
    { id: 5, src: "/images/hero.png", category: "Interiors", title: "Entrance View" },
    { id: 6, src: null, placeholder: "bg-pink-100", category: "Amenities", title: "Gymnasium" },
]

export default async function Gallery() { // Mark as async Server Component
    // Fetch dynamic metadata for external albums
    const enrichedAlbums = await getEnrichedAlbums(GALLERY_ALBUMS);

    return (
        <div className="bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Photo Gallery</h2>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                        Glimpses of life at Golden Blossom.
                    </p>
                </div>

                {/* External Albums Section */}
                {enrichedAlbums.length > 0 && (
                    <div className="mb-20">
                        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            Folder Collections
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">{enrichedAlbums.length}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {enrichedAlbums.map((album) => (
                                <div key={album.id} className="h-full">
                                    <AlbumCard album={album} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Local Gallery Section */}
                <div>
                    <h3 className="text-2xl font-semibold mb-6">Recent Uploads</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {images.map((img) => (
                            <div key={img.id} className="group relative break-inside-avoid">
                                <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-lg relative bg-muted">
                                    {img.src ? (
                                        <Image
                                            src={img.src}
                                            alt={img.title}
                                            fill
                                            className="object-cover transition duration-300 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className={`w-full h-full ${img.placeholder}`} />
                                    )}
                                </div>
                                <div className="mt-4 flex justify-between items-center px-2">
                                    <h3 className="text-lg font-semibold">{img.title}</h3>
                                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">{img.category}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

