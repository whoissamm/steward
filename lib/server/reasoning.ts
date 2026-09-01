import { retrieve, confidenceLabel, composeOffline, type Hit } from "./retrieval"
import { classifyTopic, followupsFor } from "./topics"
import { getAgent, type Agent } from "./agents"

const DEFAULT_MODEL = "gemini-3.6-flash"

export type Answer = {
  answer: string
  sources: string[]
  confidence: "high" | "medium" | "low"
  abstained: boolean
  why: string
  topic: string
  followups: string[]
  agent: string
  llm: "gemini" | "offline_tfidf"
}

async function callGemini(system: string, userPrompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 512,
          topP: 0.95,
        },
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error("gemini http", res.status, body.slice(0, 200))
      return null
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim()
    return text || null
  } catch (err) {
    console.error("gemini call failed", err)
    return null
  }
}

// Rerank hits so the agent's preferred topics move to the top when ties/near-ties exist.
function rerankForAgent(hits: Hit[], agent: Agent): Hit[] {
  if (agent.preferredTopics.length === 0) return hits
  return [...hits].sort((a, b) => {
    const boost = (h: Hit) => (agent.preferredTopics.includes(h.doc.topic) ? 0.05 : 0)
    return b.score + boost(b) - (a.score + boost(a))
  })
}

export type AskOptions = {
  agentId?: string
  sensorContext?: string
  behaviourSummary?: string
}

export async function askInternal(question: string, opts: AskOptions = {}): Promise<Answer> {
  const agent = getAgent(opts.agentId || "steward")
  const sensorContext = opts.sensorContext ?? ""
  const behaviourSummary = opts.behaviourSummary ?? ""

  const raw = retrieve(question)
  const hits = rerankForAgent(raw, agent)
  const topic = classifyTopic(question)
  const followups = followupsFor(topic)

  const top = hits[0]?.score ?? 0
  const strong: Hit[] = hits.filter((h) => h.score >= 0.12 && h.score >= 0.42 * top)

  // Nothing relevant enough → abstain
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
      agent: agent.id,
      llm: "offline_tfidf",
    }
  }

  const passages = strong.slice(0, 3).map((h) => h.doc.text)
  const sources = strong.slice(0, 3).map((h) => h.doc.source)
  const whyPassage = strong[0].doc.text

  const contextParts: string[] = []
  if (sensorContext) contextParts.push(`Live sensor context: ${sensorContext}`)
  if (behaviourSummary) contextParts.push(`What we know about this farmer's recent activity: ${behaviourSummary}`)
  const contextBlock = contextParts.length > 0 ? contextParts.join("\n\n") + "\n\n" : ""

  const passagesBlock = sources.map((s, i) => `[${s}] ${passages[i]}`).join("\n")
  const prompt = `${contextBlock}Passages:\n${passagesBlock}\n\nFarmer's question: ${question}\n\nAnswer in plain English, 2–4 sentences, ending with the source(s) in brackets.`

  const aiAnswer = await callGemini(agent.systemPrompt, prompt)
  if (aiAnswer) {
    return {
      answer: aiAnswer,
      sources,
      confidence: confidenceLabel(top, strong.length),
      abstained: false,
      why: whyPassage,
      topic,
      followups,
      agent: agent.id,
      llm: "gemini",
    }
  }

  // Offline TF-IDF composer fallback
  const offline = composeOffline(hits, sensorContext)
  return { ...offline, topic, followups, agent: agent.id, llm: "offline_tfidf" }
}
