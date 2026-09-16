import { GoogleGenAI } from "@google/genai";

const FLASH_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash'
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
    console.error("[Vercel /api/diet/suggestions] Missing GEMINI_API_KEY environment variable");
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

    const { metrics, goal } = body || {};

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'ironlog-pro-vercel',
        },
      },
    });

    const prompt = `
      你是一位專業的運動營養師。請根據以下使用者的身體數據與目標，提供詳細的飲食建議與分析。
      
      使用者數據：
      - 性別：${metrics?.gender === 'male' ? '男' : '女'}
      - 年齡：${metrics?.age || 26} 歲
      - 身高：${metrics?.height || 178} cm
      - 目前體重：${metrics?.weight || 75} kg
      - 目標：${goal?.type === 'bulk' ? '增肌' : goal?.type === 'cut' ? '減脂' : '維持體態'}
      - 目標體重：${goal?.targetWeight || 75} kg
      - 活動量係數：${goal?.activityLevel || 1.55}
      
      設定的營養比例：
      - 蛋白質：${goal?.proteinRatio || '預設'}%
      - 碳水化合物：${goal?.carbRatio || '預設'}%
      - 脂肪：${goal?.fatRatio || '預設'}%
      
      請提供：
      1. 針對目前目標的總體評價 (TDEE 是否合理)。
      2. 針對設定的營養比例給予具體建議 (例如是否適合該目標，或是如何調整)。
      3. 推薦的食物來源。
      4. 每日進食時間與頻率的建議。
      5. 一個典型的每日飲食範例。
      
      請用繁體中文回答，語氣要專業且給予鼓勵，並以 Markdown 格式呈現。
    `;

    let lastError: any = null;
    for (const model of FLASH_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response.text) {
          return res.status(200).json({ text: response.text });
        }
      } catch (err: any) {
        console.warn(`[Vercel /api/diet/suggestions] Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    console.error("[Vercel /api/diet/suggestions] All models failed:", lastError);
    return res.status(500).json({
      error: "AI 分析服務暫時無法使用，請檢查網路或稍後再試。",
      details: lastError?.message
    });
  } catch (error: any) {
    console.error("[Vercel /api/diet/suggestions] Handler error:", error);
    return res.status(500).json({
      error: error?.message || "伺服器處理失敗"
    });
  }
}
