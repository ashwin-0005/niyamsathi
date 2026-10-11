import { renderToStaticMarkup } from 'react-dom/server'
import App from '../src/App'
import AnswerCard from '../src/components/AnswerCard'
import RuleExplorer from '../src/components/RuleExplorer'
import QueryPanel, { EMPTY_PLOT_DETAILS_FORM } from '../src/components/QueryPanel'
import PlotComplianceMap from '../src/components/PlotComplianceMap'
import ComplianceStatusCard from '../src/components/ComplianceStatusCard'
import RuleVersionTimeline from '../src/components/RuleVersionTimeline'
import ComplianceSlip from '../src/components/ComplianceSlip'
import DemoScenarioSelector from '../src/components/DemoScenarioSelector'
import { answerQuery, ALL_TOPICS } from '../src/lib/engine'
import { parseQuestion } from '../src/lib/parse'
import { computeComplianceStatus, CORE_TOPICS } from '../src/lib/compliance'
import { computePlotGeometry, type GeometryInput } from '../src/lib/geometry'
import { makeReferenceCode } from '../src/lib/referenceCode'
import { DEMO_SCENARIOS } from '../src/lib/demoScenarios'
import { COMPLIANCE_STATUS_LABEL } from '../src/lib/i18n'
import type { Answer, PlotDetails, Query, Topic } from '../src/lib/types'

let failures = 0
const check = (name: string, cond: boolean, detail = '') => {
  if (!cond) { failures++; console.log(`  FAIL  ${name} ${detail}`) } else console.log(`  ok    ${name}`)
}

