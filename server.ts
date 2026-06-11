import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { v4 as uuidv4 } from "uuid";
import type { ProviderModel, GlobalSettings, QQBotConfig } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// --- In-memory simple storage for configuration ---
let storedModels: ProviderModel[] = [
  {
    id: uuidv4(),
    name: "Groq Llama-3 70B",
    modelCode: "llama3-70b-8192",
    baseUrl: "https://api.groq.com/openai/v1",
    apiKey: "", // provide standard key
  },
  {
    id: uuidv4(),
    name: "Agnes AI",
    modelCode: "agnes-2.0-flash",
    baseUrl: "https://apihub.agnes-ai.com/v1",
    apiKey: "agnesapisk-UI5ql0QpkBoTdiIAKBAMsyNpYtMOtFsdpfg6aKepXbaVuXlG",
  }
];

let globalSettings: GlobalSettings = {
  systemPrompt: "您是一个极具帮助的智能助理。",
  defaultModelId: "",
  streamEnabled: true,
  contextRounds: 10,
};

let qqBotConfig: QQBotConfig = {
  appId: "",
  appSecret: "",
  token: "",
};


// --- OpenAI Compatible Gateway API ---

app.get("/v1/models", (req, res) => {
  res.json({
    object: "list",
    data: storedModels.map((m) => ({
      id: m.modelCode,
      object: "model",
      created: Math.floor(Date.now() / 1000),
      owned_by: m.name
    }))
  });
});

app.post("/v1/chat/completions", async (req, res) => {
   const body = req.body;
   const requestedModelCode = body.model;
   
   let provider = storedModels.find(m => m.modelCode === requestedModelCode);
   if (!provider && globalSettings.defaultModelId) {
      provider = storedModels.find(m => m.id === globalSettings.defaultModelId);
   }
   
   if (!provider) {
      return res.status(404).json({ error: { message: "未找到匹配的模型节点配置，请在控制台添加。" }});
   }
   
   try {
     const response = await fetch(`${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${provider.apiKey}`
       },
       body: JSON.stringify({
         ...body,
         model: provider.modelCode 
       })
     });
     
     if (body.stream && response.body) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
     } else {
        const data = await response.json();
        res.status(response.status).json(data);
     }
   } catch(e: any) {
     res.status(500).json({ error: { message: e.message }});
   }
});

// --- API Admin Endpoints ---

// Get all configured models
app.get("/api/models", (req, res) => {
  res.json(storedModels);
});

// Update models array
app.post("/api/models", (req, res) => {
  try {
    const newModels = Array.isArray(req.body) ? req.body : req.body.models;
    if (Array.isArray(newModels)) {
      storedModels = newModels;
      res.json({ success: true, count: storedModels.length });
    } else {
      res.status(400).json({ error: "Invalid data format" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get global settings
app.get("/api/settings", (req, res) => {
  res.json(globalSettings);
});

// Update global settings
app.post("/api/settings", (req, res) => {
  globalSettings = { ...globalSettings, ...req.body };
  res.json({ success: true });
});

// Detect Models endpoint
app.post("/api/detect-models", async (req, res) => {
  const { baseUrl, apiKey } = req.body;
  if (!baseUrl) return res.status(400).json({ error: "baseUrl is required" });
  try {
     const cleanBase = baseUrl.replace(/\/+$/, '');
     const targetUrl = `${cleanBase}/models`;
     
     const response = await fetch(targetUrl, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
     });
     
     if (!response.ok) {
        return res.status(response.status).json({ error: `API Error: ${response.status} ${await response.text()}` });
     }
     
     const data = await response.json();
     res.json(data);
  } catch(e: any) {
     res.status(500).json({ error: e.message });
  }
});

// Get QQ Bot Config
app.get("/api/qqbot", (req, res) => {
  res.json(qqBotConfig);
});

// Update QQ Bot Config
app.post("/api/qqbot", (req, res) => {
  qqBotConfig = { ...qqBotConfig, ...req.body };
  res.json({ success: true });
});


// --- QQ Bot Webhook Routing Logic (Mock/Placeholder for Cloudflare) ---
// This is the active webhook that QQ Open Platform uses
app.post("/api/qq-webhook", async (req, res) => {
  console.log("Received QQ Event Payload:", req.body);
  
  // High-level integration outline for Cloudflare translation:
  // 1. Verify Request Signature using `qqBotConfig.appSecret`
  // 2. Extract content: const userText = req.body?.d?.content;
  // 3. Find default API model: 
  //      const modelId = globalSettings.defaultModelId;
  //      const model = storedModels.find(m => m.id === modelId);
  // 4. Send `userText` & `globalSettings.systemPrompt` to `model.baseUrl` using `model.apiKey`.
  // 5. Stream or wait for text.
  // 6. Post the return response back to QQ Open API to reply to the user.
  
  // Acknowledge receipt to QQ Platform
  res.status(200).json({ status: "received" });
});


// --- Vite Middleware Server Setup --- 
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
