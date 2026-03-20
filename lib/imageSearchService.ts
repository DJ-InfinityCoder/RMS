/**
 * Google Custom Search — Image Search
 *
 * Required in .env:
 *   EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY=AIza...   (Google API key, Custom Search enabled)
 *   EXPO_PUBLIC_GOOGLE_SEARCH_CX=...            (Programmable Search Engine ID)
 *
 * Setup:
 *  1. Go to https://programmablesearchengine.google.com and create a search engine
 *     set to search the entire web.
 *  2. Enable "Image Search" in the search engine settings.
 *  3. Get an API key from https://console.cloud.google.com with "Custom Search API" enabled.
 *
 * Falls back to Unsplash if keys are not configured.
 */

const SEARCH_URL = 'https://customsearch.googleapis.com/customsearch/v1';

/**
 * Searches Google Images for a food query.
 * Returns the URL of the first image result, or null on failure.
 */
export async function searchFoodImage(query: string): Promise<string | null> {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY;
    const cx = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_CX;

    // Fall back to Unsplash if not configured
    if (!apiKey || !cx || apiKey === 'AIza...' || cx === 'your-cx-id') {
        return getFallbackImage(query);
    }

    try {
        const params = new URLSearchParams({
            key: apiKey,
            cx,
            q: `${query} food dish`,
            searchType: 'image',
            num: '1',
            imgSize: 'medium',
            imgType: 'photo',
            safe: 'active',
        });

        const res = await fetch(`${SEARCH_URL}?${params.toString()}`);
        if (!res.ok) return getFallbackImage(query);

        const json = await res.json();
        const imageUrl: string | null = json?.items?.[0]?.link ?? null;
        return imageUrl ?? getFallbackImage(query);
    } catch {
        return getFallbackImage(query);
    }
}

/**
 * Fallback: Unsplash random food image matching the query keyword.
 * Free, no API key required.
 */
export function getFallbackImage(query: string): string {
    const keyword = encodeURIComponent(query.split(' ').slice(0, 2).join(' '));
    // Using a random seed per query so we get deterministic but varied images
    const seed = keyword.length * 137 + 42;
    return `https://source.unsplash.com/400x300/?food,${keyword}&sig=${seed}`;
}
