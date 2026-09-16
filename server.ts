import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  handleCoachChat, 
  handleDietAnalysis, 
  handleDietSuggestions 
} from "./server/aiHandlers";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Coach Chat API
app.post("/api/coach", async (req, res) => {
  try {
    const result = await handleCoachChat(req.body);
    return res.json(result);
  } catch (error: any) {
    console.error("Coach API route error:", error);
    return res.status(500).json({ 
      error: error?.message || "AI 鋼鐵教練正在跑步機上狂奔，暫時無法回應，請確認網路連線並稍候再試。" 
    });
  }
});

// Food Image Analysis API
app.post("/api/diet/analysis", async (req, res) => {
  try {
    const result = await handleDietAnalysis(req.body);
    return res.json(result);
  } catch (error: any) {
    console.error("Diet analysis API route error:", error);
    return res.status(500).json({ 
      error: error?.message || "食物影像分析失敗，請檢查網路連線或重新上傳照片。" 
    });
  }
});

// Dietary Suggestions API
app.post("/api/diet/suggestions", async (req, res) => {
  try {
    const result = await handleDietSuggestions(req.body);
    return res.json(result);
  } catch (error: any) {
    console.error("Diet suggestions API route error:", error);
    return res.status(500).json({ 
      error: error?.message || "AI 分析服務暫時無法使用，請檢查網路或稍後再試。" 
    });
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
