import { GoogleGenAI } from "@google/genai";

export const FLASH_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash'
];

export const getGeminiClient = (customKey?: string) => {
  const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'ironlog-pro',
      },
    },
  });
};

export async function handleCoachChat(messages: any[], metrics: any, goal: any, coachTone: string = 'taiwanese') {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("伺服器未設定 GEMINI_API_KEY 環境變數，請至 Vercel 專案 Settings -> Environment Variables 新增 GEMINI_API_KEY。");
  }

  const ai = getGeminiClient(apiKey);
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
        return response.text;
      }
    } catch (err: any) {
      console.warn(`handleCoachChat model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("所有 AI 模型均無回應");
}

export async function handleFoodAnalysis(image: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("伺服器未設定 GEMINI_API_KEY 環境變數，請至 Vercel 專案 Settings -> Environment Variables 新增 GEMINI_API_KEY。");
  }

  const ai = getGeminiClient(apiKey);
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
        return response.text;
      }
    } catch (err: any) {
      console.warn(`handleFoodAnalysis model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("食物分析失敗");
}

export async function handleDietSuggestions(metrics: any, goal: any) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("伺服器未設定 GEMINI_API_KEY 環境變數，請至 Vercel 專案 Settings -> Environment Variables 新增 GEMINI_API_KEY。");
  }

  const ai = getGeminiClient(apiKey);
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
        return response.text;
      }
    } catch (err: any) {
      console.warn(`handleDietSuggestions model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("飲食建議分析失敗");
}
