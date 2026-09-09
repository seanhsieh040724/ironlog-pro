import { GoogleGenAI } from "@google/genai";
import { BodyMetric, UserGoal } from "../types";

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

// 採用目前支援的多模態 Flash 模型清單，優先使用極速穩定的 gemini-3.6-flash，遇高負載自動切換備援模型
const FLASH_MODELS = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

export const generateDietarySuggestions = async (metrics: BodyMetric, goal: UserGoal) => {
  const ai = getGeminiClient();
  
  const prompt = `
    你是一位專業的運動營養師。請根據以下使用者的身體數據與目標，提供詳細的飲食建議與分析。
    
    使用者數據：
    - 性別：${metrics.gender === 'male' ? '男' : '女'}
    - 年齡：${metrics.age} 歲
    - 身高：${metrics.height} cm
    - 目前體重：${metrics.weight} kg
    - 目標：${goal.type === 'bulk' ? '增肌' : goal.type === 'cut' ? '減脂' : '維持體態'}
    - 目標體重：${goal.targetWeight} kg
    - 活動量係數：${goal.activityLevel}
    
    設定的營養比例：
    - 蛋白質：${goal.proteinRatio || '預設'}%
    - 碳水化合物：${goal.carbRatio || '預設'}%
    - 脂肪：${goal.fatRatio || '預設'}%
    
    請提供：
    1. 針對目前目標的總體評價 (TDEE 是否合理)。
    2. 針對設定的營養比例給予具體建議 (例如是否適合該目標，或是如何調整)。
    3. 推薦的食物來源。
    4. 每日進食時間與頻率的建議。
    5. 一個典型的每日飲食範例。
    
    請用繁體中文回答，語氣要專業且給予鼓勵，並以 Markdown 格式呈現。
  `;

  for (const model of FLASH_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      if (response.text) {
        return response.text;
      }
    } catch (error) {
      console.warn(`Dietary suggestion with ${model} failed, trying next:`, error);
    }
  }

  return "AI 分析服務暫時無法使用，請檢查網路或稍後再試。";
};

export const analyzeFoodImage = async (base64Image: string) => {
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
  let base64DataOnly = base64Image;

  if (base64Image.startsWith("data:")) {
    const commaIndex = base64Image.indexOf(",");
    if (commaIndex !== -1) {
      const header = base64Image.substring(0, commaIndex);
      base64DataOnly = base64Image.substring(commaIndex + 1);
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
    } catch (error: any) {
      console.warn(`Gemini food image analysis with ${model} failed, trying fallback:`, error?.message || error);
      lastError = error;
    }
  }

  console.error("Gemini Image Analysis Error (all models failed):", lastError);
  return "食物影像分析失敗，請檢查網路連線或重新上傳照片。";
};

export const chatWithCoach = async (
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[], 
  metrics: BodyMetric, 
  goal: UserGoal,
  coachTone: string = 'taiwanese'
) => {
  const ai = getGeminiClient();
  
  const toneInstruction = coachTone === 'hongkong' || coachTone === '港式教練'
    ? `你是一位非常專業、講話極具香港特色且熱血激昂的香港健美教練（風格：偶爾穿插道地港式健身俚語如「師兄/師姐」、「頂住呀」、「爆肌」、「唔好偷懶」、「操爆佢」、「食足蛋白質」、「好Firm」、「Chur到盡」，熱情又霸氣，字面以繁體中文標準字為主方便閱讀）。`
    : `你是一位親切熱情、正能量滿點、專業度極高的台灣健身教練（風格：語氣溫暖鼓勵、常用台式激勵用語如「水喔」、「很讚」、「加油」、「核心收緊」、「不要放掉」、「練起來」、「吃好吃滿」、「超棒的」，給予學員滿滿信心與科學建議）。`;

  const systemInstruction = `
    你是一位頂級運動健身教練與專業運動營養學家，名叫「IronLog AI 鋼鐵教練」。
    你正在與一位你的專屬學員對話。
    ${toneInstruction}
    
    學員的當前身體數據：
    - 性別：${metrics.gender === 'male' ? '男' : '女'}
    - 年齡：${metrics.age} 歲
    - 身高：${metrics.height} cm
    - 目前體重：${metrics.weight} kg
    - 目標：${goal.type === 'bulk' ? '增肌' : goal.type === 'cut' ? '減脂' : '維持體態'}
    - 目標體重：${goal.targetWeight} kg
    - 活動量：${goal.activityLevel}
    
    回答指南：
    1. 保持專業、熱情、激勵人心，多給予學員訓練和飲食上的心態引導與科學依據。
    2. 學員詢問課表規劃、動作要領、增肌減脂、睡眠修復或健身補劑時，提供極其具體、可操作的科學建議。
    3. 隨時結合學員自身的身體數據，在適當時候提及他們的目標（例如：『既然你的目標是從 ${metrics.weight}kg 瘦到 ${goal.targetWeight}kg，那麼...』）。
    4. 請使用繁體中文回答，字句流暢自然。使用 Markdown 格式加粗重點。
  `;
  
  for (const model of FLASH_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: messages,
        config: {
          systemInstruction,
        }
      });
      if (response.text) {
        return response.text;
      }
    } catch (error) {
      console.warn(`AI Coach Chat with ${model} failed, trying fallback:`, error);
    }
  }

  return "AI 鋼鐵教練正在跑步機上狂奔，暫時無法回應，請確認網路連線並稍候再試。";
};
