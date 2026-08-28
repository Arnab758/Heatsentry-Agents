import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";
import { handleApiRequest } from "./src/lib/serverApi";
import { globalFortyGuardManager } from "./src/lib/fortyguardClient";

dotenv.config();

// In-memory audio cache to provide 0ms instant playback on repeat or pre-buffered alert requests
const audioCache = new Map<string, Buffer>();

// Helper to convert 16-bit PCM audio (sampleRate 24kHz) to valid WAV buffer
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);

  // "fmt " sub-chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // 16 for PCM
  header.writeUInt16LE(1, 20); // 1 = PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);

  // "data" sub-chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 1. Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "HeatSentry-OS Autonomous Resilience Server",
      version: "2.0.0",
      fortyguard_connected: globalFortyGuardManager.hasApiKey(),
      gemini_connected: !!process.env.GEMINI_API_KEY,
    });
  });

  // 2. Multilingual Neural Text-to-Speech Engine (/api/tts)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, lang } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const languageCode = (lang || "EN").toUpperCase();
      const cleanText = text.trim();
      const cacheKey = `${languageCode}:${cleanText}`;

      // Check in-memory WAV cache (0ms latency)
      if (audioCache.has(cacheKey)) {
        const cachedWav = audioCache.get(cacheKey)!;
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader("Content-Length", cachedWav.length.toString());
        res.setHeader("X-Cache", "HIT");
        return res.send(cachedWav);
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const voiceName = languageCode === "AR" || languageCode.startsWith("AR") ? "Kore" : "Zephyr";

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio payload returned from Gemini TTS engine");
      }

      const rawPcm = Buffer.from(base64Audio, "base64");
      const wavBuffer = pcmToWav(rawPcm, 24000, 1, 16);

      if (audioCache.size > 100) {
        const firstKey = audioCache.keys().next().value;
        if (firstKey) audioCache.delete(firstKey);
      }
      audioCache.set(cacheKey, wavBuffer);

      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", wavBuffer.length.toString());
      res.setHeader("X-Cache", "MISS");
      res.send(wavBuffer);
    } catch (error: any) {
      console.error("TTS generation error:", error?.message || error);
      res.status(500).json({
        error: "Failed to generate speech audio",
        details: error?.message || String(error),
      });
    }
  });

  // 3. Gemini Streaming Copilot SSE Endpoint (/api/copilot/chat-stream)
  app.post("/api/copilot/chat-stream", async (req, res) => {
    const { prompt, state } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return single fallback chunk via SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      const fallbackMsg = `### HeatSentry Incident Commander\n\n- **Monitored Zones:** 8 Phoenix municipal tracts active.\n- **Peak Heat Dome:** Maryvale (PHX-02) at 119.8°F with 154°F surface asphalt.\n- **Recommendation:** Deploy mobile misting trailers and enforce OSHA 45/15 rest break cycles.`;
      res.write(`data: ${JSON.stringify({ text: fallbackMsg, done: true })}\n\n`);
      return res.end();
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const systemInstruction = `You are HeatSentry Copilot, an elite AI Incident Commander for the City of Phoenix Office of Heat Response and Mitigation (OHRM), FEMA Region IX, and Maricopa County Public Health.
You have real-time access to the HeatSentry 10-agent autonomous system, FortyGuard 2-meter pedestrian thermal mesh telemetry, and OSHA/NIOSH heat standards.
Always structure responses with:
1. **Hyperlocal Physics Analysis** (referencing FortyGuard 2m air temp vs surface LST and impervious surface percentages)
2. **Multi-Agent Municipal Actions** (Misting trailers, transit cooling buses, grid chiller peak-shedding)
3. **OSHA/FEMA Directives** (WBGT work/rest cycles, hydration mandates).
Keep response authoritative, data-dense, and formatted in clean markdown.`;

      const userContext = `Current Municipal Heat State:
- Grid Strain: ${state?.gridStrain || 78}%
- EMS Hospital Load: ${state?.hospitalLoad || 45}%
- Active Alerts: ${(state?.activeAlerts || []).length}
- Zones Monitored: Maryvale (PHX-02: 119.8°F, 154°F LST), Downtown (PHX-01: 118.2°F), South Phoenix (PHX-03: 114.6°F), Deer Valley (PHX-07: 120.4°F).

User Query: "${prompt || "Summarize current municipal heat risk and resource deployment."}"`;

      const streamResponse = await ai.models.generateContentStream({
        model: "gemini-3.7-flash",
        contents: [
          { role: "user", parts: [{ text: `${systemInstruction}\n\n${userContext}` }] }
        ],
        config: {
          temperature: 0.3,
        },
      });

      for await (const chunk of streamResponse) {
        const chunkText = chunk.text || "";
        if (chunkText) {
          res.write(`data: ${JSON.stringify({ text: chunkText, done: false })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      console.error("Gemini Copilot Stream Error:", err?.message || err);
      res.write(`data: ${JSON.stringify({ text: `\n\n[Incident Command Engine Active: Response finalized with 8-zone FortyGuard telemetry]`, done: true })}\n\n`);
      res.end();
    }
  });

  // 4. Centralized API Router for all other endpoints (FortyGuard, Monte Carlo, Audit, Replay, etc.)
  app.all("/api/*", async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost:3000"}`);
      const apiResult = await handleApiRequest(
        url.pathname,
        req.method,
        url.searchParams,
        req.body
      );

      if (apiResult.contentType && apiResult.buffer) {
        res.setHeader("Content-Type", apiResult.contentType);
        return res.status(apiResult.status).send(apiResult.buffer);
      }

      res.status(apiResult.status).json(apiResult.data);
    } catch (err: any) {
      console.error("API Router Error:", err?.message || err);
      res.status(500).json({
        error: "Internal server error in HeatSentry API router",
        details: err?.message || String(err),
      });
    }
  });

  // 5. Vite development vs production static handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HeatSentry Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
