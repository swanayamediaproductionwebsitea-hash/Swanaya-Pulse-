import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { db, withRetry } from "./src/db/index.ts";
import { contentPlans, documents, activityLogs, aiTodoItems } from "./src/db/schema.ts";
import { eq, desc } from "drizzle-orm";

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
app.use(express.static(path.join(process.cwd(), "public")));

// Google Site Verification Route
app.get("/googlef7eba3382952800a.html", (req, res) => {
  res.type("text/html").send("google-site-verification: googlef7eba3382952800a.html");
});

app.get("/googlef7eba3382952800a%20(2).html", (req, res) => {
  res.type("text/html").send("google-site-verification: googlef7eba3382952800a.html");
});

// Serve robots.txt and sitemap.xml
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").sendFile(path.join(process.cwd(), "public", "robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml").sendFile(path.join(process.cwd(), "public", "sitemap.xml"));
});

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

// API: Generate AI To-Dos using gemini-3.5-flash
app.post("/api/generate-todos", async (req, res) => {
  try {
    const { topic, platform } = req.body;
    const ai = getAiClient();
    
    const contextPrompt = topic 
      ? `focusing on the topic/theme "${topic}"` 
      : `spanning general digital marketing, media production, and corporate branding tasks`;

    const platformPrompt = platform && platform !== "All"
      ? `specifically tailored for the ${platform} platform`
      : `across various channels like Instagram, YouTube, LinkedIn, and Meta Ads`;

    const prompt = `You are an expert digital marketing director and content strategist for Swanaya Media Enterprises.
Generate exactly 4 highly professional, actionable, and strategically sound production/marketing To-Do tasks ${contextPrompt} and ${platformPrompt}.

For each To-Do, provide:
1. "text": Clear, specific, and actionable description of the task (under 120 characters).
2. "platform": The social channel it belongs to (choose from: Instagram, YouTube, Google Ads, Meta Ads, LinkedIn, Facebook).
3. "priority": Urgent operational importance (choose from: High, Medium, Low).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            todos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "Actionable item text" },
                  platform: { type: Type.STRING, description: "Target social channel" },
                  priority: { type: Type.STRING, description: "High, Medium, or Low" }
                },
                required: ["text", "platform", "priority"]
              }
            }
          },
          required: ["todos"]
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
    console.error("Gemini API Error in /api/generate-todos:", error);
    res.status(500).json({ 
      error: "Failed to generate AI To-Dos", 
      details: error?.message || error 
    });
  }
});

// --- Database API Endpoints (Cloud SQL / Drizzle) ---

// Content Plans CRUD
app.get("/api/plans", async (req, res) => {
  try {
    const results = await withRetry(() => db.select().from(contentPlans).orderBy(desc(contentPlans.createdAt)));
    res.json(results);
  } catch (err: any) {
    console.error("Error fetching plans:", err);
    res.status(500).json({ error: "Failed to fetch content plans" });
  }
});

app.post("/api/plans", async (req, res) => {
  try {
    const { 
      title, type, description, month, day, year, assignedDate, videoUrl, videoName, videoSize, status, platform, 
      accountHandle, accountName, createdBy, views, likes, comments, shares, engagementRate, viewRate, likeRate, externalLink 
    } = req.body;
    const inserted = await withRetry(() => db.insert(contentPlans).values({
      uid: createdBy || "each",
      title,
      type,
      description,
      month,
      day: Number(day),
      year: Number(year),
      assignedDate: assignedDate || "",
      videoUrl: videoUrl || "",
      videoName: videoName || "",
      videoSize: videoSize || "",
      status,
      platform,
      accountHandle: accountHandle || "@chai_with_aadi",
      accountName: accountName || "Chai with Aadithyan",
      views: views !== undefined ? Number(views) : 0,
      likes: likes !== undefined ? Number(likes) : 0,
      comments: comments !== undefined ? Number(comments) : 0,
      shares: shares !== undefined ? Number(shares) : 0,
      engagementRate: engagementRate || "",
      viewRate: viewRate || "",
      likeRate: likeRate || "",
      externalLink: externalLink || "",
      createdBy: createdBy || "each"
    }).returning());
    res.status(201).json(inserted[0]);
  } catch (err: any) {
    console.error("Error creating plan:", err);
    res.status(500).json({ error: "Failed to create content plan" });
  }
});

app.put("/api/plans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, type, description, month, day, year, assignedDate, videoUrl, videoName, videoSize, status, platform, 
      accountHandle, accountName, createdBy, views, likes, comments, shares, engagementRate, viewRate, likeRate, externalLink 
    } = req.body;
    const updated = await withRetry(() => db.update(contentPlans).set({
      title,
      type,
      description,
      month,
      day: day !== undefined ? Number(day) : undefined,
      year: year !== undefined ? Number(year) : undefined,
      assignedDate,
      videoUrl,
      videoName,
      videoSize,
      status,
      platform,
      accountHandle,
      accountName,
      views: views !== undefined ? Number(views) : undefined,
      likes: likes !== undefined ? Number(likes) : undefined,
      comments: comments !== undefined ? Number(comments) : undefined,
      shares: shares !== undefined ? Number(shares) : undefined,
      engagementRate,
      viewRate,
      likeRate,
      externalLink,
      createdBy
    }).where(eq(contentPlans.id, Number(id))).returning());
    res.json(updated[0]);
  } catch (err: any) {
    console.error("Error updating plan:", err);
    res.status(500).json({ error: "Failed to update content plan" });
  }
});

app.delete("/api/plans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await withRetry(() => db.delete(contentPlans).where(eq(contentPlans.id, Number(id))));
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting plan:", err);
    res.status(500).json({ error: "Failed to delete content plan" });
  }
});

// Documents CRUD
app.get("/api/documents", async (req, res) => {
  try {
    const results = await withRetry(() => db.select().from(documents).orderBy(desc(documents.createdAt)));
    res.json(results);
  } catch (err: any) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

app.post("/api/documents", async (req, res) => {
  try {
    const { id, title, content, templateType, lastModified, modifiedBy, googleDocId, googleDocUrl, hasWatermark } = req.body;
    
    const existing = await withRetry(() => db.select().from(documents).where(eq(documents.id, id)));
    
    if (existing.length > 0) {
      const updated = await withRetry(() => db.update(documents).set({
        title,
        content,
        templateType,
        lastModified,
        modifiedBy,
        googleDocId,
        googleDocUrl,
        hasWatermark: !!hasWatermark
      }).where(eq(documents.id, id)).returning());
      res.json(updated[0]);
    } else {
      const inserted = await withRetry(() => db.insert(documents).values({
        id,
        title,
        content,
        templateType,
        lastModified,
        modifiedBy,
        googleDocId,
        googleDocUrl,
        hasWatermark: !!hasWatermark
      }).returning());
      res.status(201).json(inserted[0]);
    }
  } catch (err: any) {
    console.error("Error saving document:", err);
    res.status(500).json({ error: "Failed to save document" });
  }
});

app.delete("/api/documents", async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      await withRetry(() => db.delete(documents).where(eq(documents.id, String(id))));
    } else {
      await withRetry(() => db.delete(documents));
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting document:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// Activity Logs CRUD
app.get("/api/logs", async (req, res) => {
  try {
    const results = await withRetry(() => db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)));
    res.json(results);
  } catch (err: any) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

app.post("/api/logs", async (req, res) => {
  try {
    const { text, timestamp, type, uid } = req.body;
    const inserted = await withRetry(() => db.insert(activityLogs).values({
      uid: uid || null,
      text,
      timestamp,
      type
    }).returning());
    res.status(201).json(inserted[0]);
  } catch (err: any) {
    console.error("Error creating activity log:", err);
    res.status(500).json({ error: "Failed to create activity log" });
  }
});

app.delete("/api/logs", async (req, res) => {
  try {
    await withRetry(() => db.delete(activityLogs));
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error clearing logs:", err);
    res.status(500).json({ error: "Failed to clear activity logs" });
  }
});

// To-Do Items CRUD
app.get("/api/todos", async (req, res) => {
  try {
    const results = await withRetry(() => db.select().from(aiTodoItems).orderBy(desc(aiTodoItems.createdAt)));
    res.json(results);
  } catch (err: any) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    const { text, platform, priority, completed, uid } = req.body;
    const inserted = await withRetry(() => db.insert(aiTodoItems).values({
      uid: uid || "each",
      text,
      platform,
      priority,
      completed: !!completed
    }).returning());
    res.status(201).json(inserted[0]);
  } catch (err: any) {
    console.error("Error creating todo:", err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const updated = await withRetry(() => db.update(aiTodoItems).set({
      completed: !!completed
    }).where(eq(aiTodoItems.id, Number(id))).returning());
    res.json(updated[0]);
  } catch (err: any) {
    console.error("Error updating todo:", err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await withRetry(() => db.delete(aiTodoItems).where(eq(aiTodoItems.id, Number(id))));
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ error: "Failed to delete todo" });
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
