export interface ExternalAlbum {
    id: string;
    title?: string; // Optional: can be fetched dynamically
    description?: string;
    provider: 'google' | 'other';
    url: string;
    coverImage?: string | null; // Optional: can be fetched dynamically
    placeholderColor?: string; // Tailwind class for placeholder
}

export const GALLERY_ALBUMS: ExternalAlbum[] = [
    {
        id: 'external-1',
        provider: 'google',
        url: 'https://photos.app.goo.gl/14W8G2GxVfERVDK77',
        placeholderColor: 'bg-blue-100',
        description: 'Photos from our recent community gatherings and celebrations.'
    },
    // Add more albums here
];
