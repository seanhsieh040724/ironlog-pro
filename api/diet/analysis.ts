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

    const prompt = `
      你是一位專業的AI運動營養師與食物熱量估算專家。請分析這張食物照片並提供詳細的熱量與營養素估算。
      
      請提供以下資訊（以 Markdown 格式、繁體中文回答，使用精美且易讀的排版）：
      1. **估算總熱量**（標示為 KCAL，並用醒目大字體或色塊表示）。
      2. **主要食物名稱**與估計重量（例如：雞胸肉 150g）。
      3. **巨量營養素估算**（蛋白質克數、碳水化合物克數、脂肪克數，可用表格或條列表示）。
      4. **健康度評分**（1-10分，並簡單說明理由）。
      5. **給使用者的健康吃法調整或健身搭配建議**（例如：建議多補充膳食纖維，或適合在重訓後食用）。
    `;

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
