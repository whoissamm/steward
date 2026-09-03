import { retrieve, confidenceLabel, composeOffline, type Hit } from "./retrieval"
import { classifyTopic, followupsFor } from "./topics"
import { getAgent, type Agent } from "./agents"
import { AGENT_NAMES, type AgentId } from "../agent-names"

const DEFAULT_MODEL = "gemini-3.6-flash"

export type AgentAction =
  | { kind: "add_event"; date: string; title: string; category?: "todo" | "advisory" | "weather" | "scheme" }
  | { kind: "add_todo"; text: string; category?: "weather" | "livestock" | "soil" | "grants" | "records" | "general" }
  | { kind: "mark_todo_done"; id_or_text: string }
  | { kind: "log_note"; text: string }

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
  actions: AgentAction[]
}

export type MultimodalPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }

type GeminiContent = { role: "user" | "model"; parts: MultimodalPart[] }

/**
 * Build the Gemini `contents` array. If prior chat history is provided we
 * prepend it (mapped: user → user, assistant → model) so the model has
 * conversational memory across turns.
 */
function buildContents(
  parts: MultimodalPart[],
  history?: { role: "user" | "assistant"; text: string }[],
): GeminiContent[] {
  const contents: GeminiContent[] = []
  if (history && history.length > 0) {
    // Cap: last 6 turns keeps prompt small
    for (const h of history.slice(-6)) {
      contents.push({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.text }],
      })
    }
  }
  contents.push({ role: "user", parts })
  return contents
}

async function callGemini(
  system: string,
  parts: MultimodalPart[],
  history?: { role: "user" | "assistant"; text: string }[],
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  const contents = buildContents(parts, history)
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { temperature: 0.55, maxOutputTokens: 700, topP: 0.95 },
  })
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": key },
      body,
    })
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1100))
      const retry = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-goog-api-key": key },
        body,
      })
      if (!retry.ok) return null
      const data2 = (await retry.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
      return data2.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() || null
    }
    if (!res.ok) {
      const errBody = await res.text().catch(() => "")
      console.error("gemini http", res.status, errBody.slice(0, 200))
      return null
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() || null
  } catch (err) {
    console.error("gemini call failed", err)
    return null
  }
}

function rerankForAgent(hits: Hit[], agent: Agent): Hit[] {
  if (agent.preferredTopics.length === 0) return hits
  return [...hits].sort((a, b) => {
    const boost = (h: Hit) => (agent.preferredTopics.includes(h.doc.topic) ? 0.05 : 0)
    return b.score + boost(b) - (a.score + boost(a))
  })
}

