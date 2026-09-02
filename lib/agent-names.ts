/**
 * Two parallel name sets so each agent has a first name that matches the
 * user's voice preference. When the user picks a female voice, they hear
 * Sarah / Kate / Grace / Rose / Beth / Kim. When they pick male, they hear
 * Joseph / Ken / Graham / Tom / Ben / Colin. Traditional Christian names
 * throughout, familiar in an English farming community.
 */

export type AgentId = "steward" | "weather" | "grants" | "soil" | "vet_bridge" | "market"

export type AgentNames = { male: string; female: string }

export const AGENT_NAMES: Record<AgentId, AgentNames> = {
  steward:    { male: "Joseph", female: "Sarah" },
  weather:    { male: "Ken",    female: "Kate"  },
  grants:     { male: "Graham", female: "Grace" },
  soil:       { male: "Tom",    female: "Rose"  },
  vet_bridge: { male: "Ben",    female: "Beth"  },
  market:     { male: "Colin",  female: "Kim"   },
}

export function nameForAgent(id: string, gender: "male" | "female" = "male"): string {
  const set = AGENT_NAMES[id as AgentId]
  return set ? set[gender] : "Steward"
}
