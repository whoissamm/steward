import { KB_DOCS, type KBDoc } from "./kb"

const STOP = new Set([
  "a","an","the","is","in","of","and","to","it","for","on","with","that","this","at","by","from","be","as","or","are","was","were","but","not","i","you","your","my","we","our",
])

function tokenise(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z]+/g) ?? []
  return matches.filter((t) => !STOP.has(t) && t.length >= 3)
}

const corpus = KB_DOCS.map((doc) => `${doc.text} ${doc.keywords}`)
const docTokens = corpus.map(tokenise)
const N = corpus.length

const df = new Map<string, number>()
for (const dt of docTokens) {
  for (const w of new Set(dt)) df.set(w, (df.get(w) ?? 0) + 1)
}
const idf = new Map<string, number>()
for (const [w, count] of df) idf.set(w, Math.log((N + 1) / (count + 1)) + 1)

function tfidf(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
  const n = tokens.length || 1
  const out = new Map<string, number>()
  for (const [w, c] of tf) out.set(w, (c / n) * (idf.get(w) ?? 0))
  return out
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let num = 0
  for (const [w, v] of b) num += (a.get(w) ?? 0) * v
  let na = 0
  for (const v of a.values()) na += v * v
  let nb = 0
  for (const v of b.values()) nb += v * v
  if (na === 0 || nb === 0) return 0
  return num / (Math.sqrt(na) * Math.sqrt(nb))
}

const precomputedDocVecs = docTokens.map(tfidf)

export type Hit = { doc: KBDoc; score: number }

export function retrieve(question: string, topK = 5): Hit[] {
  const qVec = tfidf(tokenise(question))
  const scored = precomputedDocVecs.map((dv, i) => ({ doc: KB_DOCS[i], score: cosine(qVec, dv) }))
  scored.sort((a, b) => b.score - a.score)
  return scored.filter((h) => h.score > 0).slice(0, topK)
}

export function confidenceLabel(topScore: number, nHits: number): "high" | "medium" | "low" {
  if (topScore >= 0.30 && nHits >= 2) return "high"
  if (topScore >= 0.15) return "medium"
  return "low"
}

export type OfflineAnswer = {
  answer: string
  sources: string[]
  confidence: "high" | "medium" | "low"
  abstained: boolean
  why: string
}

export function composeOffline(hits: Hit[], sensorContext = ""): OfflineAnswer {
  const top = hits[0]?.score ?? 0
  const strong = hits.filter((h) => h.score >= 0.12 && h.score >= 0.42 * top)
  if (strong.length === 0 || top < 0.06) {
    return {
      answer:
        "I am not sure — the sources I have do not cover that well enough for me to give a reliable answer. Please check GOV.UK, AHDB, or ask your local adviser.",
      sources: [],
      confidence: "low",
      abstained: true,
      why: "",
    }
  }
  const sentences: string[] = []
  const sourcesUsed: string[] = []
  let whyPassage = ""
  for (const h of strong.slice(0, 2)) {
    const first = h.doc.text.split(". ")[0] + "."
    sentences.push(first)
    sourcesUsed.push(h.doc.source)
    if (!whyPassage) whyPassage = h.doc.text
  }
  const parts: string[] = []
  if (sensorContext) parts.push(sensorContext)
  parts.push(...sentences)
  return {
    answer: parts.join(" "),
    sources: sourcesUsed,
    confidence: confidenceLabel(top, strong.length),
    abstained: false,
    why: whyPassage,
  }
}
