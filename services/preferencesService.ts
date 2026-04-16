/**
 * Preferences Service
 * 
 * Handles allergy detection (string matching between user allergies
 * and dish ingredients) and preference caching.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AllergyMatchResult {
  hasAllergen: boolean;
  matchedIngredients: string[];
}

export interface IngredientItem {
  quantity?: string;
  unit?: string;
  ingredient?: { name: string };
}

// ─── Allergy Tag Canonicalization ────────────────────────────────────────────
// Maps common allergy names to ingredient keyword sets for broader matching.

const ALLERGY_TAG_MAP: Record<string, string[]> = {
  dairy: ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'paneer', 'curd', 'ghee', 'whey', 'casein', 'lactose'],
  nuts: ['almond', 'cashew', 'walnut', 'pistachio', 'peanut', 'pecan', 'hazelnut', 'macadamia', 'nut'],
  gluten: ['wheat', 'flour', 'bread', 'pasta', 'maida', 'semolina', 'barley', 'rye', 'oat', 'gluten'],
  eggs: ['egg', 'eggs', 'mayo', 'mayonnaise', 'meringue'],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'tempeh', 'miso', 'soy sauce'],
  shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'shellfish'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'anchovy', 'sardine', 'mackerel', 'tilapia'],
  wheat: ['wheat', 'flour', 'bread', 'maida', 'semolina', 'atta'],
  peanuts: ['peanut', 'groundnut'],
};

// ─── In-Memory Preference Cache ─────────────────────────────────────────────

interface CachedPreferences {
  allergies: string[];
  favouriteCuisines: string[];
  dietary: string;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedPrefs: CachedPreferences | null = null;

export const setCachedPreferences = (prefs: Omit<CachedPreferences, 'timestamp'>) => {
  cachedPrefs = { ...prefs, timestamp: Date.now() };
};

export const getCachedPreferences = (): Omit<CachedPreferences, 'timestamp'> | null => {
  if (!cachedPrefs) return null;
  if (Date.now() - cachedPrefs.timestamp > CACHE_TTL) {
    cachedPrefs = null;
    return null;
  }
  return {
    allergies: cachedPrefs.allergies,
    favouriteCuisines: cachedPrefs.favouriteCuisines,
    dietary: cachedPrefs.dietary,
  };
};

export const clearPreferenceCache = () => {
  cachedPrefs = null;
};

// ─── Core Allergy Detection ─────────────────────────────────────────────────

/**
 * Checks a dish's ingredients against the user's allergies.
 * Uses tag-based matching for better coverage (e.g., "dairy" matches "cheese", "butter").
 * Falls back to substring matching for unrecognized allergy names.
 */
export const detectAllergens = (
  userAllergies: string[],
  dishIngredients: IngredientItem[],
): AllergyMatchResult => {
  if (!userAllergies.length || !dishIngredients.length) {
    return { hasAllergen: false, matchedIngredients: [] };
  }

  const matched = new Set<string>();

  // Build a set of keywords to match against
  const allergyKeywords: string[] = [];
  for (const allergy of userAllergies) {
    const lower = allergy.toLowerCase().trim();
    const tagKeywords = ALLERGY_TAG_MAP[lower];
    if (tagKeywords) {
      allergyKeywords.push(...tagKeywords);
    } else {
      // Fallback: use the allergy name directly as a keyword
      allergyKeywords.push(lower);
    }
  }

  for (const ing of dishIngredients) {
    const ingredientName = (ing.ingredient?.name || '').toLowerCase().trim();
    if (!ingredientName) continue;

    for (const keyword of allergyKeywords) {
      if (ingredientName.includes(keyword) || keyword.includes(ingredientName)) {
        matched.add(ing.ingredient?.name || ingredientName);
        break;
      }
    }
  }

  return {
    hasAllergen: matched.size > 0,
    matchedIngredients: Array.from(matched),
  };
};

/**
 * Check if a single ingredient name matches any user allergies.
 * Useful for highlighting individual ingredients in the dish detail modal.
 */
export const isIngredientAllergen = (
  ingredientName: string,
  userAllergies: string[],
): boolean => {
  if (!ingredientName || !userAllergies.length) return false;

  const lower = ingredientName.toLowerCase().trim();

  for (const allergy of userAllergies) {
    const allergyLower = allergy.toLowerCase().trim();
    const tagKeywords = ALLERGY_TAG_MAP[allergyLower];

    if (tagKeywords) {
      for (const keyword of tagKeywords) {
        if (lower.includes(keyword) || keyword.includes(lower)) {
          return true;
        }
      }
    } else {
      if (lower.includes(allergyLower) || allergyLower.includes(lower)) {
        return true;
      }
    }
  }

  return false;
};
