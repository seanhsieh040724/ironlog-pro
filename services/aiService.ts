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
