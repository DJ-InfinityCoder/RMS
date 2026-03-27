/**
 * OCR Service — OCR.space Free API
 *
 * Uses the free public demo key "helloworld" (works without signup).
 * To remove rate-limit restrictions, set your own key:
 *   EXPO_PUBLIC_OCR_SPACE_API_KEY=your_key  (get free at https://ocr.space/ocrapi/freekey)
 *
 * No Google Vision. No native modules. Works in Expo Go.
 */

const OCR_SPACE_URL = "https://api.ocr.space/parse/image";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OcrMenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  calories: string;
  imageQuery: string; // used by image search
  imageUrl?: string; // filled in after Google Image Search
}

// ─── OCR Call ─────────────────────────────────────────────────────────────────

/**
 * Sends a base64 image to OCR.space and returns extracted text.
 * Uses the free "helloworld" demo key by default.
 */
export async function runOCR(base64: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY ?? "helloworld";

  // OCR.space requires the data-URI prefix
  const base64Image = base64.startsWith("data:")
    ? base64
    : `data:image/jpeg;base64,${base64}`;

  const body = new URLSearchParams({
    apikey: apiKey,
    base64Image,
    language: "eng",
    isOverlayRequired: "false",
    detectOrientation: "true",
    scale: "true",
    OCREngine: "2", // Engine 2 is more accurate for printed text
  });

  const res = await fetch(OCR_SPACE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`OCR.space returned HTTP ${res.status}`);
  }

  const json: any = await res.json();

  if (json.IsErroredOnProcessing) {
    throw new Error(
      json.ErrorMessage?.[0] ?? "OCR processing failed. Try again.",
    );
  }

  const text: string = json.ParsedResults?.[0]?.ParsedText ?? "";
  return text;
}

// ─── Menu Text Parser ─────────────────────────────────────────────────────────

/**
 * Converts raw OCR text into structured OcrMenuItem objects.
 *
 * Heuristic:
 *  - Lines with a price token (₹/$  + digits) are "anchor" lines.
 *  - Line BEFORE anchor = item name.
 *  - Line AFTER anchor = description.
 *  - Skip lines that are too short or look like headers/page numbers.
 */
export function parseMenuText(rawText: string): OcrMenuItem[] {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  // Matches: "₹120", "$9.99", "Rs.80", standalone numbers like "120" or "9.50"
  const PRICE_RE = /[₹$£€]?\s*\d[\d,]*(\.\d{1,2})?|Rs\.?\s*\d+/i;

  const items: OcrMenuItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!PRICE_RE.test(line)) continue;

    // ── Extract price ──
    const priceMatch = line.match(
      /[₹$£€]?\s*\d[\d,]*(\.\d{1,2})?|Rs\.?\s*\d+/i,
    );
    const rawPrice = priceMatch ? priceMatch[0].trim() : "";

    // ── Name: line before the price line ──
    const prevLine = i > 0 ? lines[i - 1] : "";
    const nameCandidate = prevLine
      .replace(/[₹$£€\d.,\/\\%@!#*=_]+/g, "")
      .trim();

    // Skip junk lines
    if (nameCandidate.length < 3) continue;
    if (
      /^(page|menu|item|price|qty|total|tax|gst|bill|sub)/i.test(nameCandidate)
    )
      continue;
    if (/^\d+$/.test(nameCandidate)) continue;

    // ── Description: line after price ──
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    const descCandidate = PRICE_RE.test(nextLine)
      ? ""
      : nextLine.replace(/[₹$£€\d.,]+/g, "").trim();

    const name = toTitleCase(nameCandidate);
    const description =
      descCandidate.length > 3
        ? toTitleCase(descCandidate)
        : `A delicious serving of ${name}`;

    items.push({
      id: `ocr_${i}_${Date.now()}`,
      name,
      description,
      price: formatPrice(rawPrice),
      calories: estimateCalories(name),
      imageQuery: `${name} food dish`,
      imageUrl: undefined,
    });
  }

  // De-duplicate by name
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (ch) => ch.toUpperCase())
    .trim();
}

function formatPrice(raw: string): string {
  const cleaned = raw.replace(/\s/g, "");
  if (!cleaned) return "—";
  if (/^[₹$£€]/.test(cleaned)) return cleaned;
  if (/^Rs/i.test(cleaned)) return cleaned.replace(/^Rs\.?/i, "₹");
  return `₹${cleaned}`;
}

function estimateCalories(name: string): string {
  const n = name.toLowerCase();
  if (/pizza/.test(n)) return "~280 kcal";
  if (/burger|smash|patty/.test(n)) return "~520 kcal";
  if (/salad|green|sprout/.test(n)) return "~90 kcal";
  if (/rice|biryani|pulao|fried rice/.test(n)) return "~350 kcal";
  if (/naan|roti|paratha|bread/.test(n)) return "~150 kcal";
  if (/cake|brownie|dessert|ice|kulfi/.test(n)) return "~310 kcal";
  if (/soup/.test(n)) return "~80 kcal";
  if (/chicken|mutton|fish|prawn/.test(n)) return "~400 kcal";
  if (/paneer|cheese/.test(n)) return "~320 kcal";
  if (/dal|lentil/.test(n)) return "~180 kcal";
  if (/coffee|tea|chai/.test(n)) return "~60 kcal";
  if (/juice|shake|smoothie/.test(n)) return "~140 kcal";
  return "~250 kcal";
}
