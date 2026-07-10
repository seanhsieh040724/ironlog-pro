import { GoogleGenAI } from "@google/genai";
import { BodyMetric, UserGoal } from "../types";

export const generateDietarySuggestions = async (metrics: BodyMetric, goal: UserGoal) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    return response.text || "無法生成建議，請稍後再試。";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "AI 分析服務暫時無法使用，請檢查網路或稍後再試。";
  }
};

export const analyzeFoodImage = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    你是一位專業的AI運動營養師與食物熱量估算專家。請分析這張食物照片並提供詳細的熱量與營養素估算。
    
    請提供以下資訊（以 Markdown 格式、繁體中文回答，使用精美且易讀的排版）：
    1. **估算總熱量**（標示為 KCAL，並用醒目大字體或色塊表示）。
    2. **主要食物名稱**與估計重量（例如：雞胸肉 150g）。
    3. **巨量營養素估算**（蛋白質克數、碳水化合物克數、脂肪克數，可用表格或條列表示）。
    4. **健康度評分**（1-10分，並簡單說明理由）。
    5. **給使用者的健康吃法調整或健身搭配建議**（例如：建議多補充膳食纖維，或適合在重訓後食用）。
  `;
  
  const base64DataOnly = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64DataOnly
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, prompt],
    });
    return response.text || "無法分析此圖片，請再試一次。";
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return "食物影像分析失敗，請檢查 API 金鑰設定或重新上傳照片。";
  }
};

export const chatWithCoach = async (
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[], 
  metrics: BodyMetric, 
  goal: UserGoal
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemInstruction = `
    你是一位頂級運動健身教練與專業運動營養學家，名叫「IronLog AI 鋼鐵教練」。
    你正在與一位你的專屬學員對話。
    
    學員的當前身體數據：
    - 性別：${metrics.gender === 'male' ? '男' : '女'}
    - 年齡：${metrics.age} 歲
    - 身高：${metrics.height} cm
    - 目前體重：${metrics.weight} kg
    - 目標：${goal.type === 'bulk' ? '增肌' : goal.type === 'cut' ? '減脂' : '維持體態'}
    - 目標體重：${goal.targetWeight} kg
    - 活動量：${goal.activityLevel}
    
    回答指南：
    1. 保持專業、熱情、激勵人心（阿諾經典風格），多給予學員訓練和飲食上的心態引導。
    2. 學員詢問課表規劃、姿勢要領、增肌減脂、睡眠修復或健身補劑時，提供極其具體、可操作的科學建议。
    3. 隨時結合學員自身的身體數據，在適當時候提及他們的目標（例如：『既然你的目標是從 ${metrics.weight}kg 瘦到 ${goal.targetWeight}kg，那麼...』）。
    4. 請使用繁體中文回答，字句流暢自然，不要有英文縮寫生硬感。使用 Markdown 格式加粗重點。
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: messages,
      config: {
        systemInstruction,
      }
    });
    return response.text || "我收到了你的訊息，但我正在進行高強度深蹲，可以請你再傳送一次嗎？";
  } catch (error) {
    console.error("AI Coach Chat Error:", error);
    return "AI 鋼鐵教練正在跑步機上狂奔，暫時無法回應，請確認金鑰設定並稍候。";
  }
};
