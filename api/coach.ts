import { handleCoachChat } from "../server/aiHandlers";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const result = await handleCoachChat(body);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Vercel Coach API error:", err);
    res.status(500).json({ 
      error: err?.message || "AI 鋼鐵教練正在跑步機上狂奔，暫時無法回應，請確認網路連線並稍候再試。" 
    });
  }
}
