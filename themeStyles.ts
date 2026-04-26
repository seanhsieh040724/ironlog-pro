/**
 * IronLog Pro - Light Mode 視覺樣式定義
 * 用於統一管理全頁面的配色與基礎組件樣式
 */

export const lightTheme = {
  bg: '#FFFFFF',      // 純白底
  text: '#1D1D1F',    // 質感黑字
  card: '#F5F5F7',    // 淺灰卡片
  accent: '#CCFF00',  // 霓虹綠點綴
  muted: '#6E6E73',   // 次要文字/圖示色
  border: 'rgba(0, 0, 0, 0.05)' // 淺色邊框
};

// 基礎容器樣式
export const ContainerStyle = {
  backgroundColor: lightTheme.bg,
  color: lightTheme.text,
  minHeight: '100vh',
  fontFamily: "'Outfit', sans-serif"
};

// 運動卡片/容器樣式
export const CardStyle = {
  backgroundColor: lightTheme.card,
  borderRadius: '1.75rem',
  border: `1px solid ${lightTheme.border}`,
  padding: '1.5rem',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
};

// 文字基礎樣式
export const TextStyle = {
  color: lightTheme.text,
  fontWeight: '900',
  fontStyle: 'italic',
  textTransform: 'uppercase' as const
};

// 霓虹綠強調色文字樣式
export const AccentTextStyle = {
  color: '#82CC00', // 稍微加深以提升在白底上的易讀性
  fontWeight: '900'
};

// 輸入框基礎樣式
export const InputStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.03)',
  borderRadius: '1rem',
  border: `1px solid ${lightTheme.border}`,
  color: lightTheme.text,
  padding: '0.75rem 1rem',
  outline: 'none'
};

// 霓虹綠主按鈕樣式
export const AccentButtonStyle = {
  backgroundColor: lightTheme.accent,
  color: '#000000',
  borderRadius: '1.25rem',
  fontWeight: '900',
  textTransform: 'uppercase' as const,
  boxShadow: '0 0.625rem 0.9375rem -0.1875rem rgba(204, 255, 0, 0.1)'
};

// 黑色操作按鈕樣式
export const ActionButtonStyle = {
  backgroundColor: '#000000',
  color: '#FFFFFF',
  borderRadius: '1.25rem',
  fontWeight: '900',
  textTransform: 'uppercase' as const
};
