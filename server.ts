import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { studyChapters } from "./src/data/studyData.js"; // Esmodule resolved

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Prepare knowledge base text for AI Tutor context
const knowledgeBase = studyChapters
  .map((chapter) => {
    let text = `## Chapter: ${chapter.title}\n`;
    chapter.sections.forEach((sec) => {
      text += `### Section: ${sec.title}\n`;
      if (sec.subtitle) text += `Subtitle: ${sec.subtitle}\n`;
      text += `Details:\n${sec.details.map((d) => `- ${d}`).join("\n")}\n`;
      if (sec.tips) text += `Tips: ${sec.tips.join(", ")}\n`;
    });
    return text;
  })
  .join("\n\n");

// AI Tutor Chat API
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array provided." });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.json({
        text: "💡 AI 법률 튜터 기능을 이용하려면 우측 상단 **Settings > Secrets**에 실물 `GEMINI_API_KEY`를 설정해주세요! 현재는 등록된 키가 없어 데모 모드로 기본 답변만 지원합니다.\n\n공정거래법 공부에 관해 궁금한 점을 적어주시면, 제공해주신 핵심 공부 노트를 기반으로 AI 튜터가 친절하고 상세하게 안내해 드립니다.",
      });
    }

    // Format chat contents for the SDK
    // The SDK expects contents in the chat structure or we can pass the whole prompt with system instruction.
    // For simplicity and solid custom instruction, we do a generateContent call with system instructions.
    const systemInstruction = `너는 대한민국 공정거래법 전문 AI 법률 튜터이다. 사용자는 공정거래 관련 시험(가맹거래사, 행정사, 기업 공정거래 실무 등)을 공부하고 있다.
다음 제공되는 공정거래 학습 교안 내용을 절대적인 사실 근거로 삼아 답변하되, 질문에 친절하고 상세하게 한글로 답변해라.
만약 교안에 기재되지 않은 외부 내용에 대해 질문할 경우, 법적인 오류가 생기지 않는 범위 내에서 정확하고 신뢰할 수 있게 해설하고, 교안의 어떤 파트와 관련이 깊은지 매칭하여 설명해라.
수험생의 동기를 고취시키는 정중하고 친근한 말투('~합니다', '~입니다')를 사용해라.

[공정거래 핵심 학습 노벨티 교안]
${knowledgeBase}`;

    // Convert client-side message list to Gemini contents
    const geminiContents = messages.map((m: any) => {
      return {
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "죄송합니다. 답변을 생성하지 못했습니다." });
  } catch (error: any) {
    console.error("AI Tutor API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during AI processing." });
  }
});

// AI Quiz Generator API
app.post("/api/quiz/generate", async (req, res) => {
  try {
    const { topicId } = req.body;
    if (!topicId) {
      return res.status(400).json({ error: "topicId is required." });
    }

    const chapter = studyChapters.find((c) => c.id === topicId) || studyChapters[0];
    const chapterText = `## 대주제: ${chapter.title}\n` + chapter.sections.map(s => `- ${s.title}: ${s.details.join(" ")}`).join("\n");

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.status(400).json({
        error: "NO_API_KEY",
        message: "Gemini API Key가 설정되지 않았습니다. Settings -> Secrets에서 설정해주세요.",
      });
    }

    const prompt = `대한민국 공정거래법 주제 중 다음 [선택된 챕터 교안]을 바탕으로, 수험생이 풀 수 있는 고품질 기출 예상 퀴즈 3문항을 새로 생성해라.
반드시 다채롭게 OX 퀴즈('ox' 타입)와 4지선다형 퀴즈('multiple' 타입)를 섞어서 출제하고, 오답인 이유와 정답인 근거를 논리정연하고 상세하게 'explanation'에 한글로 기술해라.
사지선다형('multiple')의 경우 options는 4개의 보기 문항이어야 하며, answer는 정답 인덱스 문자열("0", "1", "2" 또는 "3")을 담아라.
OX 퀴즈('ox')의 경우 options는 ["O", "X"] 이어야 하며, answer는 정답 문자열("O" 또는 "X")을 담아라.

[선택된 챕터 교안]
${chapterText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "너는 공정거래 기출문제를 완벽하게 예측하는 최고 난이도 법률 출제 위원이다. 지정된 규격의 JSON 스키마를 철저히 지켜 정답과 오답 해설이 명확한 퀴즈 3문항을 출제해라.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "문제 질문 내용 (한글)" },
              type: { type: Type.STRING, description: "'multiple' 또는 'ox'" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "4지선다형일 경우 4개의 선택지, OX일 경우 ['O', 'X']"
              },
              answer: {
                type: Type.STRING,
                description: "정답 값. OX는 'O' 또는 'X'. 사지선다는 인덱스 번호인 '0', '1', '2', '3' 중 하나"
              },
              explanation: { type: Type.STRING, description: "출제 의도와 구체적인 공정거래 법리 해설 (한글)" }
            },
            required: ["question", "type", "options", "answer", "explanation"]
          }
        },
        temperature: 0.8,
      },
    });

    const quizDataText = response.text || "[]";
    const quizList = JSON.parse(quizDataText);
    res.json({ quizzes: quizList });
  } catch (error: any) {
    console.error("Quiz Generator API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during quiz generation." });
  }
});

// Set up Vite and Frontend routing
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
    console.log(`[Full-Stack Server] running on http://localhost:${PORT}`);
  });
}

startServer();
