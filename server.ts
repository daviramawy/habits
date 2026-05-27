import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for base64 image transmissions
app.use(express.json({ limit: "15mb" }));

// Initialize GenAI safely with process.env.GEMINI_API_KEY
// Check if key is available:
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// REST API endpoint for habit verification
app.post("/api/verify-habit", async (req, res): Promise<any> => {
  const { habitId, image, habitName } = req.body;

  if (!ai) {
    return res.status(500).json({
      success: false,
      error: "Gemini API key is not configured in Secrets.",
      analysis: "The magical core (Gemini API) of the world is offline. Set API keys in Settings > Secrets to unleash the AI verification!",
      verified: true // Fallback to auto-complete so user is not blocked
    });
  }

  if (!image) {
    return res.status(400).json({
      success: false,
      error: "No visual scroll (image) was provided for verification."
    });
  }

  try {
    // Standardize base64 format by removing header if present
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64,
      },
    };

    let prompt = "";
    if (habitId === "habit1" || habitId === "dance") {
      prompt = `This is a camera frame captured from a user's practice session of the habit: "${habitName || 'dance for 15 minutes'}".
Analyze if this captures a person practicing, stretching, dancing, or if there is active body posture and kinetic alignment in progress. 
Respond in the character of a helpful, thematic medieval RPG taskmaster. Confirm if they have completed their quest.`;
    } else if (habitId === "habit2" || habitId === "research") {
      prompt = `This is a picture of research, writing, notes, textbook, or a screen captured for the academic habit: "${habitName || 'research or write for 20 minutes'}".
Analyze how much writing, document analysis or book academic workload is visible. Evaluate it objectively but with fantasy RPG flair. 
Assess their work score out of 100 on how substantive and genuine the reading or writing looks.`;
    } else {
      prompt = `This is a camera frame captured from a tennis player practicing: "${habitName || 'practice tennis drills for 30 minutes'}".
Look for body posture, athletic motion, racket grip, court alignment, or sports gear indicating active athletic exercise.
Respond in the grand character of an RPG combat trainer evaluating their martial stance.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        imagePart,
        { text: prompt }
      ],
      config: {
        systemInstruction: "You are a wise medieval RPG sage and martial trainer of the OverStressed Guild. You verify daily quests. Give rich, medieval/fantasy roleplay coaching feedback.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verified: {
              type: Type.BOOLEAN,
              description: "True if any active effort or academic progress or posture is verified. Be lenient and encourage progress!"
            },
            analysis: {
              type: Type.STRING,
              description: "A detailed fantasy roleplay comment about what you saw in the image and coaching feedback."
            },
            workScore: {
              type: Type.INTEGER,
              description: "The estimated completeness score of the task, from 0 to 100."
            }
          },
          required: ["verified", "analysis", "workScore"],
        }
      }
    });

    const bodyText = response.text || "{}";
    const result = JSON.parse(bodyText.trim());

    return res.json({
      success: true,
      verified: result.verified ?? true,
      analysis: result.analysis ?? "The guild master nods in silent approval. Your effort is registered!",
      workScore: result.workScore ?? 100
    });

  } catch (error: any) {
    console.error("Verification failed in server:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Celestial feedback alignment failed.",
      analysis: "Your trainer was momentarily blinded by a magical flare (timeout/API error). The quest resolves in your absolute favor by decree!",
      verified: true // Grant success fallback so user doesn't get stuck on network failures
    });
  }
});

// Configure Vite or Static Assets serving based on Environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start custom server:", err);
});
