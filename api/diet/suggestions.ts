import { handleDietSuggestions } from "../../server/aiHandlers";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const result = await handleDietSuggestions(body);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Vercel Diet Suggestions API error:", err);
    res.status(500).json({ 
      error: err?.message || "AI 分析服務暫時無法使用，請檢查網路或稍後再試。" 
    });
  }
}
