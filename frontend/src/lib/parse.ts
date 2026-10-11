import { ALL_TOPICS } from './engine'
import type { Lang, PlotDetails, Query, RoadFacing, Topic, Use } from './types'

const DEV_DIGITS = '०१२३४५६७८९'

/** Devanagari digits to ASCII, so "२००" parses the same as "200". */
function normalizeDigits(s: string): string {
  return s.replace(/[०-९]/g, (d) => String(DEV_DIGITS.indexOf(d)))
}

export function detectLang(text: string): Lang {
  return /[ऀ-ॿ]/.test(text) ? 'hi' : 'en'
}

const NUM = String.raw`(\d+(?:[.,]\d+)?)`
const toNum = (s: string) => parseFloat(s.replace(/,/g, ''))

const AREA_UNIT = String.raw`(?:sq\.?\s*m(?:tr|t|eter|etre)?s?\b|sqm\b|square\s*met(?:er|re)s?|वर्ग\s*मीटर|वर्ग\s*मी\.?|व\.?\s*मी\.?)`
const LEN_UNIT = String.raw`(?:m\b|m\.|mtr\b|met(?:er|re)s?\b|मीटर|मी\.?)`
const ROAD_WORD = String.raw`(?:road|street|rd\b|रोड|सड़क|सडक|मार्ग|गली)`

const AREA_RE_SRC = NUM + String.raw`\s*` + AREA_UNIT

interface Hit { value: number; start: number; end: number }

function firstMatch(text: string, pattern: RegExp): Hit | null {
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')
  const m = re.exec(text)
  if (!m) return null
  const idx = m.index + m[0].indexOf(m[1])
  return { value: toNum(m[1]), start: idx, end: idx + m[1].length }
}

/** Blank out a span so a later extractor can never read the same digits twice. */
function maskSpan(text: string, start: number, end: number): string {
  return text.slice(0, start) + ' '.repeat(end - start) + text.slice(end)
}

export function extractPlotArea(text: string): number | null {
  const direct = firstMatch(text, new RegExp(AREA_RE_SRC, 'i'))
  if (direct) return direct.value
  const labelled = firstMatch(
    text,
    new RegExp(String.raw`(?:plot|भूखंड|भूखण्ड|प्लॉट|प्लाट)(?:\s*(?:area|size|का|क्षेत्रफल|साइज))?\s*(?:of|is|:|=|-)?\s*` + NUM, 'i'),
  )
  if (labelled) return labelled.value
  const trailing = firstMatch(text, new RegExp(NUM + String.raw`\s*(?:के|का)?\s*(?:प्लॉट|भूखंड|भूखण्ड)`, 'i'))
  return trailing ? trailing.value : null
}

export function extractRoadWidth(text: string): number | null {
  // "9 m road" / "9 मीटर सड़क" / "9 m wide road"
  const before = firstMatch(
    text,
    new RegExp(NUM + String.raw`\s*${LEN_UNIT}\s*(?:wide\s*|चौड़ी\s*|चौड़ी\s*वाली\s*)?${ROAD_WORD}`, 'i'),
  )
  if (before) return before.value
  // "road of 9 m" / "सड़क की चौड़ाई 9 मीटर" / "road width 9"
  const after = firstMatch(
    text,
    new RegExp(`${ROAD_WORD}` + String.raw`\s*(?:की\s*)?(?:width|चौड़ाई|चौडाई)?\s*(?:of|is|:|=|-|है)?\s*` + NUM, 'i'),
  )
  if (after) return after.value
  return null
}

export function extractUse(text: string): Use | null {
  const t = text.toLowerCase()
  if (/\bmixed\b|mix(ed)?[-\s]?use|मिश्रित|मिक्स/.test(t)) return 'mixed'
  if (/commercial|shop|showroom|office|market|दुकान|वाणिज्यिक|व्यावसायिक|व्यवसायिक|कमर्शियल|कार्यालय/.test(t)) return 'commercial'
  if (/residential|house|home|dwelling|flat|apartment|आवासीय|रिहायशी|रहवासी|मकान|घर|निवास/.test(t)) return 'residential'
  return null
}

