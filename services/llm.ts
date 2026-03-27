/**
 * LLM Service — Groq API
 *
 * Takes raw OCR text and uses Groq's LLM to:
 *  - Fix OCR errors & typos
 *  - Extract structured menu sections
 *  - Return clean JSON with items, prices, descriptions
 *
 * Model: openai/gpt-oss-120b via Groq inference
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Ingredient {
  name: string;
  quantity?: string;
  description?: string;
}

export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  cooking_method?: string;
  calories?: number;
  price?: number;
  recommended_for?: string;
  image_url?: string;
  is_available: boolean;
  ingredients: Ingredient[];
}

export interface StructuredMenu {
  restaurantName: string;
  dishes: Dish[];
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior product designer and culinary AI. You receive raw OCR text from a restaurant menu photo and must return a structured list of dishes.

Your tasks:
1. FIX all OCR errors, typos, and garbled characters.
2. EXTRACT each dish's name, price, and description. 
3. ENRICH data: Use your knowledge to infer realistic Ingredients (with quantities and flavor descriptions), Cooking Method, and a rough Calorie estimate.
4. NORMALIZE: Clean dish names (e.g., "Margarita Pizzza" -> "Margherita Pizza").
5. EXTRACT ONLY important and relevant information. Do NOT hallucinate unknown values. 

RETURN FORMAT (strict JSON, no markdown, no code fences):
{
  "restaurantName": "string",
  "dishes": [
    {
      "id": "item_1",
      "restaurant_id": "current",
      "name": "Margherita Pizza",
      "description": "Classic Italian pizza with tomato and mozzarella",
      "cooking_method": "Wood-fired oven",
      "calories": 800,
      "price": 450,
      "recommended_for": "Lunch, Dinner", 
      "image_url": null,
      "is_available": true,
      "ingredients": [
        {
          "name": "Buffalo Mozzarella",
          "quantity": "100g",
          "description": "adds creaminess"
        },
        {
          "name": "Tomato Basil Sauce",
          "quantity": "50ml",
          "description": "tangy and fragrant"
        }
      ]
    }
  ]
}

RULES:
- If a price exists as "₹120", return 120 (number).
- Ingredients must be realistic for the specific dish.
- If missing data (e.g. price not found), return null for that field. 
- Return ONLY the JSON object.`;

// ─── LLM Call ─────────────────────────────────────────────────────────────────

/**
 * Sends OCR text to Groq LLM and returns a structured menu.
 * Uses streaming internally but returns the complete result.
 */
export async function parseMenuWithLLM(
  ocrText: string
): Promise<StructuredMenu> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Groq API key not configured. Set EXPO_PUBLIC_GROQ_API_KEY in .env');
  }

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Parse this restaurant menu OCR text into structured JSON:\n\n${ocrText}`,
        },
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.3,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: false,
      stop: null,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('Groq API error:', errBody);
    throw new Error(`Groq API returned HTTP ${res.status}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from LLM');
  }

  // Parse the JSON response (strip any accidental markdown fences)
  const cleaned = content
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    const parsed: StructuredMenu = JSON.parse(cleaned);

    // Validate structure
    if (!parsed.dishes || !Array.isArray(parsed.dishes)) {
      throw new Error('Invalid menu structure: Missing dishes array');
    }

    // Ensure all items have IDs
    parsed.dishes.forEach((dish, di) => {
      if (!dish.id) {
        dish.id = `dish_${di + 1}`;
      }
      if (!dish.restaurant_id) {
        dish.restaurant_id = 'scanned';
      }
    });

    return parsed;
  } catch (parseErr) {
    console.error('Failed to parse LLM response:', cleaned);
    // Attempt fallback: try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse menu structure from AI response');
  }
}

/**
 * Fallback parser: converts raw OCR text into structured menu
 * without LLM (heuristic-based). Used when LLM is unavailable.
 */
export function parseMenuFallback(rawText: string): StructuredMenu {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  const PRICE_RE = /[₹$£€]?\s*(\d[\d,]*(\.\d{1,2})?)|Rs\.?\s*(\d+)/i;
  const dishes: Dish[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!PRICE_RE.test(line)) continue;

    const priceMatch = line.match(PRICE_RE);
    const rawPrice = priceMatch ? priceMatch[0].replace(/[^0-9.]/g, '') : null;
    const price = rawPrice ? parseFloat(rawPrice) : null;

    const prevLine = i > 0 ? lines[i - 1] : '';
    const nameCandidate = prevLine.replace(/[₹$£€\d.,/\\%@!#*=_]+/g, '').trim();

    if (nameCandidate.length < 3) continue;
    if (/^(page|menu|item|price|qty|total|tax|gst|bill|sub)/i.test(nameCandidate)) continue;

    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    const descCandidate = PRICE_RE.test(nextLine)
      ? ''
      : nextLine.replace(/[₹$£€\d.,]+/g, '').trim();

    const name = toTitleCase(nameCandidate);
    dishes.push({
      id: `dish_${dishes.length + 1}`,
      restaurant_id: 'scanned',
      name,
      description: descCandidate.length > 3
        ? toTitleCase(descCandidate)
        : `A delicious selection of gourmet ${name}`,
      price: price || undefined,
      is_available: true,
      ingredients: [],
    });
  }

  return {
    restaurantName: 'Scanned Menu',
    dishes,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (ch) => ch.toUpperCase())
    .trim();
}

function formatPrice(raw: string): string {
  const cleaned = raw.replace(/\s/g, '');
  if (!cleaned) return '—';
  if (/^[₹$£€]/.test(cleaned)) return cleaned;
  if (/^Rs/i.test(cleaned)) return cleaned.replace(/^Rs\.?/i, '₹');
  return `₹${cleaned}`;
}
