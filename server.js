// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV && process.env.npm_lifecycle_event === "dev";
var targetPort = isDev ? 3e3 : Number(process.env.PORT || 8080);
app.use(express.json({ limit: "25mb" }));
app.get(["/healthz", "/api/health"], (_req, res) => {
  res.status(200).json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/decode-prescription", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured on the server. Please check user secrets."
      });
    }
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 payload is required." });
    }
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const prompt = `You are a clinical pharmacist AI. Analyze this image (prescription, medicine strip, bottle, or lab report).
Read the exact text printed or handwritten on the document/strip.
Extract:
1. Exact Medicine / Brand Name (e.g., Dolo 650, Metformin, Azithromycin, Pantocid).
2. Strength (e.g., 500mg, 650mg, 40mg, 5ml).
3. Form (Tablet, Capsule, Syrup, Injection).
4. Frequency & Timing (Morning, Noon, Night, Before/After Food).
5. Stock / Pill count.
6. If visible, also extract any patient and doctor information.

Return strictly valid JSON format:
{
  "patient": {
    "name": "Patient Name or empty",
    "age": "Age or empty",
    "gender": "Male | Female | Other or empty",
    "doctorName": "Doctor Name or empty",
    "doctorSpecialty": "Specialty or empty",
    "date": "Prescription date or empty"
  },
  "medications": [
    {
      "name": "Medicine / Brand Name",
      "strength": "e.g. 650mg",
      "type": "Tablet",
      "morning": 1,
      "noon": 0,
      "night": 1,
      "food": "Before Food or After Food",
      "stock": 14
    }
  ]
}

If the image does NOT contain any readable prescription, medicine strip, or clinical document, return:
{
  "patient": null,
  "medications": []
}`;
    const candidateModels = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.8-flash"];
    let lastError = null;
    let decodedText = void 0;
    for (const modelName of candidateModels) {
      try {
        const geminiResponse = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          },
          config: {
            responseMimeType: "application/json"
          }
        });
        decodedText = geminiResponse.text;
        if (decodedText) break;
      } catch (err) {
        console.warn(`Model ${modelName} failed, attempting next model:`, err.message || err);
        lastError = err;
      }
    }
    if (!decodedText) {
      throw lastError || new Error("No response from Gemini Vision API.");
    }
    let cleaned = decodedText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    }
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (error) {
    console.error("Prescription decode error:", error);
    res.status(500).json({ error: error.message || "Failed to decode prescription" });
  }
});
async function setupApp() {
  const distPath = path.join(__dirname, "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));
  if (!isDev && hasDist) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else if (isDev) {
    try {
      const { createServer } = await import("vite");
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn("Vite dev middleware failed, falling back to dist static files:", viteErr);
      if (hasDist) {
        app.use(express.static(distPath));
        app.get("*", (_req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  const server = app.listen(targetPort, "0.0.0.0", () => {
    console.log(`MediBridge Server running in ${isDev ? "development" : "production"} mode on 0.0.0.0:${targetPort}`);
  });
  server.on("error", (err) => {
    console.error("MediBridge Server fatal error:", err);
    process.exit(1);
  });
  if (!isDev && targetPort !== 3e3) {
    try {
      const secondaryServer = app.listen(3e3, "0.0.0.0", () => {
        console.log("MediBridge secondary listener active on 0.0.0.0:3000");
      });
      secondaryServer.on("error", (err) => {
        console.log("Port 3000 secondary listener skipped:", err.message || err.code);
      });
    } catch {
    }
  }
}
setupApp();
