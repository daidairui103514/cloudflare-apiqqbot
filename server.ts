import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { v4 as uuidv4 } from "uuid";
import type { ProviderModel, GlobalSettings } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// --- Auth Setup & Storage ---
interface AppUser {
  id: string;
  username: string;
  password?: string;
  role: "admin" | "guest";
  apiKey?: string;
  createdAt: string;
}

const adminUser = process.env.ADMIN_USER || "admin";
const adminPass = process.env.ADMIN_PASSWORD || "admin";

let storedUsers: AppUser[] = [];
const activeSessions: Record<string, { role: "admin" | "guest", username: string, apiKey?: string }> = {};
let validRegistrationCodes: string[] = [];

app.post("/api/register", (req, res) => {
   const { username, password, registrationCode } = req.body;
   if (!registrationCode || !validRegistrationCodes.includes(registrationCode)) {
      return res.status(400).json({error: "无效或不存在的注册码"});
   }
   if(storedUsers.some(u => u.username === username) || username === adminUser) {
     return res.status(400).json({error: "该用户名已被使用或保留"});
   }
   // Remove the code since it is used
   validRegistrationCodes = validRegistrationCodes.filter(c => c !== registrationCode);

   const newUser: AppUser = {
     id: uuidv4(),
     username,
     password,
     role: "guest",
     apiKey: "sk-" + uuidv4().replace(/-/g, ""),
     createdAt: new Date().toISOString()
   };
   storedUsers.push(newUser);
   return res.json({success: true});
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  if (username === adminUser && password === adminPass) {
    const token = uuidv4();
    activeSessions[token] = { role: "admin", username, apiKey: "" };
    return res.json({ token, role: "admin", username, apiKey: "" });
  }

  const u = storedUsers.find(user => user.username === username && user.password === password);
  if(u) {
     const token = uuidv4();
     activeSessions[token] = { role: u.role, username: u.username, apiKey: u.apiKey };
     return res.json({ token, role: u.role, username: u.username, apiKey: u.apiKey });
  }

  return res.status(401).json({ error: "账号或密码错误" });
});

app.get("/api/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !activeSessions[token]) {
    return res.status(401).json({ error: "未登录" });
  }
  const session = activeSessions[token];
  res.json({ role: session.role, username: session.username, apiKey: session.apiKey });
});

app.post("/api/logout", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) delete activeSessions[token];
  res.json({ success: true });
});

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !activeSessions[token]) {
    return res.status(401).json({ error: "未登录", loggedOut: true });
  }
  (req as any).user = activeSessions[token];
  next();
};

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !activeSessions[token] || activeSessions[token].role !== "admin") {
    return res.status(403).json({ error: "普通成员无权执行此操作" });
  }
  next();
};

app.get("/api/users", requireAdmin, (req, res) => {
   res.json(storedUsers.filter(u => u.role === "guest").map(u => ({ id: u.id, username: u.username, createdAt: u.createdAt, apiKey: u.apiKey })));
});

app.post("/api/users/add", requireAdmin, (req, res) => {
   const { username, password } = req.body;
   if(storedUsers.some(u => u.username === username) || username === adminUser) {
     return res.status(400).json({error: "该用户名已被使用或保留"});
   }
   const newUser: AppUser = {
     id: uuidv4(),
     username,
     password,
     role: "guest",
     apiKey: "sk-" + uuidv4().replace(/-/g, ""),
     createdAt: new Date().toISOString()
   };
   storedUsers.push(newUser);
   res.json({ success: true, user: { id: newUser.id, username: newUser.username, createdAt: newUser.createdAt, apiKey: newUser.apiKey } });
});

app.delete("/api/users/:id", requireAdmin, (req, res) => {
   storedUsers = storedUsers.filter(u => u.id !== req.params.id);
   res.json({ success: true });
});

app.get("/api/registration-codes", requireAdmin, (req, res) => {
   res.json({ codes: validRegistrationCodes });
});

app.post("/api/registration-codes/generate", requireAdmin, (req, res) => {
   const newCode = Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 6)).join('-').toUpperCase();
   validRegistrationCodes.push(newCode);
   res.json({ success: true, code: newCode });
});

app.delete("/api/registration-codes/:code", requireAdmin, (req, res) => {
   validRegistrationCodes = validRegistrationCodes.filter(c => c !== req.params.code);
   res.json({ success: true });
});

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
  webAiModelId: "",
  streamEnabled: true,
  contextRounds: 10,
};

let tokenUsageStats: Record<string, number> = {};

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
   if (requestedModelCode === "web-ai" && globalSettings.webAiModelId) {
      provider = storedModels.find(m => m.id === globalSettings.webAiModelId);
   } else if (!provider && globalSettings.defaultModelId) {
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
        
        // simple simulation for token stats on stream (rough estimation)
        // A single completion could be anywhere from 20 to 2000 tokens
        // we'll just add a fake 100 on every stream call for metrics since true token length isn't computed here easily.
        tokenUsageStats[provider.id] = (tokenUsageStats[provider.id] || 0) + 100;

        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
     } else {
        const data = await response.json();
        if (data.usage?.total_tokens) {
           tokenUsageStats[provider.id] = (tokenUsageStats[provider.id] || 0) + data.usage.total_tokens;
        }
        res.status(response.status).json(data);
     }
   } catch(e: any) {
     res.status(500).json({ error: { message: e.message }});
   }
});

// --- API Admin Endpoints ---

// Get token stats
app.get("/api/stats", requireAuth, (req, res) => {
  res.json({ tokenUsage: tokenUsageStats });
});

// Get all configured models
app.get("/api/models", requireAuth, (req, res) => {
  res.json(storedModels);
});

// Update models array
app.post("/api/models", requireAdmin, (req, res) => {
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
app.get("/api/settings", requireAuth, (req, res) => {
  res.json(globalSettings);
});

// Update global settings
app.post("/api/settings", requireAdmin, (req, res) => {
  globalSettings = { ...globalSettings, ...req.body };
  res.json({ success: true });
});

// Detect Models endpoint
app.post("/api/detect-models", requireAdmin, async (req, res) => {
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
     
     const responseText = await response.text();
     let data;
     try {
        data = JSON.parse(responseText);
     } catch (parseError) {
        return res.status(500).json({ error: "API返回了非JSON数据 (通常是由于网关屏蔽或无效服务URL)。" });
     }
     res.json(data);
  } catch(e: any) {
     res.status(500).json({ error: e.message });
  }
});


// Catch matching /api requests that aren't defined -> return 404 JSON instead of HTML
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API Route Not Found" });
});

// Global Express Error Handler -> returns JSON instead of default HTML
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err?.message || String(err) });
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
