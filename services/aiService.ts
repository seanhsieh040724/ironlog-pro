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
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "無法生成建議，請稍後再試。";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "AI 分析服務暫時無法使用，請檢查網路或稍後再試。";
  }
};
