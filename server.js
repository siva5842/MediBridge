// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var targetPort = process.env.PORT && process.env.PORT !== "8080" ? Number(process.env.PORT) : 3e3;
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
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this prescription or medical lab report image. Extract the patient demographics and prescribed medications. Return ONLY a valid JSON object matching this schema:
              {
                "patient": {
                  "name": string,
                  "age": string,
                  "gender": string,
                  "doctorName": string,
                  "doctorSpecialty": string,
                  "date": string
                },
                "drugs": [
                  {
                    "name": string,
                    "genericName": string,
                    "strength": string,
                    "dosageForm": string,
                    "morning": boolean,
                    "afternoon": boolean,
                    "night": boolean,
                    "foodRelation": "before_meal" | "after_meal" | "with_meal" | "empty_stomach",
                    "durationDays": number,
                    "totalPillsPrescribed": number,
                    "remainingPills": number,
                    "confidenceScore": number,
                    "clinicalNoteEn": string,
                    "clinicalNoteTa": string
                  }
                ]
              }`
            },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("Prescription decode error:", error);
    res.status(500).json({ error: error.message || "Failed to decode prescription" });
  }
});
var distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
var server = app.listen(targetPort, "0.0.0.0", () => {
  console.log(`Production server running on 0.0.0.0:${targetPort}`);
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE" && targetPort !== 3e3) {
    console.warn(`Port ${targetPort} in use, trying port 3000...`);
    app.listen(3e3, "0.0.0.0", () => {
      console.log("Production server running on 0.0.0.0:3000");
    });
  } else {
    console.error("Server error:", err);
  }
});
