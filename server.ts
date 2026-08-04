import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK lazily / safely
const getGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI features will use fallback ideas.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Data Storage Setup (Server-side persistent JSON file)
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "couple_store.json");

interface CoupleRoom {
  profile: {
    coupleCode: string;
    partner1Name: string;
    partner2Name: string;
    anniversaryDate: string;
    statusMessage: string;
  };
  buckets: Array<{
    id: string;
    coupleCode: string;
    title: string;
    category: string;
    status: string;
    targetDate?: string;
    completedDate?: string;
    completedBy?: string;
    createdBy: string;
    location?: string;
    note?: string;
    photoUrl?: string;
    tags: string[];
    likes: number;
    createdAt: string;
  }>;
  memos: Array<{
    id: string;
    coupleCode: string;
    title: string;
    content: string;
    category: string;
    dDate?: string;
    isPinned: boolean;
    colorTag: string;
    createdBy: string;
    photoUrl?: string;
    updatedAt: string;
  }>;
  challenges?: Array<{
    id: string;
    coupleCode: string;
    title: string;
    description: string;
    upgradeRule?: string;
    periodType: string;
    subGoals: Array<{
      id: string;
      title: string;
      targetCount: number;
      currentCount: number;
      unit?: string;
    }>;
    bonusLogs: Array<{
      id: string;
      date: string;
      note: string;
      createdBy: string;
    }>;
    createdBy: string;
    createdAt: string;
    category: string;
    status: string;
  }>;
  trash?: {
    buckets?: any[];
    memos?: any[];
    challenges?: any[];
  };
}

type StoreData = Record<string, CoupleRoom>;

const loadStore = (): StoreData => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading data store:", err);
  }
  return {};
};

const saveStore = (data: StoreData) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing data store:", err);
  }
};

let memoryStore: StoreData = loadStore();

// Default starter data for new couple rooms
const createDefaultRoom = (code: string): CoupleRoom => {
  const diskData = loadStore();
  const templateSource = diskData["LOVE-2026"] || memoryStore["LOVE-2026"];
  if (templateSource) {
    return {
      profile: {
        ...templateSource.profile,
        coupleCode: code,
      },
      buckets: templateSource.buckets.map((b) => ({ ...b, coupleCode: code })),
      memos: templateSource.memos.map((m) => ({ ...m, coupleCode: code })),
      challenges: templateSource.challenges.map((c) => ({ ...c, coupleCode: code })),
      trash: { buckets: [], memos: [], challenges: [] },
    };
  }
  const now = new Date().toISOString();
  return {
    profile: {
      coupleCode: code,
      partner1Name: "태웅",
      partner2Name: "서주",
      anniversaryDate: "2025-05-20",
      statusMessage: "너랑 나랑 둘만의 소중한 기록 ❤️",
    },
    buckets: [],
    memos: [],
    challenges: [],
    trash: { buckets: [], memos: [], challenges: [] },
  };
};

const ensureTrash = (code: string) => {
  if (!memoryStore[code]) return;
  if (!memoryStore[code].trash) {
    memoryStore[code].trash = { buckets: [], memos: [], challenges: [] };
  }
  if (!memoryStore[code].trash!.buckets) memoryStore[code].trash!.buckets = [];
  if (!memoryStore[code].trash!.memos) memoryStore[code].trash!.memos = [];
  if (!memoryStore[code].trash!.challenges) memoryStore[code].trash!.challenges = [];
};

// Ensure default room exists
const DEFAULT_CODE = "LOVE-2026";
if (!memoryStore[DEFAULT_CODE]) {
  memoryStore[DEFAULT_CODE] = createDefaultRoom(DEFAULT_CODE);
  saveStore(memoryStore);
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Get or initialize couple space
app.get("/api/couple/:code", (req, res) => {
  const code = (req.params.code || DEFAULT_CODE).toUpperCase().trim();
  const diskData = loadStore();
  if (diskData[code]) {
    memoryStore[code] = diskData[code];
  } else if (!memoryStore[code]) {
    memoryStore[code] = createDefaultRoom(code);
    saveStore(memoryStore);
  }
  res.json(memoryStore[code]);
});

app.post("/api/couple/init", (req, res) => {
  let { coupleCode } = req.body;
  if (!coupleCode || typeof coupleCode !== "string") {
    coupleCode = DEFAULT_CODE;
  } else {
    coupleCode = coupleCode.toUpperCase().trim();
  }

  if (!memoryStore[coupleCode]) {
    memoryStore[coupleCode] = createDefaultRoom(coupleCode);
    saveStore(memoryStore);
  }

  res.json({ success: true, room: memoryStore[coupleCode] });
});

// Update Profile
app.put("/api/couple/:code/profile", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  if (!memoryStore[code]) {
    memoryStore[code] = createDefaultRoom(code);
  }

  const { partner1Name, partner2Name, anniversaryDate, statusMessage, avatarUrl, coverImage } = req.body;
  memoryStore[code].profile = {
    ...memoryStore[code].profile,
    ...(partner1Name !== undefined && { partner1Name }),
    ...(partner2Name !== undefined && { partner2Name }),
    ...(anniversaryDate !== undefined && { anniversaryDate }),
    ...(statusMessage !== undefined && { statusMessage }),
    ...(avatarUrl !== undefined && { avatarUrl }),
    ...(coverImage !== undefined && { coverImage }),
  };

  saveStore(memoryStore);
  res.json({ success: true, profile: memoryStore[code].profile });
});