export function extractProposedFloors(text: string): number | null {
  const gPlus = /\bg\s*\+\s*(\d+)/i.exec(text) ?? /भूतल\s*\+\s*(\d+)/.exec(text)
  if (gPlus) return parseInt(gPlus[1], 10) + 1
  const m = new RegExp(NUM + String.raw`\s*(?:floors?|storeys?|stories|मंज़िल|मंजिल|मंजिला|तल(?![ऀ-ॿ]))`, 'i').exec(text)
  return m ? toNum(m[1]) : null
}

interface DimHit { width: number; depth: number; start: number; end: number }

const DIM_UNIT = String.raw`(?:m\b|मीटर|मी\.?)?`
const DIM_RE_SRC = NUM + String.raw`\s*${DIM_UNIT}\s*[x×]\s*` + NUM + String.raw`\s*${DIM_UNIT}`

/** Matches a "15m x 13m"-style width-by-depth phrase. Must be masked out of
 * the text before area/road/floor extraction runs — each of those hunts for
 * a bare number next to a unit word, and would otherwise happily swallow
 * one half of a dimension pair. */
function firstDimensionMatch(text: string): DimHit | null {
  const m = new RegExp(DIM_RE_SRC, 'i').exec(text)
  if (!m) return null
  return { width: toNum(m[1]), depth: toNum(m[2]), start: m.index, end: m.index + m[0].length }
}

export function extractPlotDimensions(text: string): { width: number; depth: number } | null {
  const hit = firstDimensionMatch(text)
  return hit ? { width: hit.width, depth: hit.depth } : null
}

const FACING_PATTERNS: { facing: RoadFacing; re: RegExp }[] = [
  { facing: 'north', re: /\bnorth\b|उत्तर/i },
  { facing: 'south', re: /\bsouth\b|दक्षिण/i },
  { facing: 'east', re: /\beast\b|पूर्व/i },
  { facing: 'west', re: /\bwest\b|पश्चिम/i },
]

export function extractRoadFacing(text: string): RoadFacing | null {
  for (const p of FACING_PATTERNS) if (p.re.test(text)) return p.facing
  return null
}

const TOPIC_PATTERNS: { topic: Topic; re: RegExp }[] = [
  { topic: 'front_setback', re: /\bfront\b|फ्रंट|सामने|अगला\s*सेटबैक/i },
  { topic: 'side_setback', re: /\bside\b|साइड|बगल|पार्श्व/i },
  { topic: 'rear_setback', re: /\brear\b|रियर|पीछे|पिछला/i },
  { topic: 'far', re: /\bf\.?\s*a\.?\s*r\.?\b|floor\s*area\s*ratio|built[-\s]?up|एफ\.?\s*ए\.?\s*आर|एफएआर|फर्श\s*क्षेत्र\s*अनुपात|निर्मित\s*क्षेत्र/i },
  { topic: 'ground_coverage', re: /\bcoverage\b|भूतल\s*आच्छादन|आच्छादन|कवरेज/i },
  { topic: 'max_floors', re: /\bfloors?\b|\bstoreys?\b|\bstories\b|\bheight\b|मंज़िल|मंजिल|मंजिला|तल(?![ऀ-ॿ])|ऊँचाई|ऊंचाई/i },
  { topic: 'fee', re: /\bfees?\b|\bcharges?\b|\bcost\b|\bpayment\b|\bpayable\b|शुल्क|फीस|फ़ीस|पैसा|कितना\s*देना/i },
]

const SETBACK_GENERIC = /set\s*-?\s*back|सेटबैक|खुला\s*स्थान|मार्जिन|छोड़ना/i
const ASK_EVERYTHING = /\ball\b|everything|complete|full\s*report|सब\s*कुछ|सभी|पूरी\s*जानकारी|सम्पूर्ण|संपूर्ण/i

