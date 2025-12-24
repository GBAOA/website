async function testFetch() {
    const url = 'https://photos.app.goo.gl/14W8G2GxVfERVDK77';
    console.log('Testing fetch for:', url);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();
        console.log('Response Status:', response.status);

        const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) ||
            html.match(/<title>([^<]*)<\/title>/i);

        const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);

        const title = titleMatch ? titleMatch[1] : 'None';
        const image = imageMatch ? imageMatch[1] : 'None';

        console.log('Title Match:', title);
        console.log('Image Match:', image);

        if (image !== 'None') {
            // Try cleaning the URL
            const cleanImage = image.split('=')[0];
            console.log('Clean Image URL:', cleanImage);

            try {
                const cleanResp = await fetch(cleanImage);
                console.log('Clean Image Status:', cleanResp.status);
            } catch (e) {
                console.log('Failed to fetch clean image');
            }
        }

        // Look for other image candidates
        // Filter out /pw/ (private) and /a/ (avatars)
        const otherImages = html.match(/https:\/\/lh3\.googleusercontent\.com\/[^"'\s\\]+/g);
        if (otherImages) {
            console.log('Total candidates found:', otherImages.length);
            const publicCandidates = otherImages.filter(url =>
                !url.includes('/pw/') &&
                !url.includes('/a/') &&
                !url.includes('googleusercontent.com/a/')
            );
            console.log('Valid Public Candidates:', publicCandidates.length);
            publicCandidates.slice(0, 5).forEach(url => console.log('Candidate:', url));
        }

        // Check if image URL has a hostname
        if (image !== 'None') {
            try {
                const imgUrl = new URL(image);
                console.log('Image Hostname:', imgUrl.hostname);
            } catch (e) {
                console.log('Invalid Image URL');
            }
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

testFetch();
