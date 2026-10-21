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

/**
 * 清理並轉換 AI 食物分析回傳內容：
 * 1. 徹底去除所有 HTML 標籤（如 <div>、<span>、<h1>、<table>、<style> 等）與 inline styles
 * 2. 將常見 HTML 結構（如 <h1>~<h6>、<strong>、<b>、<li>、<br>）優雅轉為手機友善的 Markdown / 純文字
 * 3. 避免任何 HTML/CSS 原始碼殘留或洩漏到前端畫面
 */
export const sanitizeFoodAnalysisText = (rawText: string): string => {
  if (!rawText) return '';

  let cleaned = rawText;

  // 1. 移除 <style> 與 <script> 區塊及其內容
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');

  // 2. 移除 HTML 註解
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // 3. 將常見標題標籤轉換為 Markdown 加粗標題
  cleaned = cleaned.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n\n**$1**\n\n');

  // 4. 將 strong / b 轉換為 markdown 加粗
  cleaned = cleaned.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');

  // 5. 將 em / i 轉換為純文字
  cleaned = cleaned.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '$1');

  // 6. 將 br 標籤轉為換行
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');

  // 7. 將 li 標籤轉換為項目符號
  cleaned = cleaned.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n• $1');

  // 8. 將 p 與 div 標籤轉換為換行分隔
  cleaned = cleaned.replace(/<\/(?:p|div|section|article)>/gi, '\n');
  cleaned = cleaned.replace(/<(?:p|div|section|article)[^>]*>/gi, '\n');

  // 9. 移除表格標籤並保留內容文字
  cleaned = cleaned.replace(/<\/?(?:table|tbody|thead|tfoot|tr)[^>]*>/gi, '\n');
  cleaned = cleaned.replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, ' $1 ');
  cleaned = cleaned.replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, ' $1 ');

  // 10. 徹底濾除所有剩餘的 HTML 標籤（包含帶有 style、class、id 等任意 tag）
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // 11. 還原常見 HTML Entity 編碼
  cleaned = cleaned
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // 12. 整理多餘空白與連續換行（最多保留兩個連續換行）
  cleaned = cleaned
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
};

export interface ParsedFoodNutrition {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isValid: boolean;
}

/**
 * 從 AI 食物分析結果文字中解析數值（食物名稱、熱量 kcal、蛋白質、碳水、脂肪）
 * 支援提取數值範圍平均值（如 320 - 350 kcal -> 335 kcal）
 */
export const parseFoodAnalysisResult = (text: string): ParsedFoodNutrition => {
  if (!text) {
    return { name: '', calories: 0, protein: 0, carbs: 0, fat: 0, isValid: false };
  }

  const extractNumberOrRange = (str: string): number => {
    // 優先匹配範圍如 "680 - 750", "320~350", "320 至 350"
    const rangeMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:[-~～至]|到)\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      const n1 = parseFloat(rangeMatch[1]);
      const n2 = parseFloat(rangeMatch[2]);
      if (!isNaN(n1) && !isNaN(n2)) {
        return Math.round((n1 + n2) / 2);
      }
    }
    // 單一數字
    const singleMatch = str.match(/(\d+(?:\.\d+)?)/);
    if (singleMatch) {
      const n = parseFloat(singleMatch[1]);
      return isNaN(n) ? 0 : Math.round(n * 10) / 10;
    }
    return 0;
  };

  let name = '';
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  const lines = text.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // 1. 食物名稱（匹配 🍱 食物：XXX 或 食物：XXX）
    if (!name && (line.includes('食物') || line.includes('🍱'))) {
      const match = line.match(/(?:🍱\s*)?(?:\*\*)?食物(?:\*\*)?[：:]\s*(.+)/);
      if (match && match[1]) {
        name = match[1].replace(/[*_#`]/g, '').trim();
      }
    }

    // 2. 熱量（匹配 🔥 熱量：約 XXX kcal 或 熱量：XXX 或行中帶有 kcal / 大卡）
    if (calories === 0 && (line.includes('熱量') || line.includes('🔥') || /kcal|大卡/i.test(line))) {
      const match = line.match(/(?:🔥\s*)?(?:\*\*)?熱量(?:\*\*)?[：:]\s*(.+)/);
      if (match && match[1]) {
        calories = Math.round(extractNumberOrRange(match[1]));
      } else {
        const calMatch = line.match(/(\d+(?:\.\d+)?(?:\s*[-~～至]\s*\d+(?:\.\d+)?)?)\s*(?:kcal|大卡)/i);
        if (calMatch && calMatch[1]) {
          calories = Math.round(extractNumberOrRange(calMatch[1]));
        }
      }
    }

    // 3. 蛋白質（匹配 🥩 蛋白質：XX g）
    if (protein === 0 && (line.includes('蛋白質') || line.includes('🥩'))) {
      const match = line.match(/(?:🥩\s*)?(?:\*\*)?蛋白質(?:\*\*)?[：:]\s*(.+)/);
      if (match && match[1]) {
        protein = extractNumberOrRange(match[1]);
      }
    }

    // 4. 碳水（匹配 🍚 碳水：XX g）
    if (carbs === 0 && (line.includes('碳水') || line.includes('🍚'))) {
      const match = line.match(/(?:🍚\s*)?(?:\*\*)?碳水(?:化合物)?(?:\*\*)?[：:]\s*(.+)/);
      if (match && match[1]) {
        carbs = extractNumberOrRange(match[1]);
      }
    }

    // 5. 脂肪（匹配 🥑 脂肪：XX g）
    if (fat === 0 && (line.includes('脂肪') || line.includes('🥑'))) {
      const match = line.match(/(?:🥑\s*)?(?:\*\*)?脂肪(?:\*\*)?[：:]\s*(.+)/);
      if (match && match[1]) {
        fat = extractNumberOrRange(match[1]);
      }
    }
  }

  // 若依行未抓到熱量，進行全文檢索任意帶有 kcal 或 大卡 或 熱量 的數值
  if (calories === 0) {
    const fullCalMatch = text.match(/(\d+(?:\.\d+)?(?:\s*[-~～至]\s*\d+(?:\.\d+)?)?)\s*(?:kcal|大卡)/i) ||
      text.match(/(?:熱量|卡路里)[^\d]*(\d+(?:\.\d+)?(?:\s*[-~～至]\s*\d+(?:\.\d+)?)?)/i);
    if (fullCalMatch && fullCalMatch[1]) {
      calories = Math.round(extractNumberOrRange(fullCalMatch[1]));
    }
  }

  if (!name) {
    name = 'AI 拍照分析食物';
  }

  const isValid = calories > 0 && !isNaN(calories);

  return {
    name,
    calories,
    protein,
    carbs,
    fat,
    isValid
  };
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
    const rawText = data.text || "食物影像分析失敗，請檢查網路連線或重新上傳照片。";
    return sanitizeFoodAnalysisText(rawText);
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
