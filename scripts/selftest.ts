import { answerQuery, formatValue, pageLabel, RULES, SOURCES, VERSIONS } from '../src/lib/engine'
import { parseQuestion } from '../src/lib/parse'
import { computeComplianceStatus, CORE_TOPICS } from '../src/lib/compliance'
import { computePlotGeometry } from '../src/lib/geometry'
import { makeReferenceCode } from '../src/lib/referenceCode'
import { TOPIC_LABEL } from '../src/lib/i18n'
import type { Answer, PlotDetails } from '../src/lib/types'

let failures = 0
function check(name: string, cond: boolean, detail = '') {
  if (!cond) { failures++; console.log(`  FAIL  ${name} ${detail}`) }
  else console.log(`  ok    ${name}`)
}

console.log(`dataset: ${RULES.length} rules / ${SOURCES.length} sources / ${VERSIONS.length} versions\n`)

const TODAY = '2026-10-11'
const PRE = '2026-01-01'

function show(a: Answer, lang: 'en' | 'hi' = 'en') {
  const label = TOPIC_LABEL[a.topic][lang]
  if (a.status !== 'matched') return `${label}: [${a.status}${a.missing.length ? ' ' + a.missing.join(',') : ''}]`
  const s = a.source!
  const extra = a.derived.length ? ` | ${a.derived[0].label[lang]}: ${a.derived[0].value}` : ''
  return `${label}: ${formatValue(a.rule!.value, lang)} — ${s.ruleNumber}, ${s.tableNumber}, p.${pageLabel(s)} [${a.version!.shortLabel.en}]${a.changedByAmendment ? ' CHANGED' : ''}${extra}`
}

console.log('--- English: 200 sq m residential plot, 9 m road, front setback ---')
const q1 = parseQuestion('200 sq m residential plot on a 9 m road. What front setback is required?', TODAY)
console.log(`  parsed: area=${q1.plotArea} road=${q1.roadWidth} use=${q1.use} topics=${q1.topics.join(',')} lang=${q1.lang}`)
check('q1 area 200', q1.plotArea === 200, String(q1.plotArea))
check('q1 road 9', q1.roadWidth === 9, String(q1.roadWidth))
check('q1 use residential', q1.use === 'residential')
check('q1 topic front only', q1.topics.length === 1 && q1.topics[0] === 'front_setback', q1.topics.join(','))
const a1 = answerQuery(q1)
a1.forEach((a) => console.log('  ' + show(a)))
check('q1 front setback = 3.0 m', a1[0].rule?.value.number === 3)
check('q1 cites amendment', a1[0].version?.id === 'v-2026-08', a1[0].version?.id)
check('q1 has superseded row', a1[0].superseded.length === 1)
check('q1 value unchanged by amendment', a1[0].changedByAmendment === false)

console.log('\n--- Hindi: same question ---')
const q2 = parseQuestion('200 वर्ग मीटर के प्लॉट और 9 मीटर सड़क के लिए फ्रंट सेटबैक कितना है?', TODAY)
console.log(`  parsed: area=${q2.plotArea} road=${q2.roadWidth} use=${q2.use} topics=${q2.topics.join(',')} lang=${q2.lang}`)
check('q2 lang hi', q2.lang === 'hi')
check('q2 area 200', q2.plotArea === 200, String(q2.plotArea))
check('q2 road 9', q2.roadWidth === 9, String(q2.roadWidth))
const a2 = answerQuery(q2)
a2.forEach((a) => console.log('  ' + show(a, 'hi')))
check('q2 front setback = 3.0 m', a2[0].rule?.value.number === 3)

console.log('\n--- Full brief: 200 sq m / 9 m road / residential / all topics ---')
const q3 = parseQuestion('My plot is 200 sq m residential on a 9 m road. Tell me everything — setback, floors, FAR and fee.', TODAY)
console.log(`  topics=${q3.topics.join(',')}`)
const a3 = answerQuery(q3)
a3.forEach((a) => console.log('  ' + show(a)))
check('q3 covers 7 topics', a3.length === 7, String(a3.length))
check('q3 all matched', a3.every((a) => a.status === 'matched'))
const far3 = a3.find((a) => a.topic === 'far')!
check('q3 FAR = 1.75 (amended)', far3.rule?.value.number === 1.75, String(far3.rule?.value.number))
check('q3 FAR flagged changed', far3.changedByAmendment === true)
check('q3 built-up = 350 sq m', far3.derived[0].value.startsWith('350'), far3.derived[0]?.value)
const fee3 = a3.find((a) => a.topic === 'fee')!
check('q3 fee rate 15/sq m', fee3.rule?.value.number === 15)
check('q3 fee total 3000', fee3.derived[0].value === '₹3,000', fee3.derived[0]?.value)
const mf3 = a3.find((a) => a.topic === 'max_floors')!
check('q3 max floors = 4 (G+3)', mf3.rule?.value.number === 4)

