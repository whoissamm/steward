// 3-module course in farmer plain English. Each lesson is ~200 words,
// scanning-friendly, no jargon, no assumed digital fluency.

export type QuizItem = {
  id: string
  question: string
  options: { text: string; correct: boolean }[]
  explanation: string
}

export type Lesson = {
  id: string
  title: string
  duration: string
  body: string[] // paragraphs
  keyTakeaways: string[]
  quiz?: QuizItem[]
}

export type Module = {
  id: string
  title: string
  tagline: string
  lessons: Lesson[]
}

export const COURSE: Module[] = [
  {
    id: "M1",
    title: "How to use Steward well",
    tagline: "Getting the most from a tool that tells you when it doesn't know.",
    lessons: [
      {
        id: "L1",
        title: "Where the answer comes from",
        duration: "3 min",
        body: [
          "Steward doesn't guess. Every answer is built from documents from trusted places — GOV.UK, AHDB, the Met Office, and farmer support charities like FCN and RABI.",
          "When you get an answer, look at the little chips underneath it. You'll see one that says 'Sources' with the name of the document it pulled from. Tap it to see the full source line. That way you always know where the answer came from and can go check it yourself.",
          "If a farmer sat down with you at market and told you something useful, the first thing you'd ask is 'where did you hear that?' Steward answers that question for you every time, without you having to ask.",
        ],
        keyTakeaways: [
          "Every answer shows its source. Tap the Sources chip.",
          "Steward will never invent a fact.",
          "You can always check the original document if you want more detail.",
        ],
        quiz: [
          {
            id: "Q1a",
            question: "Where should you look on an answer to check where it came from?",
            options: [
              { text: "The Confidence pill", correct: false },
              { text: "The Sources chip", correct: true },
              { text: "The Follow-up buttons", correct: false },
            ],
            explanation: "The Sources chip shows the document(s) the answer was built from.",
          },
        ],
      },
      {
        id: "L2",
        title: "How sure is it? (Confidence)",
        duration: "3 min",
        body: [
          "Every answer has a small confidence tag — High, Medium or Low. It's not a percentage. Think of it like a weather forecaster saying 'strong chance', 'possible' or 'not sure'.",
          "High confidence means Steward found strong matching passages in more than one source. Medium means one decent match. Low means the sources only touched on your question — treat it like a nudge to double-check with a person or the original document.",
          "If Steward's confidence is Low, don't just ignore the answer — but don't act on it as if it were gospel either. It's a starting point for the conversation you should have with your agronomist, vet or scheme adviser.",
        ],
        keyTakeaways: [
          "High = sources strongly match your question.",
          "Medium = one decent match; verify if it matters.",
          "Low = a nudge, not a directive. Check with a person.",
        ],
        quiz: [
          {
            id: "Q2a",
            question: "Steward says its confidence is 'Low'. What should you do?",
            options: [
              { text: "Ignore the answer — it is useless", correct: false },
              { text: "Treat it as a nudge to check the source or ask a person", correct: true },
              { text: "Assume it is still fully reliable", correct: false },
            ],
            explanation: "Low confidence means the sources only partly cover your question. Verify before acting.",
          },
        ],
      },
      {
        id: "L3",
        title: "When Steward says no",
        duration: "3 min",
        body: [
          "There are some questions that need a licensed professional — not a tool. Dosing an animal with a wormer, mixing a spray, or disposing of a fallen carcass are all regulated decisions. Get them wrong and you can hurt an animal, the land, or land yourself in trouble.",
          "If you ask Steward one of these, it steps back. You'll see an amber bubble that says 'This needs a licensed adviser' and gives you a nudge toward your vet or a BASIS-qualified agronomist. This isn't Steward being unhelpful — it's Steward respecting the rules that keep you and your farm safe.",
          "You can still use Steward to describe what you're seeing, work out how urgent it is, or figure out what to say to the vet on the phone. It just won't hand you a number.",
        ],
        keyTakeaways: [
          "Steward refuses vet dosing, spray rates, and disposal questions.",
          "That's protecting you and your animals.",
          "Use Steward to prepare the question, then call the professional.",
        ],
        quiz: [
          {
            id: "Q3a",
            question: "You ask Steward for a spray application rate. What happens?",
            options: [
              { text: "It gives you the exact rate", correct: false },
              { text: "It steps back and points you to a BASIS-qualified agronomist", correct: true },
              { text: "It refuses to speak to you again", correct: false },
            ],
            explanation: "Regulated pesticide-application questions go to a licensed adviser — Steward is a decision aid, not a substitute.",
          },
        ],
      },
    ],
  },
  {
    id: "M2",
    title: "Digital skills for the farm",
    tagline: "Getting comfortable with tools that make the paperwork easier.",
    lessons: [
      {
        id: "L4",
        title: "Your data, your say",
        duration: "3 min",
        body: [
          "Anything you type or say to Steward stays on your device unless you turn on syncing. Your name, your accent choice, your tasks and notes — they're yours.",
          "This matters. Farmers get asked for a lot of data these days — from schemes, from processors, from tech platforms. It's worth knowing where each piece is stored and who can see it. A useful rule of thumb: if you can't see how a tool would keep working without your data, be careful.",
          "In Settings you can reset your progress or start over completely. Steward will never ask you for a password, a bank card or a data-sharing agreement to run.",
        ],
        keyTakeaways: [
          "Your Steward data lives on your device by default.",
          "You can reset it any time in Settings.",
          "Always ask: 'where does my data go, and who can see it?'",
        ],
      },
      {
        id: "L5",
        title: "Voice-first, in your accent",
        duration: "3 min",
        body: [
          "Steward is built for talking, not typing. Tap the microphone icon and ask your question the way you'd ask it at market. Words like 'aye', 'wee', 'tup' or 'yow' will be understood — Steward translates them before searching.",
          "The reply comes back in plain English on screen, but if 'read aloud' is on, you'll hear it in the accent you picked (Geordie, Scots, Yorkshire, and 8 more). That way it feels like a chat, not a form.",
          "On a phone in a wet field, the microphone is often faster and safer than typing. Voice also unlocks the 'Voice user' badge — worth a small nudge if you're building up your progress.",
        ],
        keyTakeaways: [
          "Tap the mic — Steward understands regional farming words.",
          "Voice replies come in your chosen accent when 'read aloud' is on.",
          "Voice is often faster than typing in the field.",
        ],
      },
      {
        id: "L6",
        title: "Little and often",
        duration: "2 min",
        body: [
          "Farming rewards small, consistent actions much more than big pushes. Same with using Steward: ticking off two tasks and asking one question a day builds a picture of your farm over time.",
          "That picture feeds back into the advice you get. The Soil Doctor knows your farm has been dry all week. The Grant Advisor knows you already asked about SFI. The Vet Bridge knows you condition-scored the flock on Tuesday.",
          "You'll also build a streak — the little flame counter on your dashboard. Come back tomorrow. Do one small thing. Watch the streak grow.",
        ],
        keyTakeaways: [
          "Daily small actions beat weekly big pushes.",
          "Steward learns from what you do, not from what you say.",
          "Streaks are a nudge, not a punishment.",
        ],
      },
    ],
  },
  {
    id: "M3",
    title: "Making it pay",
    tagline: "Using AI, sensors and grants without getting burned.",
    lessons: [
      {
        id: "L7",
        title: "AI on the farm — when it helps, when it hurts",
        duration: "4 min",
        body: [
          "AI is useful on the farm when it turns something invisible into something you can act on — soil moisture at 6am before you get to the field, a change in stock behaviour that flags a sick animal, a forecast that lets you time the spray window.",
          "It's not so useful when it hides where a number came from, or when it makes big decisions on your behalf without checking. A tool that says 'apply 82 kg/ha of N' without explaining why should always get a 'why?' from you before it gets a yes.",
          "Steward tries to be the first kind. Every answer has its source, its confidence, and a way for you to disagree with it. If it ever feels wrong, trust your gut — and tell your agronomist what the tool said so they can push back too.",
        ],
        keyTakeaways: [
          "AI is best when it surfaces information you couldn't otherwise see.",
          "Any tool that gives you a number without a reason isn't ready for your farm.",
          "You always have the final say.",
        ],
      },
      {
        id: "L8",
        title: "Grants, schemes and getting paid",
        duration: "4 min",
        body: [
          "England's farm payments are changing fast. Direct payments are ending; Environmental Land Management schemes (ELM), Countryside Stewardship (CS), and the Sustainable Farming Incentive (SFI) are paying for actions instead — better soil, hedgerows, habitats.",
          "SFI was closed to new applicants in early 2025. That may change — Steward's Grant Advisor keeps the guidance up to date but you should always check the current position on GOV.UK before you plan the year around a scheme.",
          "The biggest mistake small farms make is missing the deadline or fluffing the paperwork. Set a monthly reminder in the Calendar. Ask the Grant Advisor what's live this month. Keep your field diary current so you can prove what you did if inspected.",
        ],
        keyTakeaways: [
          "Payments are moving from acreage-based to action-based.",
          "Always check GOV.UK before assuming a scheme is open.",
          "Miss the deadline, miss the money. Set calendar reminders.",
        ],
        quiz: [
          {
            id: "Q8a",
            question: "Before planning your year around a scheme, what should you do?",
            options: [
              { text: "Trust the last thing you heard at market", correct: false },
              { text: "Check the current position on GOV.UK", correct: true },
              { text: "Ask a neighbour", correct: false },
            ],
            explanation: "Scheme rules change fast. GOV.UK is the source of truth.",
          },
        ],
      },
    ],
  },
]

export const ALL_LESSONS: Lesson[] = COURSE.flatMap((m) => m.lessons)
export const ALL_QUIZ_IDS: string[] = ALL_LESSONS.flatMap((l) => l.quiz ?? []).map((q) => q.id)

export function moduleForLesson(lessonId: string): Module | undefined {
  return COURSE.find((m) => m.lessons.some((l) => l.id === lessonId))
}
