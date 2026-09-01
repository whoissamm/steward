// 17-doc knowledge base — verbatim from the reference Python advisor.
// Each doc: id, source (cited to the user), topic, body text, keyword hints.

export type KBDoc = {
  id: string
  source: string
  topic: string
  text: string
  keywords: string
}

export const KB_DOCS: KBDoc[] = [
  { id: "KB01", source: "GOV.UK — DEFRA, Environmental Land Management", topic: "schemes",
    text: "England is moving from area-based subsidy to payment for environmental outcomes under the Environmental Land Management schemes. Farmers are paid for actions such as improving soil health, managing hedgerows and cutting nutrient run-off.",
    keywords: "ELM scheme grant subsidy payment environmental" },
  { id: "KB02", source: "GOV.UK — Rural Payments Agency, SFI update", topic: "schemes",
    text: "The Sustainable Farming Incentive was closed to new applicants in March 2025 when its budget was reached. Farmers who had already started an application were affected. Check the official GOV.UK channel before you plan around it, as new guidance is expected before any reopening.",
    keywords: "SFI apply application scheme sign up open closed still available reopen" },
  { id: "KB03", source: "AHDB — precision nutrient management", topic: "tech",
    text: "Precision and AI-based tools can cut input use by matching fertiliser, water and pesticide to local field conditions, lowering cost and often emissions. The gains are largest where data on soil and yield variation already exist, and the net environmental benefit should be measured, not assumed.",
    keywords: "AI artificial intelligence fertiliser cost saving input reduce precision emissions" },
  { id: "KB04", source: "AHDB / NFU — selling direct", topic: "market",
    text: "Online farm shops and box schemes let small producers sell more directly, capture more margin and shorten the distance to the customer. Success depends on reliable delivery and a clear story that people want to buy into.",
    keywords: "sell selling market direct customer online shop margin price box scheme" },
  { id: "KB05", source: "Farming Community Network / RABI", topic: "wellbeing",
    text: "Money worries, red tape and being on your own can weigh heavily. Talking to other farmers, keeping the workload manageable, and picking up the phone to a trusted helpline all help, and there is no shame in it.",
    keywords: "wellbeing mental health stress coping support tired worried" },
  { id: "KB06", source: "AHDB — adopting new technology on farm", topic: "adoption",
    text: "Farmers take up digital tools mainly when they can see a clear profit and can trust the tool, more than when it is simply easy to use. A short trial, a local example and a word from someone you trust all raise the chance it sticks.",
    keywords: "adopt adoption trust profit new technology decision worth it" },
  { id: "KB07", source: "AHDB — Nutrient Management Guide (RB209)", topic: "soil",
    text: "A recent soil test is the basis of good nutrient planning. Match nitrogen to what the crop needs and split applications to cut loss. Keep records to meet scheme rules and to see your improvement over time.",
    keywords: "soil nutrient nitrogen test planning records fertiliser plan" },
  { id: "KB08", source: "AHDB — sheep and livestock management", topic: "livestock",
    text: "Good flock management rests on regular condition scoring, planned rotational grazing to rest the pasture, and matching feed to the stage of production. Record births, losses and treatments so you spot patterns early.",
    keywords: "flock sheep cattle livestock feeding stocking grazing rotation ewe ram lamb" },
  { id: "KB09", source: "GOV.UK — Countryside Stewardship", topic: "schemes",
    text: "Countryside Stewardship pays for environmental options such as hedgerow management, buffer strips and species-rich grassland, alongside the wider move to environmental payments. Options and rates are set nationally, so check the current offer on GOV.UK before applying.",
    keywords: "countryside stewardship CS grant higher tier mid tier hedgerow agreement" },
  { id: "KB10", source: "AHDB — precision farming", topic: "tech",
    text: "Variable-rate and precision application match inputs to each part of a field using yield maps, soil zones and satellite or drone imagery, cutting waste where the data to guide them exists. The saving is largest on variable fields and smallest where variation is low.",
    keywords: "precision variable rate GPS mapping yield map drone satellite zone" },
  { id: "KB11", source: "Met Office — farming weather", topic: "weather",
    text: "Frost risk rises on clear, still nights when ground temperatures fall below zero, and tender crops and early growth are most exposed. A reliable local forecast and simple cover, such as fleece or delayed drilling, cut your losses.",
    keywords: "frost weather cold temperature forecast tender crop protect overnight" },
  { id: "KB12", source: "AHDB — soil health", topic: "soil",
    text: "Soil health improves with organic matter, less tillage, cover crops and keeping heavy kit off wet ground, which together lift structure, water-holding and carbon. Healthier soil also needs fewer inputs over time and helps you meet scheme rules.",
    keywords: "soil health carbon organic matter cover crop min till compaction structure" },
  { id: "KB13", source: "GOV.UK / Natural England — hedgerows and nature", topic: "environment",
    text: "Hedgerows, field margins and flower strips support pollinators and farmland birds and are rewarded under environmental schemes. Small, well-placed features can add scheme income without taking much productive land.",
    keywords: "biodiversity hedgerow wildlife pollinator margin buffer nature habitat bird" },
  { id: "KB14", source: "GOV.UK — rural connectivity (Project Gigabit)", topic: "connectivity",
    text: "Poor rural broadband and mobile coverage are a real barrier, and signal is patchy across the countryside. Where it is weak, tools that work offline or by low-bandwidth voice are far more usable than data-heavy apps.",
    keywords: "broadband internet connectivity signal mobile rural network coverage online" },
  { id: "KB15", source: "NFU / GOV.UK — farm diversification", topic: "business",
    text: "Diversifying, from a farm shop to tourism or added-value processing, spreads your risk when subsidy and prices are all over the place, but each new venture needs its own plan and cashflow. Start small, test the demand, and keep the core sound.",
    keywords: "diversify diversification income resilience tourism added value cashflow" },
  { id: "KB16", source: "GOV.UK / RPA — farm records and paperwork", topic: "records",
    text: "Keeping your records straight, field maps, movement records, spray and medicine books, makes scheme claims and inspections far easier. Note the key deadlines and do a little each week rather than a scramble at the end.",
    keywords: "record records paperwork rpa form deadline claim map movement passport" },
  { id: "KB17", source: "AHDB — irrigation and water management", topic: "soil",
    text: "Whether to water comes down to the crop stage, recent rainfall and how the soil feels and looks. Check the top few inches, watch the forecast, and water in the cooler part of the day to cut loss. A soil-moisture sensor makes the call easier, but you can judge it well without one.",
    keywords: "irrigate irrigation water watering dry drought soil moisture when field thirsty" },
]
