const TOPIC_MATCHERS: [string, RegExp][] = [
  ["schemes",     /\b(scheme|sfi|grant|subsid|stewardship|elm|payment|fund|defra|agreement)/i],
  ["market",      /\b(sell|market|customer|shop|box|margin|direct|price|diversif)/i],
  ["soil",        /\b(soil|nutrient|nitrogen|fertilis|irrigat|water|moist|carbon|compact)/i],
  ["livestock",   /\b(flock|sheep|cattle|livestock|ewe|ram|lamb|graz|feed|stock|dairy|herd)/i],
  ["weather",     /\b(frost|weather|rain|wind|cold|forecast|temperatur|drought)/i],
  ["tech",        /\b(ai|precision|variable|sensor|drone|satellite|digital|tool|app|data)/i],
  ["wellbeing",   /\b(wellbeing|stress|mental|worried|tired|anxious|lonely|isolat)/i],
  ["connectivity",/\b(broadband|internet|signal|connectivity|network|coverage|online)/i],
]

const FOLLOWUPS_MAP: Record<string, string[]> = {
  schemes:     ["What is Countryside Stewardship?", "Which scheme options pay for hedgerows?"],
  market:      ["How do box schemes work?", "Could diversifying spread my risk?"],
  soil:        ["How do I improve my soil health?", "Do I need to irrigate today?"],
  livestock:   ["How does rotational grazing help?", "What should I record for my flock?"],
  weather:     ["Is there a frost risk tonight?", "Should I hold off spraying in this wind?"],
  tech:        ["How does variable-rate application work?", "Whose data is it when I use a tool?"],
  wellbeing:   ["Where can I find farmer support?", "How do others cope with the pressure?"],
  connectivity:["What if my broadband is poor?", "Can Steward work with a weak signal?"],
}

export function classifyTopic(text: string): string {
  for (const [id, re] of TOPIC_MATCHERS) if (re.test(text)) return id
  return "schemes"
}

export function followupsFor(topic: string): string[] {
  return FOLLOWUPS_MAP[topic] ?? ["Can I still apply for the SFI scheme?", "How can AI cut my fertiliser costs?"]
}

const MARKET_RE = /\b(sell|market|customer|shop|box|margin|direct)\b/i
export function isMarketQuery(text: string): boolean {
  return MARKET_RE.test(text)
}
