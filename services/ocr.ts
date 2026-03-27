import { File } from "expo-file-system";

export async function extractTextFromImage(uri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY ?? "helloworld";

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: "menu.jpg",
    type: "image/jpeg",
  } as any);

  formData.append("language", "eng");
  formData.append("OCREngine", "2");

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: {
      apikey: apiKey,
    },
    body: formData,
  });

  const json = await res.json();

  if (json.IsErroredOnProcessing) {
    throw new Error(json.ErrorMessage?.[0] || "OCR failed");
  }

  return json.ParsedResults?.[0]?.ParsedText?.trim() || "";
}