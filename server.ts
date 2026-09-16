import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const FLASH_MODELS = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Coach Chat API
app.post("/api/coach", async (req, res) => {
  try {
    const { messages, metrics, goal, coachTone } = req.body;
    const ai = getGeminiClient();

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
          return res.json({ text: response.text });
        }
      } catch (err: any) {
        console.warn(`Server coach chat with ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    console.error("All coach models failed:", lastError);
    return res.status(500).json({ 
      error: "AI 鋼鐵教練正在跑步機上狂奔，暫時無法回應，請確認網路連線並稍候再試。",
      details: lastError?.message 
    });
  } catch (error: any) {
    console.error("Coach API route error:", error);
    return res.status(500).json({ error: error?.message || "伺服器處理失敗" });
  }
});

// Food Image Analysis API
app.post("/api/diet/analysis", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "未提供圖片資料" });
    }

    const ai = getGeminiClient();
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
          return res.json({ text: response.text });
        }
      } catch (err: any) {
        console.warn(`Server food image analysis with ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    console.error("All food analysis models failed:", lastError);
    return res.status(500).json({ 
      error: "食物影像分析失敗，請檢查網路連線或重新上傳照片。", 
      details: lastError?.message 
    });
  } catch (error: any) {
    console.error("Diet analysis API route error:", error);
    return res.status(500).json({ error: error?.message || "伺服器處理失敗" });
  }
});

// Dietary Suggestions API
app.post("/api/diet/suggestions", async (req, res) => {
  try {
    const { metrics, goal } = req.body;
    const ai = getGeminiClient();

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
          return res.json({ text: response.text });
        }
      } catch (err: any) {
        console.warn(`Server diet suggestions with ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    console.error("All diet suggestion models failed:", lastError);
    return res.status(500).json({ 
      error: "AI 分析服務暫時無法使用，請檢查網路或稍後再試。", 
      details: lastError?.message 
    });
  } catch (error: any) {
    console.error("Diet suggestions API route error:", error);
    return res.status(500).json({ error: error?.message || "伺服器處理失敗" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
