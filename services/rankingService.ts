/**
 * Ranking Service
 *
 * Handles personalized ranking of restaurants/vendors based on
 * the user's favourite cuisines. Items matching user preferences
 * are boosted to the top while maintaining relative ordering
 * within each group.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Rankable {
  id: string;
  cuisine?: string[];       // For restaurants
  tags?: string[];           // For vendors
  food?: string[];           // For vendors
  [key: string]: any;
}

// ─── Ranking Logic ───────────────────────────────────────────────────────────

/**
 * Ranks a list of restaurants by how many of the user's favourite
 * cuisines they serve. Restaurants serving more favourites appear first.
 * 
 * @param restaurants - The restaurant list to rank
 * @param favouriteCuisines - User's favourite cuisine list
 * @returns Sorted restaurant list (favourite-matching first)
 */
export const rankRestaurantsByCuisine = <T extends Rankable>(
  restaurants: T[],
  favouriteCuisines: string[],
): T[] => {
  if (!favouriteCuisines.length) return restaurants;

  const lowerFavs = favouriteCuisines.map(c => c.toLowerCase().trim());

  return [...restaurants].sort((a, b) => {
    const aScore = getCuisineScore(a.cuisine || [], lowerFavs);
    const bScore = getCuisineScore(b.cuisine || [], lowerFavs);
    return bScore - aScore; // Higher score first
  });
};

/**
 * Ranks vendors by matching their tags/food items against user's
 * favourite cuisines. Vendors whose tags or food items overlap more
 * with user preferences rank higher.
 */
export const rankVendorsByCuisine = <T extends Rankable>(
  vendors: T[],
  favouriteCuisines: string[],
): T[] => {
  if (!favouriteCuisines.length) return vendors;

  const lowerFavs = favouriteCuisines.map(c => c.toLowerCase().trim());

  return [...vendors].sort((a, b) => {
    const aTags = [...(a.tags || []), ...(a.food || [])];
    const bTags = [...(b.tags || []), ...(b.food || [])];
    const aScore = getTagScore(aTags, lowerFavs);
    const bScore = getTagScore(bTags, lowerFavs);
    return bScore - aScore;
  });
};

// ─── Scoring Helpers ─────────────────────────────────────────────────────────

const getCuisineScore = (cuisines: string[], favourites: string[]): number => {
  let score = 0;
  for (const cuisine of cuisines) {
    const lower = cuisine.toLowerCase().trim();
    if (favourites.some(fav => lower.includes(fav) || fav.includes(lower))) {
      score += 1;
    }
  }
  return score;
};

const getTagScore = (tags: string[], favourites: string[]): number => {
  let score = 0;
  for (const tag of tags) {
    const lower = tag.toLowerCase().trim();
    if (favourites.some(fav => lower.includes(fav) || fav.includes(lower))) {
      score += 1;
    }
  }
  return score;
};
