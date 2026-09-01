const REGULATED_PATTERNS: [RegExp, string][] = [
  [/\b(dose|dosage|withdrawal period|inject|antibiotic|wormer|medicine|vaccinat)\w*/i,
   "This looks like an animal-health or veterinary-medicine decision."],
  [/\b(spray|pesticide|herbicide|application rate|tank mix)\b.*\b(rate|mix|how much|dose)\b/i,
   "This looks like a regulated pesticide-application decision."],
  [/\b(bury|dispose of|burn)\b.*\b(carcass|fallen stock|chemical)\b/i,
   "This looks like a regulated disposal decision."],
]

const CRISIS_PATTERN =
  /\b(suicide|kill myself|end it all|can'?t go on|cant go on|cannot go on|no way out|want to die|don'?t want to be here)\b/i

const CRISIS_RESPONSE =
  "It sounds like you may be going through something very hard. " +
  "Please reach out now to the Farming Community Network helpline (open every day, 03000 111 999) " +
  "or, in an emergency, call 999. You are not alone, and a person, not a tool, is the right help here."

const REGULATED_SUFFIX =
  " I am a decision aid, not a licensed adviser, so I will not give a figure. " +
  "Please speak to your vet or a BASIS-qualified agronomist, who can advise safely and legally for your situation."

const INPUT_DIALECT: Record<string, string> = {
  wee: "small", ken: "know", kens: "knows", aye: "yes", nae: "no",
  naw: "no", cannae: "cannot", dinnae: "do not", coo: "cow", coos: "cows",
  kye: "cattle", hyem: "home", gannin: "going", gan: "go", canny: "quite",
  nowt: "nothing", owt: "anything", summat: "something", mak: "make",
  tak: "take", tup: "ram", tups: "rams", yow: "ewe", yows: "ewes",
  beast: "cattle", beasts: "cattle", tatie: "potato", taties: "potatoes",
  muck: "manure",
}

export function normaliseDialect(text: string): string {
  return text.replace(/[A-Za-z']+/g, (w) => {
    const low = w.toLowerCase()
    const repl = INPUT_DIALECT[low]
    if (!repl) return w
    return w[0] === w[0].toUpperCase() ? repl[0].toUpperCase() + repl.slice(1) : repl
  })
}

export type GuardResult = { blocked: boolean; isCrisis: boolean; message: string }

export function checkGuards(text: string): GuardResult {
  if (CRISIS_PATTERN.test(text)) return { blocked: true, isCrisis: true, message: CRISIS_RESPONSE }
  for (const [pattern, why] of REGULATED_PATTERNS) {
    if (pattern.test(text)) return { blocked: true, isCrisis: false, message: why + REGULATED_SUFFIX }
  }
  return { blocked: false, isCrisis: false, message: "" }
}
