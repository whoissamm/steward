// Regional dialect greetings + client-side input normaliser.
// The backend also normalises input; this mirror lets us preview UX without a round-trip.

export const ACCENTS: { id: string; label: string; greeting: string; region: string }[] = [
  { id: "standard", label: "Standard English", greeting: "Hello", region: "Neutral" },
  { id: "southern", label: "Southern", greeting: "Hello", region: "Home Counties" },
  { id: "geordie", label: "Geordie", greeting: "Howay", region: "Newcastle" },
  { id: "mackem", label: "Mackem", greeting: "Wey aye", region: "Sunderland" },
  { id: "durham", label: "Durham", greeting: "Noo then", region: "County Durham" },
  { id: "scouse", label: "Scouse", greeting: "Ey up, la", region: "Liverpool" },
  { id: "scots", label: "Scots", greeting: "Aye", region: "Scotland" },
  { id: "yorkshire", label: "Yorkshire", greeting: "Ey up", region: "Yorkshire" },
  { id: "westcountry", label: "West Country", greeting: "Alright me lover", region: "SW England" },
  { id: "brummie", label: "Brummie", greeting: "Alroight", region: "Birmingham" },
  { id: "cockney", label: "Cockney", greeting: "Oi oi", region: "East London" },
]

export function greetingFor(accent: string, name: string): string {
  const a = ACCENTS.find((x) => x.id === accent) || ACCENTS[0]
  const cleanName = name.trim() || "friend"
  return `${a.greeting}, ${cleanName}`
}

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
    if (low in INPUT_DIALECT) {
      const repl = INPUT_DIALECT[low]
      return w[0] === w[0].toUpperCase() ? repl[0].toUpperCase() + repl.slice(1) : repl
    }
    return w
  })
}

type DialectVoice = {
  lead: string
  ing: boolean
  tag: string
  words: Record<string, string>
}

const DIALECT_VOICE: Record<string, DialectVoice> = {
  standard: { lead: "", ing: false, tag: "", words: {} },
  southern: { lead: "Right, ", ing: false, tag: "", words: {} },
  geordie: {
    lead: "Howay, ", ing: true, tag: " Mind how ye gan.",
    words: { you: "ye", your: "yer", to: "te", my: "me", going: "gannin",
      about: "aboot", out: "oot", of: "o'", and: "an'", no: "nar",
      not: "nut", do: "de", down: "doon", cannot: "cannit" },
  },
  mackem: {
    lead: "Wey aye, ", ing: true, tag: " Ha'way.",
    words: { you: "ye", your: "yer", to: "te", my: "me", going: "gannin",
      about: "aboot", out: "oot", make: "mak", take: "tak", no: "nar",
      of: "o'", and: "an'", down: "doon", cannot: "cannit" },
  },
  durham: {
    lead: "Noo then, ", ing: true, tag: "",
    words: { you: "ya", your: "yer", to: "te", of: "o'", and: "an'",
      about: "aboot", out: "oot", cannot: "cannit" },
  },
  scouse: {
    lead: "Ey up, la, ", ing: true, tag: " Sound.",
    words: { the: "de", that: "dat", this: "dis", there: "der", them: "dem",
      think: "tink", thing: "ting", you: "ya", your: "yer", to: "ter",
      and: "an'", with: "wid" },
  },
  scots: {
    lead: "Aye, ", ing: true, tag: " Nae bother.",
    words: { you: "ye", your: "yer", not: "nae", cannot: "cannae", do: "dae",
      to: "tae", no: "naw", of: "o'", and: "an'", know: "ken",
      small: "wee", little: "wee", going: "gaun", from: "frae",
      have: "hae", one: "yin", house: "hoose", about: "aboot",
      out: "oot", down: "doon", now: "noo", good: "guid", more: "mair" },
  },
  yorkshire: {
    lead: "Ey up, ", ing: true, tag: " Reyt then.",
    words: { the: "t'", you: "tha", your: "thi", nothing: "nowt",
      anything: "owt", something: "summat", and: "an'", of: "o'" },
  },
  westcountry: {
    lead: "Alright me lover, ", ing: true, tag: " Proper job.",
    words: { you: "ee", your: "yer", my: "me", of: "o'", and: "an'",
      is: "be", are: "be", yes: "ess" },
  },
  brummie: {
    lead: "Alroight, ", ing: true, tag: " Tara a bit.",
    words: { your: "yower", going: "gooin", of: "o'", and: "an'", nice: "noice" },
  },
  cockney: {
    lead: "Oi oi, ", ing: true, tag: " Sorted.",
    words: { you: "ya", your: "yer", to: "ter", thing: "fing", think: "fink",
      nothing: "nuffin", and: "an'" },
  },
}

/**
 * Apply subtle dialect flavour to spoken output — word substitutions + ing-drop.
 * The "lead" phrase (Howay/Aye/Wey aye) and closing tag are NOT applied here by
 * default — the ElevenLabs voice + word swaps already carry the regional feel,
 * and prepending "Howay," to every single reply gets old fast.
 * Pass { includeLead: true } explicitly (e.g. for greeting previews).
 */
export function dialectify(text: string, accent: string, opts: { includeLead?: boolean } = {}): string {
  const d = DIALECT_VOICE[accent] ?? DIALECT_VOICE.standard
  let result = text.replace(/[A-Za-z']+/g, (w) => {
    const low = w.toLowerCase()
    const repl = d.words[low]
    if (!repl) return w
    return w[0] === w[0].toUpperCase() ? repl[0].toUpperCase() + repl.slice(1) : repl
  })
  if (d.ing) result = result.replace(/([a-z]{2,})ing\b/g, "$1in'")
  if (opts.includeLead && d.lead && result) {
    result = d.lead + result[0].toLowerCase() + result.slice(1)
    if (d.tag) result = result.trimEnd() + d.tag
  }
  return result
}
