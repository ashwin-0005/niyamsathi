import rulesData from '../data/rules.json'
import sourcesData from '../data/sources.json'
import versionsData from '../data/versions.json'
import type {
  Answer, Bi, Derived, Lang, MissingField, Query, Rule, RuleValue, Source, Topic, Use, Version,
} from './types'

export const RULES = rulesData as Rule[]
export const SOURCES = sourcesData as Source[]
export const VERSIONS = versionsData as Version[]

export const SOURCE_BY_ID = new Map(SOURCES.map((s) => [s.id, s]))
export const VERSION_BY_ID = new Map(VERSIONS.map((v) => [v.id, v]))

export const ALL_TOPICS: Topic[] = [
  'front_setback', 'side_setback', 'rear_setback', 'far', 'ground_coverage', 'max_floors', 'fee',
]

export const LATEST_EFFECTIVE_DATE = VERSIONS
  .map((v) => v.effectiveDate)
  .sort()
  .slice(-1)[0]

export function sourceOf(rule: Rule): Source {
  const s = SOURCE_BY_ID.get(rule.sourceId)
  if (!s) throw new Error(`Rule ${rule.id} cites unknown source ${rule.sourceId}`)
  return s
}

export function versionOf(rule: Rule): Version {
  const v = VERSION_BY_ID.get(sourceOf(rule).versionId)
  if (!v) throw new Error(`Source ${rule.sourceId} cites unknown version`)
  return v
}

/** Page citation including any amendment page suffix, e.g. "42A". */
export function pageLabel(source: Source): string {
  return `${source.pageNumber}${source.pageSuffix ?? ''}`
}

/**
 * Plot area uses (min, max]  — "above 100 and up to 250 sq m".
 * Road width uses [min, max) — "9 m and above but less than 12 m".
 * These match how the slabs are worded in the rulebook, so a boundary
 * value such as a 9 m road or a 500 sq m plot lands in exactly one row.
 */
function matchesConditions(rule: Rule, plotArea: number | null, roadWidth: number | null): boolean {
  const c = rule.conditions
  if (c.plotAreaMin !== null || c.plotAreaMax !== null) {
    if (plotArea === null) return false
    if (c.plotAreaMin !== null && !(plotArea > c.plotAreaMin)) return false
    if (c.plotAreaMax !== null && !(plotArea <= c.plotAreaMax)) return false
  }
  if (c.roadWidthMin !== null || c.roadWidthMax !== null) {
    if (roadWidth === null) return false
    if (c.roadWidthMin !== null && !(roadWidth >= c.roadWidthMin)) return false
    if (c.roadWidthMax !== null && !(roadWidth < c.roadWidthMax)) return false
  }
  return true
}

/** A row with more bounds set is the more specific row. */
function specificity(rule: Rule): number {
  const c = rule.conditions
  return [c.plotAreaMin, c.plotAreaMax, c.roadWidthMin, c.roadWidthMax].filter((x) => x !== null).length
}

/** Which inputs actually discriminate between rows for this topic and use. */
export function requiredInputs(topic: Topic, use: Use | null): MissingField[] {
  const rows = RULES.filter((r) => r.topic === topic)
  const needsUse = rows.some((r) => r.use.length < 3)
  const scoped = use ? rows.filter((r) => r.use.includes(use)) : rows
  const needed: MissingField[] = []
  if (needsUse) needed.push('use')
  if (scoped.some((r) => r.conditions.plotAreaMin !== null || r.conditions.plotAreaMax !== null)) {
    needed.push('plotArea')
  }
  if (scoped.some((r) => r.conditions.roadWidthMin !== null || r.conditions.roadWidthMax !== null)) {
    needed.push('roadWidth')
  }
  return needed
}