function toNum(v: string): number | null {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

function toPlotDetails(f: typeof EMPTY_PLOT_DETAILS_FORM): PlotDetails {
  return {
    plotWidth: toNum(f.plotWidth), plotDepth: toNum(f.plotDepth), roadFacing: f.roadFacing || null,
    proposedFrontSetback: toNum(f.proposedFrontSetback), proposedRearSetback: toNum(f.proposedRearSetback),
    proposedLeftSetback: toNum(f.proposedLeftSetback), proposedRightSetback: toNum(f.proposedRightSetback),
  }
}

function toGeometryInput(coreAnswers: Answer[], plotDetails: PlotDetails, query: Query): GeometryInput {
  const byTopic = new Map(coreAnswers.map((a) => [a.topic, a]))
  const requiredOf = (topic: Topic) => {
    const a = byTopic.get(topic)
    return a?.status === 'matched' ? (a.rule?.value.number ?? null) : null
  }
  return {
    plotArea: query.plotArea, plotWidth: plotDetails.plotWidth, plotDepth: plotDetails.plotDepth,
    roadWidth: query.roadWidth,
    required: { front: requiredOf('front_setback'), rear: requiredOf('rear_setback'), side: requiredOf('side_setback') },
    proposed: {
      front: plotDetails.proposedFrontSetback, rear: plotDetails.proposedRearSetback,
      left: plotDetails.proposedLeftSetback, right: plotDetails.proposedRightSetback,
    },
  }
}

function runScenarioQuery(form: typeof DEMO_SCENARIOS[number]['form'], asOf: string) {
  const query: Query = {
    plotArea: toNum(form.plotArea), roadWidth: toNum(form.roadWidth),
    use: form.use === '' ? null : form.use, zone: form.zone.trim() || null,
    proposedFloors: toNum(form.proposedFloors),
    topics: form.topics.length ? form.topics : [...ALL_TOPICS],
    asOf, lang: 'en',
  }
  return { query, answers: answerQuery(query), coreAnswers: answerQuery({ ...query, topics: CORE_TOPICS }) }
}

// ---------------------------------------------------------------------------
// Existing app shell / core Q&A — unchanged behaviour, must still pass.
// ---------------------------------------------------------------------------

const app = renderToStaticMarkup(<App />)
check('App renders', app.length > 2000, `${app.length} chars`)
check('App shows demo banner', app.includes('Demo dataset'))
check('App shows both example languages', app.includes('वर्ग मीटर') && app.includes('sq m'))
check('App shows demo scenario selector', app.includes('Try a demo scenario'))

const q = parseQuestion('My plot is 200 sq m residential on a 9 m road. Tell me everything.', '2026-10-11')
const answers = answerQuery(q)
for (const lang of ['en', 'hi'] as const) {
  const html = answers.map((a, i) => renderToStaticMarkup(<AnswerCard answer={a} lang={lang} index={i} />)).join('')
  check(`AnswerCard renders all ${answers.length} topics in ${lang}`, html.length > 4000)
  check(`${lang}: citation present`, html.includes('Table 8-A') && html.includes('42A'))
  check(`${lang}: demo badge present`, html.includes(lang === 'hi' ? 'डेमो नियम मिलान' : 'Demo rule match'))
}

const needsInput = answerQuery(parseQuestion('What is the FAR?', '2026-10-11'))
const niHtml = renderToStaticMarkup(<AnswerCard answer={needsInput[0]} lang="en" index={0} />)
check('needs_input card renders without a value', niHtml.includes('More information needed'))

check('RuleExplorer renders', renderToStaticMarkup(<RuleExplorer lang="en" />).length > 5000)
check('RuleExplorer renders in Hindi', renderToStaticMarkup(<RuleExplorer lang="hi" />).includes('फ्रंट सेटबैक'))

const panel = renderToStaticMarkup(
  <QueryPanel
    lang="en" mode="form" onModeChange={() => {}} question="" onQuestionChange={() => {}}
    form={{ plotArea: '200', roadWidth: '9', use: 'residential', zone: '', proposedFloors: '', topics: [] }}
    onFormChange={() => {}}
    plotDetailsForm={EMPTY_PLOT_DETAILS_FORM} onPlotDetailsFormChange={() => {}}
    asOf="2026-10-11" onAsOfChange={() => {}} onSubmit={() => {}} onClear={() => {}}
  />,
)
check('QueryPanel form mode renders', panel.includes('Plot area') && panel.includes('Road width'))
check('QueryPanel renders plot-details fields', panel.includes('Plot width') && panel.includes('Road-facing direction'))

// ---------------------------------------------------------------------------
// New: compliance map / status / timeline / slip / demo selector.
// Three cases: a clean match, a violation, and an officer-review/grey case
// (via an ambiguous-looking missing-info plot), each run through the real
// computePlotGeometry + computeComplianceStatus pipeline, in both languages.
// ---------------------------------------------------------------------------

const standard = runScenarioQuery(DEMO_SCENARIOS[0].form, DEMO_SCENARIOS[0].asOf)
const standardDetails = toPlotDetails(DEMO_SCENARIOS[0].plotDetailsForm)
const standardGeometry = computePlotGeometry(toGeometryInput(standard.coreAnswers, standardDetails, standard.query))
const standardCompliance = computeComplianceStatus(standard.coreAnswers, standardDetails, standard.query.proposedFloors, standardGeometry.buildableRect === null)
check('standard scenario resolves to match', standardCompliance.status === 'match', standardCompliance.status)
check('standard scenario has a real (non-illustrative) footprint', !standardGeometry.isIllustrative)
check('standard scenario has a buildable rect', standardGeometry.buildableRect !== null)

const violation = runScenarioQuery(DEMO_SCENARIOS[2].form, DEMO_SCENARIOS[2].asOf)
const violationDetails = toPlotDetails(DEMO_SCENARIOS[2].plotDetailsForm)
const violationGeometry = computePlotGeometry(toGeometryInput(violation.coreAnswers, violationDetails, violation.query))
const violationCompliance = computeComplianceStatus(violation.coreAnswers, violationDetails, violation.query.proposedFloors, violationGeometry.buildableRect === null)
check('violation scenario resolves to violation', violationCompliance.status === 'violation', violationCompliance.status)
check('violation scenario records a front-setback violation', violationCompliance.violations.some((v) => v.zone === 'front'))
check('violation scenario draws a red strip on the front zone', violationGeometry.zones.front.violationRect !== null)
check(
  'violation strip touches the buildable-interior line of the required band, not the outer plot edge',
  violationGeometry.zones.front.violationRect !== null &&
  Math.abs(violationGeometry.zones.front.violationRect!.y - violationGeometry.zones.front.requiredRect.y) < 0.01,
)

const missing = runScenarioQuery(DEMO_SCENARIOS[3].form, DEMO_SCENARIOS[3].asOf)
const missingDetails = toPlotDetails(DEMO_SCENARIOS[3].plotDetailsForm)
const missingGeometry = computePlotGeometry(toGeometryInput(missing.coreAnswers, missingDetails, missing.query))
const missingCompliance = computeComplianceStatus(missing.coreAnswers, missingDetails, missing.query.proposedFloors, missingGeometry.buildableRect === null)
check('missing-details scenario resolves to needs_input', missingCompliance.status === 'needs_input', missingCompliance.status)
check('missing-details scenario is illustrative (no dimensions given)', missingGeometry.isIllustrative)

const amendment = runScenarioQuery(DEMO_SCENARIOS[1].form, DEMO_SCENARIOS[1].asOf)
const frontAnswerAmendment = amendment.coreAnswers.find((a) => a.topic === 'front_setback')
check('450 sq m scenario is governed by the Aug 2026 amendment', frontAnswerAmendment?.version?.id === 'v-2026-08')
check('450 sq m scenario shows a superseded pre-amendment row', (frontAnswerAmendment?.superseded.length ?? 0) > 0)

// Officer-review (grey) case: an ambiguous/no_rule core topic. The dataset has
// no row that leaves a topic ambiguous by construction, so exercise the grey
// path directly via a geometry-impossible plot (setbacks exceed the plot) —
// the other documented grey trigger alongside ambiguous/no_rule.
const impossibleGeometry = computePlotGeometry({
  plotArea: 20, plotWidth: 4, plotDepth: 5, roadWidth: 9,
  required: { front: 3, rear: 3, side: 3 }, proposed: { front: null, rear: null, left: null, right: null },
})
check('setbacks exceeding plot dims clamp buildableRect to null', impossibleGeometry.buildableRect === null)
const officerReviewCompliance = computeComplianceStatus(standard.coreAnswers, standardDetails, null, true)
check('geometry-impossible flag forces officer_review status', officerReviewCompliance.status === 'officer_review', officerReviewCompliance.status)

for (const lang of ['en', 'hi'] as const) {
  const mapHtml = renderToStaticMarkup(
    <PlotComplianceMap
      lang={lang} geometry={violationGeometry} roadWidth={violation.query.roadWidth}
      plotDetails={violationDetails} coreAnswers={violation.coreAnswers} onFocusTopic={() => {}}
    />,
  )
  check(`PlotComplianceMap renders (violation case) in ${lang}`, mapHtml.length > 1500)
  check(`PlotComplianceMap legend present in ${lang}`, mapHtml.includes(lang === 'hi' ? 'सूचक' : 'Legend'))

  const illustrativeHtml = renderToStaticMarkup(
    <PlotComplianceMap
      lang={lang} geometry={missingGeometry} roadWidth={missing.query.roadWidth}
      plotDetails={missingDetails} coreAnswers={missing.coreAnswers} onFocusTopic={() => {}}
    />,
  )
  check(`PlotComplianceMap shows illustrative label in ${lang}`, illustrativeHtml.includes(
    lang === 'hi' ? 'उदाहरणात्मक भूखंड आरेख' : 'Illustrative plot layout',
  ))

  for (const [label, result] of [['match', standardCompliance], ['violation', violationCompliance], ['needs_input', missingCompliance], ['officer_review', officerReviewCompliance]] as const) {
    const html = renderToStaticMarkup(<ComplianceStatusCard lang={lang} result={result} />)
    check(`ComplianceStatusCard renders ${label} in ${lang}`, html.includes(COMPLIANCE_STATUS_LABEL[result.status][lang]))
    check(`ComplianceStatusCard shows disclaimer in ${lang} (${label})`, html.includes(
      lang === 'hi' ? 'अंतिम स्वीकृति सक्षम प्राधिकारी' : 'Final approval remains with the competent authority',
    ))
  }

  const timelineHtml = renderToStaticMarkup(
    <RuleVersionTimeline lang={lang} asOf="2026-10-11" onAsOfChange={() => {}} focusedAnswer={frontAnswerAmendment ?? null} />,
  )
  check(`RuleVersionTimeline renders in ${lang}`, timelineHtml.length > 500)
  check(`RuleVersionTimeline shows the amendment-applies message in ${lang}`, timelineHtml.includes(
    lang === 'hi' ? 'अधिक्रमित करता है' : 'overrides the earlier March 2025 record',
  ))

  const referenceCode = makeReferenceCode({
    asOf: violation.query.asOf, plotArea: violation.query.plotArea, roadWidth: violation.query.roadWidth,
    use: violation.query.use, zone: violation.query.zone,
    versionIds: violation.answers.map((a) => a.version?.id).filter((x): x is string => !!x),
  })
  const slipHtml = renderToStaticMarkup(
    <ComplianceSlip
      lang={lang} asOf={violation.query.asOf} dateIssued="2026-10-11"
      plotArea={violation.query.plotArea} roadWidth={violation.query.roadWidth} use={violation.query.use} zone={violation.query.zone}
      plotDetails={violationDetails} answers={violation.answers} complianceResult={violationCompliance} referenceCode={referenceCode}
    />,
  )
  check(`ComplianceSlip renders in ${lang}`, slipHtml.includes(referenceCode))
  check(`ComplianceSlip shows the not-an-approval disclaimer in ${lang}`, slipHtml.includes(
    lang === 'hi' ? 'यह दस्तावेज़ भवन अनुज्ञा अथवा स्वीकृति नहीं है' : 'not a building permission or approval',
  ))

  const demoHtml = renderToStaticMarkup(<DemoScenarioSelector lang={lang} onLoad={() => {}} />)
  check(`DemoScenarioSelector renders all 4 scenarios in ${lang}`, DEMO_SCENARIOS.every((s) => demoHtml.includes(s.title[lang])))
}

check('reference codes are deterministic for identical inputs', makeReferenceCode({
  asOf: '2026-10-11', plotArea: 200, roadWidth: 9, use: 'residential', zone: null, versionIds: ['v-2026-08'],
}) === makeReferenceCode({
  asOf: '2026-10-11', plotArea: 200, roadWidth: 9, use: 'residential', zone: null, versionIds: ['v-2026-08'],
}))
check('reference codes differ for different plots on the same day', makeReferenceCode({
  asOf: '2026-10-11', plotArea: 200, roadWidth: 9, use: 'residential', zone: null, versionIds: ['v-2026-08'],
}) !== makeReferenceCode({
  asOf: '2026-10-11', plotArea: 450, roadWidth: 9, use: 'residential', zone: null, versionIds: ['v-2026-08'],
}))

console.log(failures === 0 ? '\nRENDER CHECKS PASSED' : `\n${failures} RENDER CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