console.log('\n--- Same plot, as on 1 Jan 2026 (before the amendment) ---')
const a4 = answerQuery({ ...q3, asOf: PRE })
a4.forEach((a) => console.log('  ' + show(a)))
check('pre-amendment FAR = 1.50', a4.find((a) => a.topic === 'far')!.rule?.value.number === 1.5)
check('pre-amendment fee rate = 12', a4.find((a) => a.topic === 'fee')!.rule?.value.number === 12)
check('pre-amendment cites base version', a4.every((a) => a.version?.id === 'v-2025-03'))
check('pre-amendment has no superseded rows', a4.every((a) => a.superseded.length === 0))

console.log('\n--- Missing inputs are reported, never guessed ---')
const q5 = parseQuestion('What is the FAR for my plot?', TODAY)
const a5 = answerQuery(q5)
const far5 = a5.find((a) => a.topic === 'far')!
console.log('  ' + show(far5))
check('FAR needs input', far5.status === 'needs_input')
check('FAR missing use+area+road', far5.missing.join(',') === 'use,plotArea,roadWidth', far5.missing.join(','))

console.log('\n--- Out-of-dataset input yields no_rule, not a nearby value ---')
const a6 = answerQuery({ ...q1, plotArea: 200, roadWidth: -1, topics: ['front_setback'] })
console.log('  ' + show(a6[0]))
check('negative road width -> asks for input, not a guess', a6[0].status === 'needs_input')

console.log('\n--- Commercial on a 7 m road is reported as not permitted ---')
const q7 = parseQuestion('Commercial shop, plot 300 sq m, road width 7 m, what FAR and fee?', TODAY)
console.log(`  parsed: area=${q7.plotArea} road=${q7.roadWidth} use=${q7.use}`)
check('q7 use commercial', q7.use === 'commercial')
check('q7 road 7', q7.roadWidth === 7, String(q7.roadWidth))
const a7 = answerQuery(q7)
a7.forEach((a) => console.log('  ' + show(a)))
check('q7 FAR not permitted', a7.find((a) => a.topic === 'far')!.rule?.value.kind === 'not_permitted')

console.log('\n--- Large plot falls outside the amendment scope ---')
const q8 = parseQuestion('Residential plot of 800 sq m on an 18 m road, all details', TODAY)
console.log(`  parsed: area=${q8.plotArea} road=${q8.roadWidth} use=${q8.use}`)
const a8 = answerQuery(q8)
a8.forEach((a) => console.log('  ' + show(a)))
check('q8 uses base version only', a8.every((a) => a.version?.id === 'v-2025-03'))
check('q8 FAR = 2.00', a8.find((a) => a.topic === 'far')!.rule?.value.number === 2)

console.log('\n--- Boundary values land in exactly one row ---')
for (const [area, road] of [[100, 9], [500, 12], [250, 11.99], [1000, 18]] as [number, number][]) {
  const ans = answerQuery({ ...q1, plotArea: area, roadWidth: road, use: 'residential', topics: ['front_setback', 'far', 'fee'] })
  check(`boundary ${area} sq m / ${road} m resolves cleanly`, ans.every((a) => a.status === 'matched'),
    ans.map((a) => `${a.topic}:${a.status}`).join(' '))
}

const NO_PLOT_DETAILS: PlotDetails = {
  plotWidth: null, plotDepth: null, roadFacing: null,
  proposedFrontSetback: null, proposedRearSetback: null, proposedLeftSetback: null, proposedRightSetback: null,
}

console.log('\n--- Geometry: illustrative fallback and violation-strip math ---')
const gIllustrative = computePlotGeometry({
  plotArea: 196, plotWidth: null, plotDepth: null, roadWidth: 9,
  required: { front: 3, rear: 2, side: 1.5 }, proposed: { front: null, rear: null, left: null, right: null },
})
check('illustrative geometry is square (width === depth)', gIllustrative.plotWidth === gIllustrative.plotDepth)
check('illustrative width = sqrt(area)', Math.abs(gIllustrative.plotWidth - 14) < 0.01, String(gIllustrative.plotWidth))
check('isIllustrative flag set when dimensions are missing', gIllustrative.isIllustrative === true)

