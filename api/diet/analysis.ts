import { handleDietAnalysis } from "../../server/aiHandlers";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const result = await handleDietAnalysis(body);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Vercel Diet Analysis API error:", err);
    res.status(500).json({ 
      error: err?.message || "食物影像分析失敗，請檢查網路連線或重新上傳照片。" 
    });
  }
}
