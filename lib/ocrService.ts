/**
 * Google Cloud Vision OCR Service.
 * Requires EXPO_PUBLIC_GOOGLE_VISION_API_KEY in .env
 */

export interface OcrMenuItem {
    id: string;
    name: string;
    description: string;
    price: string;
    imageQuery: string; // keyword for Unsplash image search
}

const VISION_API_URL =
    'https://vision.googleapis.com/v1/images:annotate';

/**
 * Calls Google Cloud Vision DOCUMENT_TEXT_DETECTION on a base64 image.
 * Returns the full concatenated text extracted from the image.
 */
export async function callGoogleVisionOCR(base64: string): Promise<string> {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;

    if (!apiKey) {
        throw new Error(
            'Missing EXPO_PUBLIC_GOOGLE_VISION_API_KEY in your .env file.'
        );
    }

    const body = {
        requests: [
            {
                image: { content: base64 },
                features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
            },
        ],
    };

    const response = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Vision API error ${response.status}: ${err}`);
    }

    const json = await response.json();

    const fullText: string =
        json?.responses?.[0]?.fullTextAnnotation?.text ?? '';

    return fullText;
}

/**
 * Parses raw OCR text into structured menu items.
 * Heuristic: lines containing currency symbols (₹, $, £, €) or a number
 * with decimal are treated as price lines.  The line(s) before it = item name.
 * Following line = description snippet.
 */
export function parseMenuText(rawText: string): OcrMenuItem[] {
    const lines = rawText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const items: OcrMenuItem[] = [];

    // Regex: optional currency symbol, then digits, optional decimal
    const priceRegex = /[₹$£€]?\s*\d+(\.\d{1,2})?/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (priceRegex.test(line)) {
            // Extract price token
            const match = line.match(/[₹$£€]?\s*\d+(\.\d{1,2})?/);
            const price = match ? match[0].trim() : '';

            // Name = the line BEFORE price line (if exists and doesn't look like a header)
            const nameLine = i > 0 ? lines[i - 1] : line;
            const name = nameLine.replace(/[₹$£€\d.,]+/g, '').trim();

            // Description = line AFTER price line (if exists)
            const desc =
                i + 1 < lines.length
                    ? lines[i + 1].replace(/[₹$£€\d.,]+/g, '').trim()
                    : '';

            // Only add if name is meaningful (not a price itself)
            if (name.length > 2 && !/^\d+$/.test(name)) {
                items.push({
                    id: `ocr_${i}`,
                    name: capitalize(name),
                    description: desc.length > 2 ? capitalize(desc) : `Delicious ${capitalize(name)}`,
                    price: formatPrice(price),
                    imageQuery: name.split(' ').slice(0, 2).join(','),
                });
            }
        }
    }

    // Deduplicate by name
    const seen = new Set<string>();
    return items.filter((item) => {
        if (seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
    });
}

function capitalize(str: string): string {
    return str
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

function formatPrice(raw: string): string {
    const cleaned = raw.replace(/\s/g, '');
    if (!cleaned) return '—';
    // If it already starts with a currency symbol, return as-is
    if (/^[₹$£€]/.test(cleaned)) return cleaned;
    return `₹${cleaned}`;
}
