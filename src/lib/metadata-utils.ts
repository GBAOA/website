import { ExternalAlbum } from "@/config/gallery";

/**
 * Fetches OpenGraph metadata (title, image) from a URL.
 * Used to dynamically populate gallery album details.
 */
export async function fetchLinkMetadata(url: string): Promise<{ title?: string; image?: string }> {
    try {
        console.log(`[Metadata] Fetching metadata for ${url}`);
        const response = await fetch(url, {
            next: { revalidate: 3600 }, // Cache for 1 hour
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.warn(`[Metadata] Failed to fetch ${url}: ${response.status}`);
            return {};
        }

        const html = await response.text();

        // Simple regex to extract OG tags
        // <meta property="og:title" content="..." />
        // <meta property="og:image" content="..." />

        const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) ||
            html.match(/<title>([^<]*)<\/title>/i);

        const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);

        const title = titleMatch ? titleMatch[1] : undefined;
        let image = imageMatch ? imageMatch[1] : undefined;

        // Google Photos specific cleanup
        if (image && (url.includes('photos.app.goo.gl') || image.includes('googleusercontent.com'))) {
            // Google Photos often adds params like =w... which can break access or give low res.
            // Removing them usually gives the original full-res image which is accessible.
            image = image.split('=')[0];
        }

        console.log(`[Metadata] Extracted: ${title} | ${image ? 'Has Image' : 'No Image'}`);

        return {
            title: title || 'Untitled Album',
            image
        };
    } catch (error) {
        console.error(`[Metadata] Error parsing ${url}:`, error);
        return { title: 'External Album' };
    }
}

/**
 * Enriches the album configuration with fetched metadata.
 */
export async function getEnrichedAlbums(albums: ExternalAlbum[]): Promise<ExternalAlbum[]> {
    const enrichedPromises = albums.map(async (album) => {
        // If title and image are already set, skip fetch
        if (album.title && album.coverImage) {
            return album;
        }

        const metadata = await fetchLinkMetadata(album.url);

        return {
            ...album,
            title: album.title || metadata.title || 'Untitled Album',
            coverImage: album.coverImage || metadata.image || null
        };
    });

    return Promise.all(enrichedPromises);
}
