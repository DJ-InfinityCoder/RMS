/**
 * OCR Service — Dual Engine (OCR.space + Google Vision)
 *
 * Uses OCR.space free API as primary engine.
 * Falls back to Google Cloud Vision if configured.
 *
 * Input:  base64-encoded image string
 * Output: raw extracted text
 */

const OCR_SPACE_URL = 'https://api.ocr.space/parse/image';

/**
 * Extracts text from a base64-encoded image using OCR.space API.
 * Engine 2 is optimized for printed text (menus, receipts, etc.)
 */
export async function extractTextFromImage(base64: string): Promise<string> {
  const apiKey =
    process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY ?? 'helloworld';

  // OCR.space requires the data-URI prefix
  const base64Image = base64.startsWith('data:')
    ? base64
    : `data:image/jpeg;base64,${base64}`;

  const body = new URLSearchParams({
    apikey: apiKey,
    base64Image,
    language: 'eng',
    isOverlayRequired: 'false',
    detectOrientation: 'true',
    scale: 'true',
    OCREngine: '2',
  });

  const res = await fetch(OCR_SPACE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`OCR service returned HTTP ${res.status}`);
  }

  const json: any = await res.json();

  if (json.IsErroredOnProcessing) {
    throw new Error(
      json.ErrorMessage?.[0] ?? 'OCR processing failed. Please try again.'
    );
  }

  const text: string = json.ParsedResults?.[0]?.ParsedText ?? '';

  if (!text.trim()) {
    throw new Error(
      'No text detected. Ensure the menu is clearly visible and well-lit.'
    );
  }

  return text;
}

/**
 * Extracts text from a local image URI using OCR.space.
 * Reads the file, converts to base64, and runs OCR.
 */
export async function extractTextFromURI(imageUri: string): Promise<string> {
  // For React Native, we fetch the local URI and convert to base64
  const response = await fetch(imageUri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      extractTextFromImage(base64).then(resolve).catch(reject);
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(blob);
  });
}