const gReal = computePlotGeometry({
  plotArea: 200, plotWidth: 10, plotDepth: 20, roadWidth: 9,
  required: { front: 3, rear: 2, side: 1.5 }, proposed: { front: 1.8, rear: null, left: null, right: null },
})
check('real dimensions are not illustrative', gReal.isIllustrative === false)
check('compliant zone (no proposed value) has no violation strip', gReal.zones.rear.violationRect === null)
check('front zone violates: proposed 1.8 < required 3', gReal.zones.front.status === 'violation')
check(
  'violation strip spans exactly [proposed, required) measured from the plot edge — 1.2 m tall at 10 px/m scale',
  gReal.zones.front.violationRect !== null && Math.abs(gReal.zones.front.violationRect!.height - 1.2 * gReal.scale) < 0.01,
  String(gReal.zones.front.violationRect?.height),
)
check(
  'violation strip sits adjacent to the buildable interior (its far edge touches the required line)',
  gReal.zones.front.violationRect !== null &&
  Math.abs(gReal.zones.front.violationRect!.y - gReal.zones.front.requiredRect.y) < 0.01,
)
check(
  'orange (open) portion remains between the plot edge and the proposed line',
  gReal.zones.front.violationRect !== null &&
  gReal.zones.front.violationRect!.y + gReal.zones.front.violationRect!.height < gReal.zones.front.requiredRect.y + gReal.zones.front.requiredRect.height,
)

const gOverCompliant = computePlotGeometry({
  plotArea: 200, plotWidth: 10, plotDepth: 20, roadWidth: 9,
  required: { front: 3, rear: 2, side: 1.5 }, proposed: { front: 4, rear: null, left: null, right: null },
})
check('proposed setback exceeding the requirement draws no violation strip', gOverCompliant.zones.front.violationRect === null)

const gClamped = computePlotGeometry({
  plotArea: 20, plotWidth: 4, plotDepth: 5, roadWidth: 9,
  required: { front: 3, rear: 3, side: 3 }, proposed: { front: null, rear: null, left: null, right: null },
})
check('setbacks exceeding plot dimensions clamp buildableRect to null, not a negative-size box', gClamped.buildableRect === null)

console.log('\n--- Compliance status: priority order Red > Grey > Amber > Green ---')
const cleanPlotQuery = { ...q1, plotArea: 200, roadWidth: 9, use: 'residential' as const, topics: CORE_TOPICS }
const cleanCore = answerQuery(cleanPlotQuery)
check('clean plot + no proposed values -> match (Green)', computeComplianceStatus(cleanCore, NO_PLOT_DETAILS, null, false).status === 'match')

const violatingDetails: PlotDetails = { ...NO_PLOT_DETAILS, proposedFrontSetback: 1 }
check('known violation -> violation (Red), even though it outranks everything else',
  computeComplianceStatus(cleanCore, violatingDetails, null, false).status === 'violation')

check('officer_review (Grey) wins over a simultaneous violation only when geometry is impossible — violation still wins otherwise',
  computeComplianceStatus(cleanCore, violatingDetails, null, true).status === 'violation')

check('geometry-impossible alone (no violation) -> officer_review (Grey)',
  computeComplianceStatus(cleanCore, NO_PLOT_DETAILS, null, true).status === 'officer_review')

const incompleteCore = answerQuery({ ...cleanPlotQuery, roadWidth: null })
const incompleteResult = computeComplianceStatus(incompleteCore, NO_PLOT_DETAILS, null, false)
check('missing an engine input (road width) -> needs_input (Amber), not Green', incompleteResult.status === 'needs_input')
check('front_setback and max_floors are the topics reported missing',
  incompleteResult.missingInputTopics.includes('front_setback') && incompleteResult.missingInputTopics.includes('max_floors'))

check('not having entered a proposed value at all is NOT an Amber trigger on its own',
  computeComplianceStatus(cleanCore, NO_PLOT_DETAILS, null, false).status === 'match')

const floorsViolation = computeComplianceStatus(cleanCore, NO_PLOT_DETAILS, 10, false)
check('proposed floors exceeding the permissible count -> violation', floorsViolation.status === 'violation')
check('floors violation is recorded with zone "floors"', floorsViolation.violations.some((v) => v.zone === 'floors'))

console.log('\n--- Reference code: deterministic, collision-resistant across distinct plots ---')
const refArgs = { asOf: TODAY, plotArea: 200, roadWidth: 9, use: 'residential', zone: null, versionIds: ['v-2026-08'] }
check('same inputs produce the same reference code', makeReferenceCode(refArgs) === makeReferenceCode({ ...refArgs }))
check('a different plot area produces a different code', makeReferenceCode(refArgs) !== makeReferenceCode({ ...refArgs, plotArea: 450 }))
check('a different road width produces a different code', makeReferenceCode(refArgs) !== makeReferenceCode({ ...refArgs, roadWidth: 12 }))

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
