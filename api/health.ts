export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY);

  return res.status(200).json({
    status: 'ok',
    time: new Date().toISOString(),
    environment: {
      hasGeminiKey: hasApiKey,
      platform: 'vercel-serverless'
    }
  });
}
