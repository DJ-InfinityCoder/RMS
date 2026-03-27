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

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface StructuredMenu {
  restaurantName: string;
  sections: MenuSection[];
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a precision menu parser AI. You receive raw OCR text from a restaurant menu photo and must return ONLY valid JSON.

Your tasks:
1. FIX all OCR errors, typos, and garbled characters
2. IDENTIFY menu sections (Starters, Appetizers, Main Course, Soups, Salads, Drinks, Beverages, Desserts, Sides, Combos, Specials, etc.)
3. EXTRACT each item's name, price, and description
4. If no description is visible, generate a brief appetizing one (1 sentence max)
5. Normalize prices (keep original currency symbol, format as "₹120" or "$9.99")
6. If you cannot determine the restaurant name, use "Menu"

RETURN FORMAT (strict JSON, no markdown, no code fences):
{
  "restaurantName": "string",
  "sections": [
    {
      "title": "Section Name",
      "items": [
        {
          "id": "unique_id",
          "name": "Item Name",
          "description": "Brief description",
          "price": "₹120",
          "category": "Section Name"
        }
      ]
    }
  ]
}

RULES:
- Return ONLY the JSON object, nothing else
- Every item MUST have name and price
- Group items into logical sections even if the menu doesn't have clear headers
- If unsure about a section, use "Specials"
- Generate IDs as section_index (e.g., "starter_1", "main_3")
- Keep items in the order they appear`;

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
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('Invalid menu structure');
    }

    // Ensure all items have IDs
    parsed.sections.forEach((section, si) => {
      section.items.forEach((item, ii) => {
        if (!item.id) {
          item.id = `${section.title.toLowerCase().replace(/\s+/g, '_')}_${ii + 1}`;
        }
        item.category = section.title;
      });
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

  const PRICE_RE = /[₹$£€]?\s*\d[\d,]*(\.\d{1,2})?|Rs\.?\s*\d+/i;
  const items: MenuItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!PRICE_RE.test(line)) continue;

    const priceMatch = line.match(PRICE_RE);
    const rawPrice = priceMatch ? priceMatch[0].trim() : '';

    const prevLine = i > 0 ? lines[i - 1] : '';
    const nameCandidate = prevLine.replace(/[₹$£€\d.,/\\%@!#*=_]+/g, '').trim();

    if (nameCandidate.length < 3) continue;
    if (/^(page|menu|item|price|qty|total|tax|gst|bill|sub)/i.test(nameCandidate)) continue;

    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    const descCandidate = PRICE_RE.test(nextLine)
      ? ''
      : nextLine.replace(/[₹$£€\d.,]+/g, '').trim();

    const name = toTitleCase(nameCandidate);
    items.push({
      id: `item_${items.length + 1}`,
      name,
      description: descCandidate.length > 3
        ? toTitleCase(descCandidate)
        : `A delicious serving of ${name}`,
      price: formatPrice(rawPrice),
      category: 'Menu Items',
    });
  }

  return {
    restaurantName: 'Scanned Menu',
    sections: [{ title: 'Menu Items', items }],
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
