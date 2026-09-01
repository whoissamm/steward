"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useProfile } from "@/hooks/useProfile"
import { api } from "@/lib/api"
import { hasOnboarded } from "@/lib/profile"
import { COURSE, ALL_LESSONS, ALL_QUIZ_IDS, type Lesson } from "@/lib/course"
import { ExpandableCard } from "@/components/ui/expandable-card"
import { Quiz } from "@/components/learn/Quiz"
import { ProgressCard } from "@/components/ui/progress-card"
import { AchievementUnlocked } from "@/components/ui/achievement-unlocked"
import { BADGES } from "@/lib/gamification"
import { AwardIcon, BookOpenIcon, CheckIcon, ClockIcon, GraduationCapIcon } from "lucide-react"

export default function LearnPage() {
  const router = useRouter()
  const { profile, loaded, update, markCompletion, logActivity } = useProfile()
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState<string | null>(null)

  useEffect(() => {
    if (loaded && !hasOnboarded(profile)) router.replace("/login")
  }, [loaded, profile, router])

  async function completeLesson(l: Lesson) {
    if (profile.lesson_done.includes(l.id) || busy) return
    setBusy(l.id)
    try {
      const res = await api.progress("lesson_done", l.id, profile)
      logActivity(`lesson:${l.id}`)
      markCompletion()
      update({
        lesson_done: [...profile.lesson_done, l.id],
        points: res.total_points,
        badges: Array.from(new Set([...profile.badges, ...res.new_badges])),
      })
      if (res.new_badges.length > 0) setUnlocked(res.new_badges[0])
      else {
        setToast(`+5 pts — ${l.title}`)
        setTimeout(() => setToast(null), 2200)
      }
    } catch (e) {
      setToast(`Could not save: ${(e as Error).message}`)
      setTimeout(() => setToast(null), 3500)
    } finally {
      setBusy(null)
    }
  }

  async function completeQuiz(quizId: string) {
    if (profile.quiz_done.includes(quizId) || busy) return
    setBusy(quizId)
    try {
      const res = await api.progress("quiz_correct", quizId, profile)
      logActivity(`quiz:${quizId}`)
      markCompletion()
      update({
        quiz_done: [...profile.quiz_done, quizId],
        points: res.total_points,
        badges: Array.from(new Set([...profile.badges, ...res.new_badges])),
      })
      if (res.new_badges.length > 0) setUnlocked(res.new_badges[0])
      else {
        setToast("+10 pts")
        setTimeout(() => setToast(null), 2000)
      }
    } catch (e) {
      throw e
    } finally {
      setBusy(null)
    }
  }

  const lessonsDone = profile.lesson_done.length
  const quizzesDone = profile.quiz_done.length
  const totalLessons = ALL_LESSONS.length
  const totalQuizzes = ALL_QUIZ_IDS.length
  const badgeMeta = unlocked ? BADGES[unlocked] : null

  if (!loaded) {
    return <main className="screen"><p className="text-sm text-[color:var(--muted)]">Loading course…</p></main>
  }

  return (
    <main className="screen">
      <header className="flex flex-col gap-1">
        <p className="sec">Course</p>
        <h1 className="text-2xl font-bold">Farming with an AI companion</h1>
        <p className="text-[color:var(--muted)]">
          3 modules · 8 lessons · plain English · takes about 25 minutes total.
        </p>
      </header>

      <ProgressCard
        title="Course progress"
        value={lessonsDone + quizzesDone}
        target={totalLessons + totalQuizzes}
        unit="steps"
        description={`${lessonsDone}/${totalLessons} lessons · ${quizzesDone}/${totalQuizzes} quizzes`}
        icon={<GraduationCapIcon size={16} className="text-[color:var(--green-700)]" aria-hidden />}
      />

      {COURSE.map((mod, mi) => {
        const modLessonsDone = mod.lessons.filter((l) => profile.lesson_done.includes(l.id)).length
        return (
          <motion.section
            key={mod.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mi * 0.08 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <p className="sec !mb-0">Module {mi + 1}</p>
                <h2 className="text-lg font-bold">{mod.title}</h2>
                <p className="text-xs text-[color:var(--muted)]">{mod.tagline}</p>
              </div>
              <span className="chip chip-outline">
                {modLessonsDone}/{mod.lessons.length}
              </span>
            </div>
            {mod.lessons.map((l) => {
              const done = profile.lesson_done.includes(l.id)
              return (
                <ExpandableCard
                  key={l.id}
                  title={l.title}
                  subtitle={l.duration}
                  eyebrow={done ? "Completed" : "Lesson"}
                  icon={
                    done ? (
                      <span className="w-8 h-8 rounded-full bg-[color:var(--green-700)] text-white flex items-center justify-center">
                        <CheckIcon size={16} aria-hidden />
                      </span>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-[color:var(--surface-alt)] text-[color:var(--muted)] flex items-center justify-center">
                        <BookOpenIcon size={16} aria-hidden />
                      </span>
                    )
                  }
                  rightSlot={
                    <span className="text-[10px] text-[color:var(--muted)] flex items-center gap-1">
                      <ClockIcon size={10} aria-hidden />{l.duration}
                    </span>
                  }
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 text-sm leading-relaxed text-[color:var(--fg)]">
                      {l.body.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
                        Key takeaways
                      </p>
                      <ul className="flex flex-col gap-1">
                        {l.keyTakeaways.map((k) => (
                          <li key={k} className="flex items-start gap-2 text-sm">
                            <CheckIcon size={14} className="text-[color:var(--green-700)] mt-0.5 flex-shrink-0" aria-hidden />
                            <span>{k}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {l.quiz && l.quiz.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
                          Quick check
                        </p>
                        <Quiz questions={l.quiz} onCorrect={completeQuiz} doneIds={profile.quiz_done} />
                      </div>
                    )}
                    {!done && (
                      <button
                        type="button"
                        className="btn-primary self-start"
                        onClick={() => completeLesson(l)}
                        disabled={busy === l.id}
                      >
                        Mark lesson complete · +5
                      </button>
                    )}
                  </div>
                </ExpandableCard>
              )
            })}
          </motion.section>
        )
      })}

      <Link
        href="/agents/steward?q=What%20should%20I%20learn%20next"
        className="card card-tight flex items-center gap-2 text-sm hover:border-[color:var(--green-600)]"
      >
        <GraduationCapIcon size={14} className="text-[color:var(--amber-500)]" aria-hidden />
        Ask Steward what to learn next
      </Link>

      {toast && <div className="toast" role="status">{toast}</div>}
      {badgeMeta && (
        <AchievementUnlocked
          open
          onClose={() => setUnlocked(null)}
          name={badgeMeta.name}
          description={badgeMeta.description}
          icon={AwardIcon}
        />
      )}
    </main>
  )
}
