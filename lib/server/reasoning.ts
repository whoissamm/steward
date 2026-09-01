import { retrieve, confidenceLabel, composeOffline, type Hit } from "./retrieval"
import { classifyTopic, followupsFor } from "./topics"

const SYSTEM_PROMPT = `You are Steward, a plain-speaking AI advisor for small farms in England.
Rules you must follow:
1. Answer ONLY from the passages provided. Never invent facts.
2. If the passages do not contain enough to answer well, reply: "I am not sure — please check with your local adviser or GOV.UK."
3. Use plain English — no jargon, no academic language.
4. Keep answers to 2-4 sentences.
5. Always mention the source(s) you drew from.
6. Never give regulated advice (vet dosing, spray rates, legal disposal) — those are already filtered before reaching you.`

export type Answer = {
  answer: string
  sources: string[]
  confidence: "high" | "medium" | "low"
  abstained: boolean
  why: string
  topic: string
  followups: string[]
}

async function callGemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const client = new GoogleGenerativeAI(key)
    const model = client.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
      systemInstruction: SYSTEM_PROMPT,
    })
    const res = await model.generateContent(prompt)
    return res.response.text().trim()
  } catch (err) {
    console.error("gemini call failed", err)
    return null
  }
}

export async function askInternal(question: string, sensorContext = ""): Promise<Answer> {
  const hits = retrieve(question)
  const topic = classifyTopic(question)
  const followups = followupsFor(topic)

  const top = hits[0]?.score ?? 0
  const strong: Hit[] = hits.filter((h) => h.score >= 0.12 && h.score >= 0.42 * top)

  if (strong.length === 0 || top < 0.06) {
    return {
      answer:
        "I am not sure — the sources I have do not cover that well enough. Please check GOV.UK, AHDB, or ask your local adviser.",
      sources: [],
      confidence: "low",
      abstained: true,
      why: "",
      topic,
      followups,
    }
  }

  const passages = strong.slice(0, 3).map((h) => h.doc.text)
  const sources = strong.slice(0, 3).map((h) => h.doc.source)
  const whyPassage = strong[0].doc.text

  const contextBlock = sensorContext ? `Live sensor context: ${sensorContext}\n\n` : ""
  const passagesBlock = sources.map((s, i) => `[${s}] ${passages[i]}`).join("\n")
  const prompt = `${contextBlock}Passages:\n${passagesBlock}\n\nQuestion: ${question}\nAnswer (plain English, 2-4 sentences, cite sources):`

  const aiAnswer = await callGemini(prompt)
  if (aiAnswer) {
    return {
      answer: aiAnswer,
      sources,
      confidence: confidenceLabel(top, strong.length),
      abstained: false,
      why: whyPassage,
      topic,
      followups,
    }
  }

  // Offline compose (TF-IDF extractive) — always available
  const offline = composeOffline(hits, sensorContext)
  return { ...offline, topic, followups }
}