export function formatValue(value: RuleValue, lang: Lang): string {
  if (value.kind === 'not_permitted') return value.label ? value.label[lang] : '—'
  if (value.label) return value.label[lang]
  const n = value.number ?? 0
  switch (value.kind) {
    case 'length': return `${n.toFixed(1)} m`
    case 'ratio': return n.toFixed(2)
    case 'percent': return `${n}%`
    case 'floors': return String(n)
    case 'rate': return `₹${n} ${lang === 'hi' ? 'प्रति वर्ग मीटर' : 'per sq m'}`
    default: return String(n)
  }
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
const sqm = (n: number, lang: Lang) =>
  `${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${lang === 'hi' ? 'वर्ग मी' : 'sq m'}`

function deriveFor(rule: Rule, q: Query): Derived[] {
  const out: Derived[] = []
  const area = q.plotArea
  const n = rule.value.number
  if (n === null) return out

  if (rule.topic === 'far' && area !== null) {
    const built = n * area
    out.push({
      label: { en: 'Maximum built-up area', hi: 'अधिकतम निर्मित क्षेत्र' },
      value: sqm(built, q.lang),
      formula: {
        en: `FAR ${n.toFixed(2)} × plot ${area} sq m = ${sqm(built, 'en')}`,
        hi: `एफ.ए.आर. ${n.toFixed(2)} × भूखंड ${area} वर्ग मी = ${sqm(built, 'hi')}`,
      },
    })
  }
  if (rule.topic === 'ground_coverage' && area !== null) {
    const foot = (n / 100) * area
    out.push({
      label: { en: 'Maximum ground floor footprint', hi: 'अधिकतम भूतल निर्माण क्षेत्र' },
      value: sqm(foot, q.lang),
      formula: {
        en: `${n}% × plot ${area} sq m = ${sqm(foot, 'en')}`,
        hi: `${n}% × भूखंड ${area} वर्ग मी = ${sqm(foot, 'hi')}`,
      },
    })
  }
  if (rule.topic === 'fee' && area !== null) {
    const raw = n * area
    const total = Math.max(raw, 1000)
    out.push({
      label: { en: 'Permission fee payable', hi: 'देय अनुज्ञा शुल्क' },
      value: inr(total),
      formula: {
        en: raw < 1000
          ? `₹${n}/sq m × ${area} sq m = ${inr(raw)}, raised to the ₹1,000 minimum under Rule 90(1)`
          : `₹${n}/sq m × ${area} sq m = ${inr(raw)}`,
        hi: raw < 1000
          ? `₹${n}/वर्ग मी × ${area} वर्ग मी = ${inr(raw)}, नियम 90(1) के न्यूनतम ₹1,000 तक बढ़ाया गया`
          : `₹${n}/वर्ग मी × ${area} वर्ग मी = ${inr(raw)}`,
      },
    })
  }
  if (rule.topic === 'max_floors' && q.proposedFloors !== null) {
    const ok = q.proposedFloors <= n
    out.push({
      label: { en: 'Check against proposed floors', hi: 'प्रस्तावित तलों की जाँच' },
      value: ok
        ? (q.lang === 'hi' ? 'प्रस्ताव अनुमेय सीमा के भीतर' : 'Proposal is within the permissible limit')
        : (q.lang === 'hi' ? 'प्रस्ताव अनुमेय सीमा से अधिक' : 'Proposal exceeds the permissible limit'),
      formula: {
        en: `Proposed ${q.proposedFloors} floors vs permissible ${n}`,
        hi: `प्रस्तावित ${q.proposedFloors} तल बनाम अनुमेय ${n}`,
      },
    })
  }
  return out
}

const AMENDMENT_CAUTION: Bi = {
  en: 'Table 12-A states the relaxation does not apply to a plot in a heritage precinct notified under Rule 82 or in the airport funnel zone. Confirm the locality before issuing.',
  hi: 'तालिका 12-क के अनुसार यह छूट नियम 82 के अंतर्गत अधिसूचित धरोहर क्षेत्र अथवा विमानपत्तन फनल क्षेत्र के भूखंड पर लागू नहीं है। जारी करने से पूर्व स्थान की पुष्टि करें।',
}

interface Candidate { rule: Rule; source: Source; version: Version }

function bestInVersion(cands: Candidate[]): Candidate[] {
  const top = Math.max(...cands.map((c) => specificity(c.rule)))
  return cands.filter((c) => specificity(c.rule) === top)
}

/**
 * Answer one topic. Returns an explicit `needs_input` or `no_rule` status rather
 * than falling back to a nearby row — the dataset is the only source of values.
 */
export function answerTopic(q: Query, topic: Topic): Answer {
  const base: Answer = {
    topic, status: 'no_rule', superseded: [], changedByAmendment: false,
    missing: [], derived: [], cautions: [],
  }

  // A non-positive measurement is not a real plot or road; treat it as absent
  // so the clerk is asked for it rather than being handed a boundary row.
  const plotArea = q.plotArea !== null && q.plotArea > 0 ? q.plotArea : null
  const roadWidth = q.roadWidth !== null && q.roadWidth > 0 ? q.roadWidth : null

  const needed = requiredInputs(topic, q.use)
  const missing = needed.filter((f) => {
    if (f === 'use') return q.use === null
    if (f === 'plotArea') return plotArea === null
    return roadWidth === null
  })
  if (missing.length) return { ...base, status: 'needs_input', missing }

  const rows = RULES.filter((r) => r.topic === topic && (q.use === null || r.use.includes(q.use)))
  const matched: Candidate[] = rows
    .filter((r) => matchesConditions(r, plotArea, roadWidth))
    .map((r) => ({ rule: r, source: sourceOf(r), version: versionOf(r) }))
    .filter((c) => c.version.effectiveDate <= q.asOf)

  if (!matched.length) return base

  const byVersion = new Map<string, Candidate[]>()
  for (const c of matched) {
    const list = byVersion.get(c.version.id) ?? []
    list.push(c)
    byVersion.set(c.version.id, list)
  }

  const ordered = [...byVersion.entries()]
    .map(([id, cands]) => ({ version: VERSION_BY_ID.get(id)!, cands: bestInVersion(cands) }))
    .sort((a, b) => b.version.effectiveDate.localeCompare(a.version.effectiveDate))

  const winner = ordered[0]
  const older = ordered.slice(1)
  const supersededList = older.flatMap((o) => o.cands.map((c) => ({ rule: c.rule, source: c.source, version: c.version })))

  if (winner.cands.length > 1) {
    return {
      ...base,
      status: 'ambiguous',
      rule: winner.cands[0].rule,
      source: winner.cands[0].source,
      version: winner.version,
      superseded: supersededList,
    }
  }

  const top = winner.cands[0]
  const prev = supersededList[0]
  const changed = !!prev && (
    prev.rule.value.number !== top.rule.value.number || prev.rule.value.kind !== top.rule.value.kind
  )

  const cautions: Bi[] = []
  if (winner.version.id !== VERSIONS[0].id && ['far', 'ground_coverage', 'max_floors'].includes(topic)) {
    cautions.push(AMENDMENT_CAUTION)
  }

  return {
    topic,
    status: 'matched',
    rule: top.rule,
    source: top.source,
    version: winner.version,
    superseded: supersededList,
    changedByAmendment: changed,
    missing: [],
    derived: deriveFor(top.rule, q),
    cautions,
  }
}

export function answerQuery(q: Query): Answer[] {
  const topics = q.topics.length ? q.topics : ALL_TOPICS
  return topics.map((t) => answerTopic(q, t))
}
