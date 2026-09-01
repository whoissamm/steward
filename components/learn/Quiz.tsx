"use client"

import { useState } from "react"
import { CheckIcon, XIcon, RotateCcwIcon } from "lucide-react"

export type QuizQuestion = {
  id: string
  question: string
  options: { text: string; correct: boolean }[]
  explanation: string
}

type Attempt = { index: number; error?: string }

export function Quiz({
  questions,
  onCorrect,
  doneIds,
}: {
  questions: QuizQuestion[]
  onCorrect: (id: string) => Promise<void> | void
  doneIds: string[]
}) {
  const [attempts, setAttempts] = useState<Record<string, Attempt[]>>({})

  async function pick(q: QuizQuestion, i: number) {
    const isDone = doneIds.includes(q.id)
    if (isDone) return
    const prev = attempts[q.id] ?? []
    // Ignore repeat clicks on same wrong answer
    if (prev.length > 0 && !q.options[prev[prev.length - 1].index].correct && prev[prev.length - 1].index === i) return
    const opt = q.options[i]
    setAttempts((a) => ({ ...a, [q.id]: [...prev, { index: i }] }))
    if (opt.correct) {
      try {
        await onCorrect(q.id)
      } catch (e) {
        setAttempts((a) => {
          const list = [...(a[q.id] ?? [])]
          list[list.length - 1] = { index: i, error: (e as Error).message || "Save failed" }
          return { ...a, [q.id]: list }
        })
      }
    }
  }

  function retry(id: string) {
    setAttempts((a) => ({ ...a, [id]: [] }))
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q) => {
        const list = attempts[q.id] ?? []
        const last = list[list.length - 1]
        const isDone = doneIds.includes(q.id) || (last && q.options[last.index].correct && !last.error)
        return (
          <article key={q.id} className="card flex flex-col gap-3">
            <p className="text-sm font-semibold">{q.question}</p>
            <ul className="flex flex-col gap-2">
              {q.options.map((o, i) => {
                const picked = list.some((att) => att.index === i)
                const showState = picked
                const styles = showState
                  ? o.correct
                    ? "border-[color:var(--green-700)] bg-[color:color-mix(in_oklab,var(--green-500)_10%,var(--surface))]"
                    : "border-[color:var(--red-500)] bg-[color:color-mix(in_oklab,var(--red-500)_8%,var(--surface))]"
                  : "border-[color:var(--border)] bg-[color:var(--surface)]"
                return (
                  <li key={i}>
                    <button
                      type="button"
                      disabled={isDone}
                      onClick={() => pick(q, i)}
                      className={
                        "w-full text-left p-3 rounded-xl border transition flex items-start gap-2 min-h-[48px] " +
                        styles
                      }
                      style={{ borderWidth: showState ? 2 : 1.5 }}
                    >
                      <span className="flex-1 text-sm">{o.text}</span>
                      {showState && (o.correct ? (
                        <CheckIcon size={16} className="text-[color:var(--green-700)] flex-shrink-0 mt-0.5" aria-hidden />
                      ) : (
                        <XIcon size={16} className="text-[color:var(--red-500)] flex-shrink-0 mt-0.5" aria-hidden />
                      ))}
                    </button>
                  </li>
                )
              })}
            </ul>
            {last && !q.options[last.index].correct && !isDone && (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-[color:var(--muted)]">Not quite — try again.</p>
                <button type="button" className="btn-ghost text-xs" onClick={() => retry(q.id)}>
                  <RotateCcwIcon size={12} aria-hidden /> Retry
                </button>
              </div>
            )}
            {last?.error && (
              <p className="text-xs text-[color:var(--red-600)]" role="alert">
                Could not save your progress: {last.error}
              </p>
            )}
            {isDone && (
              <p className="text-xs italic text-[color:var(--muted)]">{q.explanation}</p>
            )}
          </article>
        )
      })}
    </div>
  )
}