/** Parse and strip <actions>[...]</actions> or ```json[...]``` JSON blocks from an LLM reply. */
function extractActions(text: string): { cleanText: string; actions: AgentAction[] } {
  const actions: AgentAction[] = []
  let clean = text

  const tagRe = /<actions>([\s\S]*?)<\/actions>/gi
  clean = clean.replace(tagRe, (_, body: string) => {
    tryParse(body, actions)
    return ""
  })

  // Fallback: fenced ```json [...] ``` block containing an array of actions
  const fenceRe = /```(?:json)?\s*(\[[\s\S]*?\])\s*```/gi
  clean = clean.replace(fenceRe, (whole, body: string) => {
    const before = actions.length
    tryParse(body, actions)
    return actions.length > before ? "" : whole
  })

  // Try to salvage a bare JSON array of actions at the end of the reply
  const bareRe = /\n(\[[\s\S]*?\])\s*$/
  const bare = clean.match(bareRe)
  if (bare) {
    const before = actions.length
    tryParse(bare[1], actions)
    if (actions.length > before) clean = clean.replace(bareRe, "").trim()
  }

  // Strip leaked reasoning fragments (single-quoted or backtick-quoted JSON
  // key snippets like `07"` or `category: "todo"` that Gemini sometimes emits
  // mid-thought when it hasn't been asked to think out loud).
  clean = clean.replace(/`[^`]{0,40}`/g, (m) => (/[:{"]/.test(m) ? "" : m))
  clean = clean.replace(/\s{2,}/g, " ").trim()

  return { cleanText: clean, actions }
}

function tryParse(raw: string, out: AgentAction[]) {
  try {
    const parsed = JSON.parse(raw.trim()) as unknown
    if (Array.isArray(parsed)) {
      for (const item of parsed) if (isValidAction(item)) out.push(item)
    }
  } catch {
    // ignore malformed
  }
}

function isValidAction(v: unknown): v is AgentAction {
  if (!v || typeof v !== "object") return false
  const kind = (v as { kind?: unknown }).kind
  if (typeof kind !== "string") return false
  return ["add_event", "add_todo", "mark_todo_done", "log_note"].includes(kind)
}

export type AskOptions = {
  agentId?: string
  sensorContext?: string
  behaviourSummary?: string
  profileContext?: string
  imageBase64?: string
  imageMime?: string
  voiceGender?: "male" | "female"
  history?: { role: "user" | "assistant"; text: string }[]
}

/**
 * Swap the male name in the agent's system prompt for the female-set name
 * when the farmer prefers a female voice, so the agent introduces themselves
 * consistently in either voice. Example: "You are Joseph" → "You are Sarah".
 */
function resolveSystemPrompt(agent: Agent, voiceGender: "male" | "female"): string {
  if (voiceGender === "male") return agent.systemPrompt
  const set = AGENT_NAMES[agent.id as AgentId]
  if (!set) return agent.systemPrompt
  // Replace the male name with the female one everywhere it appears.
  return agent.systemPrompt.split(set.male).join(set.female)
}

const TOOL_INSTRUCTIONS = `

TOOL USE (silent):
When — and only when — the farmer has clearly asked you to do one of these things, you may append an <actions>[...]</actions> block at the very end of your reply. Nothing else about the block should appear in your visible text. The block, if present, must be raw JSON in this exact schema, and only these kinds are valid:
  { "kind": "add_event", "date": "YYYY-MM-DD", "title": "…", "category": "todo|advisory|weather|scheme" }
  { "kind": "add_todo", "text": "…", "category": "weather|livestock|soil|grants|records|general" }
  { "kind": "mark_todo_done", "id_or_text": "…" }
  { "kind": "log_note", "text": "…" }
Rules:
- If you write actions, write ONLY the tag + JSON, no commentary, no code fences, no explanations about which kind you picked.
- If the farmer did not clearly ask you to change anything, omit the block entirely.
- Always resolve relative dates yourself (today, tomorrow, next Monday) into a real YYYY-MM-DD using the Today value you were given.
- Your visible reply is a normal, natural, warm sentence-or-two — as if you'd already quietly done the thing.`

export async function askInternal(question: string, opts: AskOptions = {}): Promise<Answer> {
  const agent = getAgent(opts.agentId || "steward")
  const voiceGender = opts.voiceGender ?? "male"
  const baseSystem = resolveSystemPrompt(agent, voiceGender)
  const sensorContext = opts.sensorContext ?? ""
  const behaviourSummary = opts.behaviourSummary ?? ""
  const profileContext = opts.profileContext ?? ""

  const raw = retrieve(question)
  const hits = rerankForAgent(raw, agent)
  const topic = classifyTopic(question)
  const followups = followupsFor(topic)

  const top = hits[0]?.score ?? 0
  const strong: Hit[] = hits.filter((h) => h.score >= 0.15 && h.score >= 0.42 * top)
  // Only enter strict cited mode when the KB *clearly* covers this question.
  // Weak matches drop through to the warm general path so we don't force a fake citation.
  const hasStrongKb = strong.length > 0 && top >= 0.18

  const contextParts: string[] = []
  if (sensorContext) contextParts.push(`Live sensor context: ${sensorContext}`)
  if (behaviourSummary) contextParts.push(`Recent farmer activity: ${behaviourSummary}`)
  if (profileContext) contextParts.push(`Farmer's current state (calendar, todos, streak): ${profileContext}`)

  // --- Strong KB match: cited farm answer (existing behaviour + tool actions) ---
  if (hasStrongKb) {
    const passages = strong.slice(0, 3).map((h) => h.doc.text)
    const sources = strong.slice(0, 3).map((h) => h.doc.source)
    const whyPassage = strong[0].doc.text

    const passagesBlock = sources.map((s, i) => `[${s}] ${passages[i]}`).join("\n")
    const prompt =
      (contextParts.length > 0 ? contextParts.join("\n\n") + "\n\n" : "") +
      `Passages:\n${passagesBlock}\n\nFarmer's question: ${question}\n\nAnswer in plain English, 2–4 sentences, ending with the source(s) in brackets.`

    const parts: MultimodalPart[] = [{ text: prompt }]
    if (opts.imageBase64 && opts.imageMime) {
      parts.push({ inlineData: { mimeType: opts.imageMime, data: opts.imageBase64 } })
    }

    const raw = await callGemini(baseSystem + TOOL_INSTRUCTIONS, parts, opts.history)
    if (raw) {
      const { cleanText, actions } = extractActions(raw)
      return {
        answer: cleanText,
        sources,
        confidence: confidenceLabel(top, strong.length),
        abstained: false,
        why: whyPassage,
        topic,
        followups,
        agent: agent.id,
        llm: "gemini",
        actions,
      }
    }

    const offline = composeOffline(hits, sensorContext)
    return { ...offline, topic, followups, agent: agent.id, llm: "offline_tfidf", actions: [] }
  }

  // --- No strong KB match: general/companion answer (warm, no fake citations) ---
  const generalSystem =
    baseSystem.replace(/Rules you MUST follow:[\s\S]*?(?=\n\n|$)/, "") + `
For this reply you do NOT have a matching document in the farm knowledge base — the farmer is asking something general (chat, wellbeing, planning, life on the farm). Answer warmly and briefly from your own knowledge, in plain English, 2–4 sentences. Do NOT invent citations or scheme rules. If they ask about regulated advice (vet dosing, spray rates, disposal) still refuse and refer to a professional. If they seem in distress, prioritise their wellbeing and mention the Farming Community Network helpline (03000 111 999).
` + TOOL_INSTRUCTIONS

  const prompt =
    (contextParts.length > 0 ? contextParts.join("\n\n") + "\n\n" : "") +
    `Farmer's message: ${question}\n\nReply as their trusted farm companion (2–4 sentences, plain English).`

  const parts: MultimodalPart[] = [{ text: prompt }]
  if (opts.imageBase64 && opts.imageMime) {
    parts.push({ inlineData: { mimeType: opts.imageMime, data: opts.imageBase64 } })
  }

  const raw2 = await callGemini(generalSystem, parts, opts.history)
  if (raw2) {
    const { cleanText, actions } = extractActions(raw2)
    return {
      answer: cleanText,
      sources: [],
      confidence: "medium",
      abstained: false,
      why: "",
      topic,
      followups,
      agent: agent.id,
      llm: "gemini",
      actions,
    }
  }

  // Complete fallback: neither KB match nor Gemini reachable
  return {
    answer:
      "I'm having trouble reaching the AI right now (this can happen on the free plan when a lot of farmers use it at once). Give it 30 seconds and ask again, or rephrase — I'll be right with you.",
    sources: [],
    confidence: "low",
    abstained: true,
    why: "",
    topic,
    followups,
    agent: agent.id,
    llm: "offline_tfidf",
    actions: [],
  }
}
