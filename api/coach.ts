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
    console.error("[Vercel /api/coach] Missing GEMINI_API_KEY environment variable");
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

    const { messages, metrics, goal, coachTone } = body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "未提供對話訊息內容 (messages)" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'ironlog-pro-vercel',
        },
      },
    });

    const toneInstruction = coachTone === 'hongkong' || coachTone === '港式教練'
      ? `你是一位非常專業、講話極具香港特色且熱血激昂的香港健美教練（風格：偶爾穿插道地港式健身俚語如「師兄/師姐」、「頂住呀」、「爆肌」、「唔好偷懶」、「操爆佢」、「食足蛋白質」、「好Firm」、「Chur到盡」，熱情又霸氣，字面以繁體中文標準字為主方便閱讀）。`
      : `你是一位親切熱情、正能量滿點、專業度極高的台灣健身教練（風格：語氣溫暖鼓勵、常用台式激勵用語如「水喔」、「很讚」、「加油」、「核心收緊」、「不要放掉」、「練起來」、「吃好吃滿」、「超棒的」，給予學員滿滿信心與科學建議）。`;

    const systemInstruction = `
      你是一位頂級運動健身教練與專業運動營養學家，名叫「IronLog AI 鋼鐵教練」。
      你正在與一位你的專屬學員對話。
      ${toneInstruction}
      
      學員的當前身體數據：
      - 性別：${metrics?.gender === 'male' ? '男' : '女'}
      - 年齡：${metrics?.age || 26} 歲
      - 身高：${metrics?.height || 178} cm
      - 目前體重：${metrics?.weight || 75} kg
      - 目標：${goal?.type === 'bulk' ? '增肌' : goal?.type === 'cut' ? '減脂' : '維持體態'}
      - 目標體重：${goal?.targetWeight || 75} kg
      - 活動量：${goal?.activityLevel || 1.55}
      
      回答指南：
      1. 保持專業、熱情、激勵人心，多給予學員訓練和飲食上的心態引導與科學依據。
      2. 學員詢問課表規劃、動作要領、增肌減脂、睡眠修復或健身補劑時，提供極其具體、可操作的科學建議。
      3. 隨時結合學員自身的身體數據，在適當時候提及他們的目標（例如：『既然你的目標是從 ${metrics?.weight || 75}kg 瘦到 ${goal?.targetWeight || 70}kg，那麼...』）。
      4. 請使用繁體中文回答，字句流暢自然。使用 Markdown 格式加粗重點。
    `;

    let lastError: any = null;
    for (const model of FLASH_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: messages,
          config: {
            systemInstruction,
            maxOutputTokens: 2048,
          },
        });
        if (response.text) {
          return res.status(200).json({ text: response.text });
        }
      } catch (err: any) {
        console.warn(`[Vercel /api/coach] Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    console.error("[Vercel /api/coach] All models failed:", lastError);
    return res.status(500).json({
      error: "AI 鋼鐵教練正在跑步機上狂奔，暫時無法回應，請確認網路連線並稍候再試。",
      details: lastError?.message
    });
  } catch (error: any) {
    console.error("[Vercel /api/coach] Handler error:", error);
    return res.status(500).json({
      error: error?.message || "伺服器處理失敗"
    });
  }
}