export function extractTopics(text: string): Topic[] {
  if (ASK_EVERYTHING.test(text)) return [...ALL_TOPICS]
  const found = TOPIC_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.topic)
  const sides: Topic[] = ['front_setback', 'side_setback', 'rear_setback']
  const hasSpecificSide = found.some((t) => sides.includes(t))
  if (SETBACK_GENERIC.test(text) && !hasSpecificSide) {
    for (const s of sides) if (!found.includes(s)) found.push(s)
  }
  // Keep the canonical display order rather than the order the words appeared in.
  const ordered = ALL_TOPICS.filter((t) => found.includes(t))
  return ordered.length ? ordered : [...ALL_TOPICS]
}

export const BHOPAL_LOCALITIES: { en: string; hi: string }[] = [
  { en: 'Arera Colony', hi: 'अरेरा कॉलोनी' },
  { en: 'MP Nagar', hi: 'एमपी नगर' },
  { en: 'Kolar Road', hi: 'कोलार रोड' },
  { en: 'Shahpura', hi: 'शाहपुरा' },
  { en: 'TT Nagar', hi: 'टीटी नगर' },
  { en: 'Govindpura', hi: 'गोविंदपुरा' },
  { en: 'Bairagarh', hi: 'बैरागढ़' },
  { en: 'Ayodhya Nagar', hi: 'अयोध्या नगर' },
  { en: 'Hoshangabad Road', hi: 'होशंगाबाद रोड' },
  { en: 'Jahangirabad', hi: 'जहांगीराबाद' },
  { en: 'Koh-e-Fiza', hi: 'कोहेफिजा' },
  { en: 'Old City (heritage precinct)', hi: 'पुराना शहर (धरोहर क्षेत्र)' },
]

export function extractZone(text: string): string | null {
  for (const loc of BHOPAL_LOCALITIES) {
    const needle = loc.en.split(' (')[0]
    if (new RegExp(needle.replace(/-/g, String.raw`[-\s]?`), 'i').test(text)) return loc.en
    if (text.includes(loc.hi)) return loc.en
  }
  const ward = /ward\s*(?:no\.?)?\s*(\d+)|वार्ड\s*(?:क्र\.?|नं\.?)?\s*(\d+)/i.exec(text)
  if (ward) return `Ward ${ward[1] ?? ward[2]}`
  return null
}

export interface ParseResult extends Query {
  /** Fields the parser actually found in the text, for the "what I understood" chips. */
  extracted: Record<string, boolean>
  /** Best-effort plot width/depth/facing for the compliance map — never required for core Q&A. */
  plotDetails: Partial<PlotDetails>
}

export function parseQuestion(raw: string, asOf: string): ParseResult {
  const lang = detectLang(raw)
  const text = normalizeDigits(raw)

  // Mask claimed spans left-to-right before the next extractor runs, so a
  // "15m x 13m" pair can never leak a digit into the plot-area reading, and
  // a plot-area phrase can never leak into the road-width or floors reading.
  const dimHit = firstDimensionMatch(text)
  const dimMasked = dimHit ? maskSpan(text, dimHit.start, dimHit.end) : text
  const areaHit = firstMatch(dimMasked, new RegExp(AREA_RE_SRC, 'i'))
  const areaMasked = areaHit ? maskSpan(dimMasked, areaHit.start, areaHit.end) : dimMasked

  const plotArea = extractPlotArea(dimMasked)
  const roadWidth = extractRoadWidth(areaMasked)
  const use = extractUse(text)
  const zone = extractZone(text)
  const proposedFloors = extractProposedFloors(areaMasked)
  const topics = extractTopics(text)
  const dimensions = extractPlotDimensions(text)
  const roadFacing = extractRoadFacing(text)

  return {
    plotArea, roadWidth, use, zone, proposedFloors, topics, asOf, lang, rawText: raw,
    plotDetails: {
      plotWidth: dimensions?.width ?? null,
      plotDepth: dimensions?.depth ?? null,
      roadFacing,
    },
    extracted: {
      plotArea: plotArea !== null,
      roadWidth: roadWidth !== null,
      use: use !== null,
      zone: zone !== null,
      proposedFloors: proposedFloors !== null,
      plotWidth: dimensions !== null,
      roadFacing: roadFacing !== null,
    },
  }
}
