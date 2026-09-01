"use client"

import { useState } from "react"
import { useProfile } from "@/hooks/useProfile"
import { api } from "@/lib/api"
import { LessonCard } from "@/components/learn/LessonCard"
import { Quiz, type QuizQuestion } from "@/components/learn/Quiz"
import { LITERACY_TIPS } from "@/lib/tips"

const LESSONS = [
  {
    id: "L1",
    title: "Where the answer comes from",
    body:
      "Every answer shows the source it was drawn from — GOV.UK, AHDB, Met Office and so on. That means you can always check the original and know Steward is not inventing facts. If a source is missing, take the answer with a pinch of salt.",
  },
  {
    id: "L2",
    title: "How sure is it? (confidence)",
    body:
      "Each answer has a confidence tag — high, medium or low. Low confidence means the sources only touched on your question. Treat it as a nudge to double-check with a person or the original document.",
  },
  {
    id: "L3",
    title: "When a tool should say no",
    body:
      "For anything a vet or agronomist should decide — dosing an animal, mixing a spray, disposing of a carcass — Steward will not give a number. That is on purpose. Regulated advice needs a licensed person.",
  },
  {
    id: "L4",
    title: "Your data, your say",
    body:
      "Anything you type or say to Steward stays in your own profile on this device. If you ever want to reset progress, use the Settings screen.",
  },
  {
    id: "L5",
    title: "Little and often",
    body:
      "Ticking off small daily jobs builds a picture of your farm over time. Steward uses that context to make suggestions feel like they come from someone who knows your patch.",
  },
]

const QUIZ: QuizQuestion[] = [
  {
    id: "Q1",
    question: "Steward says its confidence is 'low'. What should you do?",
    options: [
      { text: "Ignore the answer — it is useless", correct: false },
      { text: "Treat it as a nudge to check the source or ask a person", correct: true },
      { text: "Assume it is still fully reliable", correct: false },
    ],
    explanation: "Low confidence means the sources only partly cover your question. Verify before acting.",
  },
  {
    id: "Q2",
    question: "You ask Steward for a spray application rate. What happens?",
    options: [
      { text: "It gives you the exact rate", correct: false },
      { text: "It steps back and points you to a BASIS-qualified agronomist", correct: true },
      { text: "It refuses to speak to you again", correct: false },
    ],
    explanation: "Regulated pesticide-application questions go to a licensed adviser — Steward is a decision aid, not a substitute.",
  },
]

export default function LearnPage() {
  const { profile, update } = useProfile()
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const tip = LITERACY_TIPS[Math.floor(profile.turns / 2) % LITERACY_TIPS.length]

  async function completeLesson(id: string) {
    if (profile.lesson_done.includes(id) || busy) return
    setBusy(id)
    try {
      const res = await api.progress("lesson_done", id, profile)
      update({
        lesson_done: [...profile.lesson_done, id],
        points: res.total_points,
        badges: [...new Set([...profile.badges, ...res.new_badges])],
      })
      setToast(`+5 points! ${res.new_badges.length > 0 ? `New badge: ${res.new_badges.join(", ")}` : ""}`)
      setTimeout(() => setToast(null), 2500)
    } catch (e) {
      setToast(`Could not save: ${(e as Error).message}`)
      setTimeout(() => setToast(null), 3500)
    } finally {
      setBusy(null)
    }
  }

  async function completeQuiz(id: string) {
    if (profile.quiz_done.includes(id) || busy) return
    setBusy(id)
    try {
      const res = await api.progress("quiz_correct", id, profile)
      update({
        quiz_done: [...profile.quiz_done, id],
        points: res.total_points,
        badges: [...new Set([...profile.badges, ...res.new_badges])],
      })
      setToast("+10 points!")
      setTimeout(() => setToast(null), 2500)
    } catch (e) {
      throw e
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className="screen">
      <header>
        <p className="sec">Learn</p>
        <h1 className="text-2xl font-bold">Get the most from Steward</h1>
      </header>

      <section className="card bg-[color:var(--amber-50)] border-[color:var(--amber-200)]">
        <p className="sec text-[color:var(--amber-700)]">Today&apos;s tip</p>
        <p className="text-sm leading-relaxed">{tip}</p>
      </section>

      <section className="flex flex-col gap-3">
        <p className="sec">Lessons</p>
        {LESSONS.map((l) => (
          <LessonCard
            key={l.id}
            id={l.id}
            title={l.title}
            body={l.body}
            done={profile.lesson_done.includes(l.id)}
            onComplete={() => completeLesson(l.id)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <p className="sec">Quick quiz</p>
        <Quiz questions={QUIZ} onCorrect={completeQuiz} doneIds={profile.quiz_done} />
      </section>

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}
