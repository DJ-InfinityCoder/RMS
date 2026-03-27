/**
 * Snap Menu Pipeline
 *
 * Orchestrates the full menu scanning workflow:
 *   1. OCR → Extract raw text from image
 *   2. LLM → Parse text into structured menu JSON
 *   3. Search → Fetch food images for each item
 *
 * Designed for parallel execution where possible.
 */

import { extractTextFromImage } from './ocrApi';
import { parseMenuWithLLM, parseMenuFallback, StructuredMenu, MenuItem } from './llmApi';
import { batchSearchImages, getFallbackImage } from './searchApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PipelineStage =
  | 'capturing'
  | 'ocr'
  | 'ai_parsing'
  | 'fetching_images'
  | 'complete'
  | 'error';

export interface PipelineProgress {
  stage: PipelineStage;
  message: string;
  progress: number; // 0-100
}

export interface PipelineResult {
  menu: StructuredMenu;
  rawOcrText: string;
  processingTimeMs: number;
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

/**
 * Runs the complete menu scanning pipeline.
 *
 * @param base64Image  Base64-encoded image data
 * @param onProgress   Callback for progress updates
 * @returns            Structured menu with images
 */
export async function runMenuPipeline(
  base64Image: string,
  onProgress?: (progress: PipelineProgress) => void
): Promise<PipelineResult> {
  const startTime = Date.now();

  try {
    // ── Stage 1: OCR ──
    onProgress?.({
      stage: 'ocr',
      message: 'Reading menu text...',
      progress: 15,
    });

    const rawText = await extractTextFromImage(base64Image);

    if (!rawText.trim()) {
      throw new Error('No text found in image. Please try a clearer photo.');
    }

    // ── Stage 2: LLM Parsing ──
    onProgress?.({
      stage: 'ai_parsing',
      message: 'AI is structuring your menu...',
      progress: 40,
    });

    let menu: StructuredMenu;
    try {
      menu = await parseMenuWithLLM(rawText);
    } catch (llmError) {
      console.warn('LLM parsing failed, using fallback:', llmError);
      menu = parseMenuFallback(rawText);
    }

    // Validate we got items
    const totalItems = menu.sections.reduce(
      (sum, s) => sum + s.items.length,
      0
    );

    if (totalItems === 0) {
      throw new Error(
        'Could not extract menu items. Try capturing a clearer photo.'
      );
    }

    // ── Stage 3: Image Search (parallel) ──
    onProgress?.({
      stage: 'fetching_images',
      message: `Finding images for ${totalItems} items...`,
      progress: 70,
    });

    // Collect all item names for batch search
    const allItems: MenuItem[] = [];
    menu.sections.forEach((section) => {
      section.items.forEach((item) => allItems.push(item));
    });

    const queries = allItems.map((item) => item.name);
    const imageMap = await batchSearchImages(queries, 5);

    // Attach images to items
    menu.sections.forEach((section) => {
      section.items.forEach((item) => {
        (item as any).imageUrl =
          imageMap.get(item.name) ?? getFallbackImage(item.name);
      });
    });

    // ── Complete ──
    onProgress?.({
      stage: 'complete',
      message: 'Menu ready!',
      progress: 100,
    });

    return {
      menu,
      rawOcrText: rawText,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error: any) {
    onProgress?.({
      stage: 'error',
      message: error.message ?? 'Something went wrong',
      progress: 0,
    });
    throw error;
  }
}
