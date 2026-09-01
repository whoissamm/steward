const TODO_SEASON: Record<string, [string, string]> = {
  winter: [
    "Check stock water is not frozen",
    "Plan next year's cropping and any scheme options",
  ],
  spring: [
    "Book or take a fresh soil test",
    "Check fields are fit before drilling or turnout",
  ],
  summer: [
    "Check grass and silage stocks",
    "Keep an eye on water in this heat",
  ],
  autumn: [
    "Get the harvest or last cuts secured",
    "Note any scheme or claim deadlines coming up",
  ],
}

const TODO_FARM: Record<string, string> = {
  arable: "Walk a field and check the crop for pests or disease",
  livestock: "Condition-score a batch and move grazing if needed",
  dairy: "Check herd records and anything flagged in the parlour",
  mixed: "Do a quick walk of both stock and the nearest field",
  horticulture: "Check irrigation and look over crops for pests",
}

const SEASONAL_REMINDERS: Record<string, string> = {
  winter: "Heads up: winter is a good time to check your scheme agreements are on track.",
  spring: "Spring is here — make sure your field diary is up to date before drilling.",
  summer: "Summer: watch your soil moisture and keep records for any scheme claims.",
  autumn: "Autumn: check all claim and application deadlines for the year.",
}

export type Season = "winter" | "spring" | "summer" | "autumn"

export function seasonOf(month0: number): Season {
  if (month0 <= 1 || month0 === 11) return "winter"
  if (month0 <= 4) return "spring"
  if (month0 <= 7) return "summer"
  return "autumn"
}

export type PlanTodo = { id: string; text: string; done: boolean }
export type Plan = { todos: PlanTodo[]; reminders: string[]; season: Season }

export function dailyPlan(farm = "mixed", hasSensors = false, now: Date = new Date()): Plan {
  const month0 = now.getMonth()
  const season = seasonOf(month0)
  const seasonTodos = TODO_SEASON[season]
  const farmTodo = TODO_FARM[farm] ?? TODO_FARM.mixed

  const todos: PlanTodo[] = [
    { id: "t1", text: seasonTodos[0], done: false },
    { id: "t2", text: farmTodo, done: false },
    { id: "t3", text: seasonTodos[1], done: false },
    { id: "t4", text: "Jot down one record while it is fresh (spray, movement or job done)", done: false },
  ]
  const reminders: string[] = [
    "Heads up: the SFI is closed to new applicants for now — check GOV.UK before you plan.",
    SEASONAL_REMINDERS[season],
  ]
  if (hasSensors) {
    reminders.push("Your sensors are connected — check the dashboard for any alerts.")
  }
  return { todos, reminders, season }
}
