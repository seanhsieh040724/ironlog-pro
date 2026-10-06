import { GoogleGenAI } from "@google/genai";

// Official supported Gemini models
const FLASH_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash'
];

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("[Vercel /api/diet/analysis] Missing GEMINI_API_KEY environment variable");
    return res.status(500).json({
      error: "伺服器未設定 GEMINI_API_KEY 環境變數，請至 Vercel 專案 Settings -> Environment Variables 新增 GEMINI_API_KEY。"
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { image } = body || {};
    if (!image) {
      return res.status(400).json({ error: "未提供圖片資料" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'ironlog-pro-vercel',
        },
      },
    });

    const prompt = `你是一位專為手機 App 使用者設計的專業 AI 運動營養師。請分析這張食物或營養標籤照片，並提供極度精簡、快速、手機友善的熱量與營養素估算。

【格式與技術限制（非常嚴格）】
1. 只輸出純文字與簡易 Markdown，絕對不得輸出任何 HTML（如 <div>、<span>、<h1>、<p>、<table> 等）、不得輸出 inline style、CSS、JavaScript、XML、程式碼區塊或 JSON。
2. 禁止長篇食物介紹、大段營養分析、表格、健身理論或重複說明。
3. 整體回覆長度嚴格控制在約 100～180 個中文字左右，快速清晰。

【必須嚴格遵守以下格式結構輸出】：
🍱 食物：[辨識出的主要食物名稱與約略份量]

🔥 熱量：約 [數值] kcal

🥩 蛋白質：[數值] g
🍚 碳水：[數值] g
🥑 脂肪：[數值] g

⭐ 健康度：[1-10]/10

💡 建議：
[1 到 2 句簡短具體的健康吃法或健身搭配建議。若照片辨識存在不確定性，可補充：「以上為照片估算，實際數值會依份量與調味有所差異。」]`;

    let mimeType = "image/jpeg";
    let base64DataOnly = image;

    if (image.startsWith("data:")) {
      const commaIndex = image.indexOf(",");
      if (commaIndex !== -1) {
        const header = image.substring(0, commaIndex);
        base64DataOnly = image.substring(commaIndex + 1);
        const match = header.match(/^data:([^;]+);base64/);
        if (match && match[1]) {
          mimeType = match[1];
        }
      }
    }

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64DataOnly,
      },
    };

    let lastError: any = null;
    for (const model of FLASH_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [imagePart, prompt],
        });
        if (response.text) {
          return res.status(200).json({ text: response.text });
        }
      } catch (err: any) {
        console.warn(`[Vercel /api/diet/analysis] Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    console.error("[Vercel /api/diet/analysis] All models failed:", lastError);
    return res.status(500).json({
      error: "食物影像分析失敗，請檢查網路連線或重新上傳照片。",
      details: lastError?.message
    });
  } catch (error: any) {
    console.error("[Vercel /api/diet/analysis] Handler error:", error);
    return res.status(500).json({
      error: error?.message || "伺服器處理失敗"
    });
  }
}
