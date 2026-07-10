import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI SDK lazily/securely as per guidelines
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY environment variable is not set. AI features might fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

app.use(express.json());

// API: Smart Autofill with SEO Integration using gemini-3.5-flash
app.post("/api/autofill", async (req, res) => {
  try {
    const { taskName, assigneeRole } = req.body;
    if (!taskName) {
      res.status(400).json({ error: "taskName is required" });
      return;
    }

    const ai = getAiClient();
    const prompt = `You are an expert digital marketing, SEO, and content creation assistant for Swanaya Media Enterprises.
Analyze the task titled "${taskName}" for the assignee role of "${assigneeRole || 'Content Creator'}".

Generate:
1. An improved, professional description of the task focusing on key marketing objectives, execution steps, and optimal formats (e.g., Reels, Posters, Carousel, or Blogs).
2. 3-5 relevant high-performance social/marketing tags.
3. An expected timeline (number of days required to complete this task, as an integer).
4. 3-5 high-conversion SEO Focus Keywords.
5. A search-engine-optimized Meta Description or caption copy hook designed to maximize reach and click-through rate.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { 
              type: Type.STRING,
              description: "Detailed professional task instructions, execution steps, and platform suggestions."
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 general social hashtags/tags."
            },
            timelineDays: { 
              type: Type.INTEGER,
              description: "Expected production or delivery time in days as an integer, typically between 1 and 14."
            },
            seoKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 powerful SEO target keywords."
            },
            seoDescription: { 
              type: Type.STRING,
              description: "SEO-optimized Meta copy, promotional caption hook, or search snippet."
            }
          },
          required: ["description", "tags", "timelineDays", "seoKeywords", "seoDescription"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text received from Gemini API");
    }

    const resultJson = JSON.parse(resultText);
    res.json(resultJson);
  } catch (error: any) {
    console.error("Gemini API Error in /api/autofill:", error);
    res.status(500).json({ 
      error: "Failed to generate AI autofill content", 
      details: error?.message || error 
    });
  }
});

// API: Optimize tags and hashtags with Gemini API
app.post("/api/optimize-tags", async (req, res) => {
  try {
    const { taskName } = req.body;
    if (!taskName) {
      res.status(400).json({ error: "taskName is required" });
      return;
    }

    const ai = getAiClient();
    const prompt = `You are an expert digital marketing, SEO, and social media strategist.
Analyze the content planning task titled "${taskName}".
Provide a list of 5 to 8 SEO-friendly keywords and relevant hashtags.
The response must be a JSON object containing a "tags" array of strings. Mix some powerful hashtags (with # prefix) and standard SEO keyword strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "5 to 8 SEO-friendly keywords and relevant hashtags."
            }
          },
          required: ["tags"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text received from Gemini API");
    }

    const resultJson = JSON.parse(resultText);
    res.json(resultJson);
  } catch (error: any) {
    console.error("Gemini API Error in /api/optimize-tags:", error);
    res.status(500).json({ 
      error: "Failed to optimize tags", 
      details: error?.message || error 
    });
  }
});

// Serve health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function bootServer() {
  // Vite middleware for development
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
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

bootServer();
