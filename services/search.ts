/**
 * Image Search Service — Google Custom Search API
 *
 * Fetches food images for menu items using Google Programmable Search.
 * Falls back to Unsplash if Google API keys are not configured.
 *
 * Required in .env:
 *   EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY
 *   EXPO_PUBLIC_GOOGLE_SEARCH_CX
 */

const SEARCH_URL = 'https://customsearch.googleapis.com/customsearch/v1';

/**
 * Searches for a food image using Google Custom Search.
 * Returns the URL of the best matching image, or a fallback.
 */
export async function searchFoodImage(
  query: string
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY;
  const cx = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    return getFallbackImage(query);
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      cx,
      q: `${query} food dish plated`,
      searchType: 'image',
      num: '1',
      imgSize: 'medium',
      imgType: 'photo',
      safe: 'active',
    });

    const res = await fetch(`${SEARCH_URL}?${params.toString()}`);
    if (!res.ok) return getFallbackImage(query);

    const json = await res.json();
    return json?.items?.[0]?.link ?? getFallbackImage(query);
  } catch {
    return getFallbackImage(query);
  }
}

/**
 * Batch image search — fetches images for multiple items in parallel.
 * Respects API quota by capping concurrent requests.
 */
export async function batchSearchImages(
  queries: string[],
  maxConcurrent: number = 5
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Process in batches to respect rate limits
  for (let i = 0; i < queries.length; i += maxConcurrent) {
    const batch = queries.slice(i, i + maxConcurrent);
    const batchResults = await Promise.allSettled(
      batch.map(async (query) => {
        const url = await searchFoodImage(query);
        return { query, url };
      })
    );

    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.set(result.value.query, result.value.url);
      }
    });
  }

  return results;
}

/**
 * Fallback image using Unsplash source (no API key needed).
 */
export function getFallbackImage(query: string): string {
  const keyword = encodeURIComponent(query.split(' ').slice(0, 2).join(' '));
  const seed = keyword.length * 137 + 42;
  return `https://source.unsplash.com/400x300/?food,${keyword}&sig=${seed}`;
}