// Bucket CRUD
app.post("/api/couple/:code/buckets", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  if (!memoryStore[code]) {
    memoryStore[code] = createDefaultRoom(code);
  }

  const newItem = {
    id: `b_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    coupleCode: code,
    title: req.body.title || "새로운 버킷리스트",
    category: req.body.category || "daily",
    status: req.body.status || "planned",
    targetDate: req.body.targetDate || "",
    completedDate: req.body.completedDate || "",
    completedBy: req.body.completedBy || "",
    createdBy: req.body.createdBy || "나",
    location: req.body.location || "",
    note: req.body.note || "",
    photoUrl: req.body.photoUrl || "",
    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  memoryStore[code].buckets.unshift(newItem);
  saveStore(memoryStore);
  res.json({ success: true, item: newItem });
});

app.put("/api/couple/:code/buckets/:id", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const id = req.params.id;
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });

  const idx = memoryStore[code].buckets.findIndex((b) => b.id === id);
  if (idx === -1) return res.status(404).json({ error: "Item not found" });

  memoryStore[code].buckets[idx] = {
    ...memoryStore[code].buckets[idx],
    ...req.body,
  };

  saveStore(memoryStore);
  res.json({ success: true, item: memoryStore[code].buckets[idx] });
});

app.delete("/api/couple/:code/buckets/:id", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const id = req.params.id;
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });
  ensureTrash(code);

  const itemIndex = memoryStore[code].buckets.findIndex((b) => b.id === id);
  if (itemIndex !== -1) {
    const [deletedItem] = memoryStore[code].buckets.splice(itemIndex, 1);
    memoryStore[code].trash!.buckets.unshift(deletedItem);
  }

  saveStore(memoryStore);
  res.json({ success: true, trash: memoryStore[code].trash });
});

// Reorder Buckets
app.put("/api/couple/:code/reorder/buckets", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const { itemIds } = req.body;
  if (!memoryStore[code] || !Array.isArray(itemIds)) return res.status(400).json({ error: "Invalid payload" });

  const existingMap = new Map(memoryStore[code].buckets.map((b) => [b.id, b]));
  const reordered: any[] = [];
  itemIds.forEach((id: string) => {
    const item = existingMap.get(id);
    if (item) {
      reordered.push(item);
      existingMap.delete(id);
    }
  });
  existingMap.forEach((item) => reordered.push(item));

  memoryStore[code].buckets = reordered;
  saveStore(memoryStore);
  res.json({ success: true, buckets: reordered });
});

app.post("/api/couple/:code/buckets/:id/like", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const id = req.params.id;
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });

  const item = memoryStore[code].buckets.find((b) => b.id === id);
  if (item) {
    item.likes = (item.likes || 0) + 1;
    saveStore(memoryStore);
    res.json({ success: true, likes: item.likes });
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

// Memo CRUD
app.post("/api/couple/:code/memos", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  if (!memoryStore[code]) {
    memoryStore[code] = createDefaultRoom(code);
  }

  const newMemo = {
    id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    coupleCode: code,
    title: req.body.title || "새 메모",
    content: req.body.content || "",
    category: req.body.category || "memo",
    dDate: req.body.dDate || "",
    isPinned: !!req.body.isPinned,
    colorTag: req.body.colorTag || "rose",
    createdBy: req.body.createdBy || "나",
    photoUrl: req.body.photoUrl || "",
    updatedAt: new Date().toISOString(),
  };

  memoryStore[code].memos.unshift(newMemo);
  saveStore(memoryStore);
  res.json({ success: true, item: newMemo });
});

app.put("/api/couple/:code/memos/:id", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const id = req.params.id;
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });

  const idx = memoryStore[code].memos.findIndex((m) => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Item not found" });

  memoryStore[code].memos[idx] = {
    ...memoryStore[code].memos[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  saveStore(memoryStore);
  res.json({ success: true, item: memoryStore[code].memos[idx] });
});

app.delete("/api/couple/:code/memos/:id", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const id = req.params.id;
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });
  ensureTrash(code);

  const itemIndex = memoryStore[code].memos.findIndex((m) => m.id === id);
  if (itemIndex !== -1) {
    const [deletedItem] = memoryStore[code].memos.splice(itemIndex, 1);
    memoryStore[code].trash!.memos.unshift(deletedItem);
  }

  saveStore(memoryStore);
  res.json({ success: true, trash: memoryStore[code].trash });
});

// Reorder Memos
app.put("/api/couple/:code/reorder/memos", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const { itemIds } = req.body;
  if (!memoryStore[code] || !Array.isArray(itemIds)) return res.status(400).json({ error: "Invalid payload" });

  const existingMap = new Map(memoryStore[code].memos.map((m) => [m.id, m]));
  const reordered: any[] = [];
  itemIds.forEach((id: string) => {
    const item = existingMap.get(id);
    if (item) {
      reordered.push(item);
      existingMap.delete(id);
    }
  });
  existingMap.forEach((item) => reordered.push(item));

  memoryStore[code].memos = reordered;
  saveStore(memoryStore);
  res.json({ success: true, memos: reordered });
});

// Challenge CRUD
app.post("/api/couple/:code/challenges", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  if (!memoryStore[code]) {
    memoryStore[code] = createDefaultRoom(code);
  }
  if (!memoryStore[code].challenges) {
    memoryStore[code].challenges = [];
  }

  const newChallenge = {
    id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    coupleCode: code,
    title: req.body.title || "새로운 챌린지 🏆",
    description: req.body.description || "",
    upgradeRule: req.body.upgradeRule || "",
    periodType: req.body.periodType || "monthly",
    challengeType: req.body.challengeType || "achievement",
    category: req.body.category || "drink",
    status: req.body.status || "active",
    subGoals: Array.isArray(req.body.subGoals) ? req.body.subGoals : [],
    bonusLogs: Array.isArray(req.body.bonusLogs) ? req.body.bonusLogs : [],
    createdBy: req.body.createdBy || "나",
    createdAt: new Date().toISOString(),
  };

  memoryStore[code].challenges.unshift(newChallenge);
  saveStore(memoryStore);
  res.json({ success: true, item: newChallenge });
});

app.put("/api/couple/:code/challenges/:id", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const id = req.params.id;
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });

  if (!memoryStore[code].challenges) memoryStore[code].challenges = [];

  const idx = memoryStore[code].challenges.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Challenge not found" });

  memoryStore[code].challenges[idx] = {
    ...memoryStore[code].challenges[idx],
    ...req.body,
  };

  saveStore(memoryStore);
  res.json({ success: true, item: memoryStore[code].challenges[idx] });
});

app.delete("/api/couple/:code/challenges/:id", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const id = req.params.id;
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });
  if (!memoryStore[code].challenges) memoryStore[code].challenges = [];
  ensureTrash(code);

  const itemIndex = memoryStore[code].challenges.findIndex((c) => c.id === id);
  if (itemIndex !== -1) {
    const [deletedItem] = memoryStore[code].challenges.splice(itemIndex, 1);
    memoryStore[code].trash!.challenges.unshift(deletedItem);
  }

  saveStore(memoryStore);
  res.json({ success: true, trash: memoryStore[code].trash });
});

// Trash APIs
app.get("/api/couple/:code/trash", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });
  ensureTrash(code);
  res.json({ success: true, trash: memoryStore[code].trash });
});

app.post("/api/couple/:code/trash/restore", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const { type, id } = req.body; // type: 'buckets' | 'memos' | 'challenges'
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });
  ensureTrash(code);

  if (type === "buckets") {
    const idx = memoryStore[code].trash!.buckets.findIndex((b) => b.id === id);
    if (idx !== -1) {
      const [restored] = memoryStore[code].trash!.buckets.splice(idx, 1);
      memoryStore[code].buckets.unshift(restored);
    }
  } else if (type === "memos") {
    const idx = memoryStore[code].trash!.memos.findIndex((m) => m.id === id);
    if (idx !== -1) {
      const [restored] = memoryStore[code].trash!.memos.splice(idx, 1);
      memoryStore[code].memos.unshift(restored);
    }
  } else if (type === "challenges") {
    if (!memoryStore[code].challenges) memoryStore[code].challenges = [];
    const idx = memoryStore[code].trash!.challenges.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const [restored] = memoryStore[code].trash!.challenges.splice(idx, 1);
      memoryStore[code].challenges.unshift(restored);
    }
  }

  saveStore(memoryStore);
  res.json({
    success: true,
    buckets: memoryStore[code].buckets,
    memos: memoryStore[code].memos,
    challenges: memoryStore[code].challenges,
    trash: memoryStore[code].trash,
  });
});

app.post("/api/couple/:code/trash/empty", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const { type } = req.body; // 'buckets' | 'memos' | 'challenges' | 'all'
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });
  ensureTrash(code);

  if (type === "buckets" || type === "all") memoryStore[code].trash!.buckets = [];
  if (type === "memos" || type === "all") memoryStore[code].trash!.memos = [];
  if (type === "challenges" || type === "all") memoryStore[code].trash!.challenges = [];

  saveStore(memoryStore);
  res.json({ success: true, trash: memoryStore[code].trash });
});

app.post("/api/couple/:code/trash/purge", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const { type, id } = req.body;
  if (!memoryStore[code]) return res.status(404).json({ error: "Space not found" });
  ensureTrash(code);

  if (type === "buckets") {
    memoryStore[code].trash!.buckets = memoryStore[code].trash!.buckets.filter((b) => b.id !== id);
  } else if (type === "memos") {
    memoryStore[code].trash!.memos = memoryStore[code].trash!.memos.filter((m) => m.id !== id);
  } else if (type === "challenges") {
    memoryStore[code].trash!.challenges = memoryStore[code].trash!.challenges.filter((c) => c.id !== id);
  }

  saveStore(memoryStore);
  res.json({ success: true, trash: memoryStore[code].trash });
});

// Reorder Challenges
app.put("/api/couple/:code/reorder/challenges", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const { itemIds } = req.body;
  if (!memoryStore[code] || !Array.isArray(itemIds)) return res.status(400).json({ error: "Invalid payload" });

  if (!memoryStore[code].challenges) memoryStore[code].challenges = [];
  const existingMap = new Map(memoryStore[code].challenges.map((c) => [c.id, c]));
  const reordered: any[] = [];
  itemIds.forEach((id: string) => {
    const item = existingMap.get(id);
    if (item) {
      reordered.push(item);
      existingMap.delete(id);
    }
  });
  existingMap.forEach((item) => reordered.push(item));

  memoryStore[code].challenges = reordered;
  saveStore(memoryStore);
  res.json({ success: true, challenges: reordered });
});

// Gemini AI Recommendation Endpoint
app.post("/api/ai/bucket-ideas", async (req, res) => {
  try {
    const { theme, category, season } = req.body;
    const ai = getGeminiAI();

    if (!ai) {
      // Fallback response if no API key
      return res.json({
        ideas: [
          {
            title: "밤공기 마시며 심야 영화관 자차 데이트 🎬",
            category: "activity",
            description: "심야 영화 상영 끝나고 근처 한강 드라이브하며 속마음 나누기",
            estimatedCost: "약 3~4만원",
            season: "사계절",
          },
          {
            title: "서로에게 딱 어울리는 향수 서로 조향해주기 🧪",
            category: "activity",
            description: "향수 원데이 클래스에서 상대방 이미지에 어울리는 하나뿐인 니치 향수 만들기",
            estimatedCost: "1인당 5~7만원",
            season: "사계절",
          },
          {
            title: "사계절 우리 둘만의 시밀러룩 인스탁스 필름앨범 만들기 📸",
            category: "anniversary",
            description: "봄, 여름, 가을, 겨울 매 계절마다 한 장씩 찍어 아날로그 앨범에 보관하기",
            estimatedCost: "필름값 약 2만원",
            season: "사계절",
          },
        ],
      });
    }

    const prompt = `너는 감성적이고 센스있는 커플 데이트 및 버킷리스트 컨설턴트야.
대한민국 커플들이 함께하면 평생 기억에 남을만한 사랑스럽고 특별한 버킷리스트 아이디어 4가지를 한국어로 추천해줘.
요청 테마: ${theme || "소소하지만 로맨틱한 일상 및 여행"}
요청 카테고리: ${category || "전체"}
요청 계절: ${season || "사계절"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "커플을 위한 세련되고 감성적인 버킷리스트 아이디어를 JSON 배열 형식으로만 응답해줘.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "이모지가 포함된 흥미롭고 구체적인 버킷리스트 제목" },
              category: { type: Type.STRING, description: "travel, food, activity, purchase, anniversary, daily 중 하나" },
              description: { type: Type.STRING, description: "데이트 방식과 추천 이유를 설명하는 따뜻한 2문장" },
              season: { type: Type.STRING, description: "추천 계절 (예: 봄, 여름, 가을, 겨울, 사계절)" },
              estimatedCost: { type: Type.STRING, description: "대략적인 예산 범위" },
            },
            required: ["title", "category", "description"],
          },
        },
      },
    });

    const jsonText = response.text ? response.text.trim() : "[]";
    const ideas = JSON.parse(jsonText);
    res.json({ ideas });
  } catch (err: any) {
    console.error("Gemini AI API Error:", err);
    res.status(500).json({
      error: "AI 추천 생성 중 오류가 발생했습니다.",
      details: err.message,
    });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // HTML SPA Fallback in Development
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Couple Bucket List Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
