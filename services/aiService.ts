import { BodyMetric, UserGoal } from "../types";

export const generateDietarySuggestions = async (metrics: BodyMetric, goal: UserGoal): Promise<string> => {
  try {
    const res = await fetch('/api/diet/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics, goal }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return err.error || "AI 分析服務暫時無法使用，請檢查網路或稍後再試。";
    }
    const data = await res.json();
    return data.text || "AI 分析服務暫時無法使用，請檢查網路或稍後再試。";
  } catch (error) {
    console.warn("generateDietarySuggestions fetch error:", error);
    return "AI 分析服務暫時無法使用，請檢查網路連線並稍候再試。";
  }
};

export const analyzeFoodImage = async (base64Image: string): Promise<string> => {
  try {
    const res = await fetch('/api/diet/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return err.error || "食物影像分析失敗，請檢查網路連線或重新上傳照片。";
    }
    const data = await res.json();
    return data.text || "食物影像分析失敗，請檢查網路連線或重新上傳照片。";
  } catch (error) {
    console.warn("analyzeFoodImage fetch error:", error);
    return "食物影像分析失敗，請檢查網路連線或重新上傳照片。";
  }
};

export const chatWithCoach = async (
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[], 
  metrics: BodyMetric, 
  goal: UserGoal,
  coachTone: string = 'taiwanese'
): Promise<string> => {
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, metrics, goal, coachTone }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return err.error || "AI 鋼鐵教練正在跑步機上狂奔，暫時無法回應，請確認網路連線並稍候再試。";
    }
    const data = await res.json();
    return data.text || "AI 鋼鐵教練正在跑步機上狂奔，暫時無法回應，請確認網路連線並稍候再試。";
  } catch (error) {
    console.warn("chatWithCoach fetch error:", error);
    return "AI 鋼鐵教練正在跑步機上狂奔，暫時無法回應，請確認網路連線並稍候再試。";
  }
};
