/**
 * Server-renders every component in both languages and asserts the things
 * that must never silently disappear: citations, demo-data labelling, the
 * "not an approval" disclaimers, and each branch of the compliance verdict.
 *
 * Running through `renderToStaticMarkup` also pins the SSR-safety contract in
 * `lib/hooks.ts` — anything that touched `window` during render would throw
 * here rather than in a user's browser.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import App from '../src/App'
import LandingPage from '../src/components/LandingPage'
import Dashboard from '../src/components/Dashboard'
import RuleResultCard from '../src/components/RuleResultCard'
import RuleExplorer from '../src/components/RuleExplorer'
import PlotInputPanel from '../src/components/PlotInputPanel'
import PlotComplianceMap from '../src/components/PlotComplianceMap'
import IsometricPlotScene from '../src/components/IsometricPlotScene'
import ComplianceStatusCard from '../src/components/ComplianceStatusCard'
import RuleVersionTimeline from '../src/components/RuleVersionTimeline'
import ComplianceSlip from '../src/components/ComplianceSlip'
import DemoScenarioSelector from '../src/components/DemoScenarioSelector'
import VoiceAssistantControl from '../src/components/VoiceAssistantControl'
import CitationDrawer from '../src/components/CitationDrawer'
import WhyThisRule from '../src/components/WhyThisRule'
import { answerQuery, ALL_TOPICS, SOURCES, VERSION_BY_ID } from '../src/lib/engine'
import { parseQuestion } from '../src/lib/parse'
import { computeComplianceStatus, CORE_TOPICS } from '../src/lib/compliance'
import { computePlotGeometry, type GeometryInput } from '../src/lib/geometry'
import { makeReferenceCode } from '../src/lib/referenceCode'
import { DEMO_SCENARIOS } from '../src/lib/demoScenarios'
import { EMPTY_FORM, EMPTY_PLOT_DETAILS_FORM, toNumberOrNull } from '../src/lib/formState'
import { COMPLIANCE_STATUS_LABEL, t } from '../src/lib/i18n'
import type { VoiceInput, VoiceOutput } from '../src/lib/hooks'
import type { Answer, Lang, PlotDetails, Query, Topic } from '../src/lib/types'

let failures = 0
const check = (name: string, cond: boolean, detail = '') => {
  if (!cond) { failures++; console.log(`  FAIL  ${name} ${detail}`) } else console.log(`  ok    ${name}`)
}

const LANGS: Lang[] = ['en', 'hi']
const noop = () => {}

function toPlotDetails(f: typeof EMPTY_PLOT_DETAILS_FORM): PlotDetails {
  return {
    plotWidth: toNumberOrNull(f.plotWidth), plotDepth: toNumberOrNull(f.plotDepth),
    roadFacing: f.roadFacing || null,
    proposedFrontSetback: toNumberOrNull(f.proposedFrontSetback),
    proposedRearSetback: toNumberOrNull(f.proposedRearSetback),
    proposedLeftSetback: toNumberOrNull(f.proposedLeftSetback),
    proposedRightSetback: toNumberOrNull(f.proposedRightSetback),
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

function runScenario(index: number) {
  const s = DEMO_SCENARIOS[index]
  const query: Query = {
    plotArea: toNumberOrNull(s.form.plotArea), roadWidth: toNumberOrNull(s.form.roadWidth),
    use: s.form.use === '' ? null : s.form.use, zone: s.form.zone.trim() || null,
    proposedFloors: toNumberOrNull(s.form.proposedFloors),
    topics: s.form.topics.length ? s.form.topics : [...ALL_TOPICS],
    asOf: s.asOf, lang: 'en',
  }
  const coreAnswers = answerQuery({ ...query, topics: CORE_TOPICS })
  const plotDetails = toPlotDetails(s.plotDetailsForm)
  const geometry = computePlotGeometry(toGeometryInput(coreAnswers, plotDetails, query))
  const compliance = computeComplianceStatus(
    coreAnswers, plotDetails, query.proposedFloors, geometry.buildableRect === null,
  )
  return { scenario: s, query, answers: answerQuery(query), coreAnswers, plotDetails, geometry, compliance }
}

const VOICE_IN: VoiceInput = {
  supported: false, listening: false, interim: '', error: null, start: noop, stop: noop,
}
const VOICE_OUT: VoiceOutput = { supported: false, speaking: false, speak: noop, cancel: noop }

// ===========================================================================
console.log('--- App shell and landing ---')

const app = renderToStaticMarkup(<App />)
check('App renders', app.length > 3000, `${app.length} chars`)
check('App defaults to the landing view', app.includes(t('heroHeadline', 'en')))
check('Landing surfaces the demo-data caveat', app.includes('Demo dataset'))

for (const lang of LANGS) {
  const html = renderToStaticMarkup(<LandingPage lang={lang} onLangChange={noop} onStart={noop} />)
  check(`LandingPage renders in ${lang}`, html.length > 4000)
  check(`LandingPage headline in ${lang}`, html.includes(t('heroHeadline', lang)))
  check(`LandingPage shows all 4 features in ${lang}`,
    [1, 2, 3, 4].every((n) => html.includes(t(`feat${n}Title` as 'feat1Title', lang))))
  check(`LandingPage shows the 3-step flow in ${lang}`,
    [1, 2, 3].every((n) => html.includes(t(`how${n}Title` as 'how1Title', lang))))
  check(`LandingPage carries the authority disclaimer in ${lang}`, html.includes(t('landingDisclaimer', lang)))
  check(`LandingPage hero visual is an inline SVG in ${lang}`, html.includes('<svg'))
}

console.log('\n--- Dashboard ---')
for (const lang of LANGS) {
  const html = renderToStaticMarkup(<Dashboard lang={lang} onLangChange={noop} onExit={noop} />)
  check(`Dashboard renders in ${lang}`, html.length > 4000)
  check(`Dashboard shows demo scenarios in ${lang}`, html.includes(t('demoTitle', lang)))
  check(`Dashboard shows the empty state before a check in ${lang}`, html.includes(t('awaitingInput', lang)))
  check(`Dashboard carries the trust disclaimer in ${lang}`, html.includes(t('trustDisclaimer', lang)))
}

// ===========================================================================
console.log('\n--- Dashboard, pre-loaded via a demo deep link ---')
for (const scenario of DEMO_SCENARIOS) {
  for (const lang of LANGS) {
    const html = renderToStaticMarkup(
      <Dashboard lang={lang} onLangChange={noop} onExit={noop} initialScenarioId={scenario.id} />,
    )
    check(`Dashboard renders a populated check for "${scenario.id}" in ${lang}`,
      html.length > 8000 && !html.includes(t('awaitingInput', lang)), `${html.length} chars`)
    check(`  "${scenario.id}" shows the plot map in ${lang}`, html.includes(t('mapTitle', lang)))
    check(`  "${scenario.id}" shows a compliance verdict in ${lang}`,
      Object.values(COMPLIANCE_STATUS_LABEL).some((l) => html.includes(l[lang])))
    check(`  "${scenario.id}" offers the compliance slip in ${lang}`, html.includes(t('downloadSlip', lang)))
    check(`  "${scenario.id}" shows the amendment timeline in ${lang}`, html.includes(t('timelineTitle', lang)))
  }
}
check('an unknown demo id falls back to the empty state, not a crash',
  renderToStaticMarkup(<Dashboard lang="en" onLangChange={noop} onExit={noop} initialScenarioId="nope" />)
    .includes(t('awaitingInput', 'en')))

console.log('\n--- Rule results and citations ---')

const q = parseQuestion('My plot is 200 sq m residential on a 9 m road. Tell me everything.', '2026-10-11')
const answers = answerQuery(q)
for (const lang of LANGS) {
  const html = answers.map((a, i) => renderToStaticMarkup(<RuleResultCard answer={a} lang={lang} index={i} />)).join('')
  check(`RuleResultCard renders all ${answers.length} topics in ${lang}`, html.length > 4000)
  check(`${lang}: citation present`, html.includes('Table 8-A') && html.includes('42A'))
  check(`${lang}: demo badge present`, html.includes(t('demoDataBadge', lang)))
}

const needsInput = answerQuery(parseQuestion('What is the FAR?', '2026-10-11'))
check('needs_input card names the missing fields, with no value',
  renderToStaticMarkup(<RuleResultCard answer={needsInput[0]} lang="en" index={0} />).includes(t('needsInput', 'en')))

const sampleSource = SOURCES.find((s) => s.excerptStatus === 'placeholder')!
const sampleVersion = VERSION_BY_ID.get(sampleSource.versionId)!
for (const lang of LANGS) {
  const html = renderToStaticMarkup(
    <CitationDrawer source={sampleSource} version={sampleVersion} lang={lang} alwaysOpen />,
  )
  check(`CitationDrawer shows the exact wording in ${lang}`, html.includes(t('exactWording', lang)))
  check(`CitationDrawer flags placeholder text as not-from-the-gazette in ${lang}`,
    html.includes(t('placeholderText', lang)))
}

check('RuleExplorer renders', renderToStaticMarkup(<RuleExplorer lang="en" />).length > 5000)
check('RuleExplorer renders in Hindi', renderToStaticMarkup(<RuleExplorer lang="hi" />).includes('फ्रंट सेटबैक'))

for (const lang of LANGS) {
  const html = renderToStaticMarkup(
    <PlotInputPanel
      lang={lang} question="" onQuestionChange={noop}
      form={EMPTY_FORM} onFormChange={noop}
      plotDetailsForm={EMPTY_PLOT_DETAILS_FORM} onPlotDetailsFormChange={noop}
      asOf="2026-10-11" onAsOfChange={noop} onSubmit={noop} onClear={noop}
      voiceInput={VOICE_IN} voiceOutput={VOICE_OUT} spokenSummary={null}
    />,
  )
  check(`PlotInputPanel renders required fields in ${lang}`,
    html.includes('id="plotArea"') && html.includes('id="roadWidth"') && html.includes('id="use"'))
  check(`PlotInputPanel renders geometry fields in ${lang}`,
    html.includes('id="plotWidth"') && html.includes('id="roadFacing"') && html.includes('id="proposedFrontSetback"'))
  check(`PlotInputPanel offers the voice control in ${lang}`, html.includes(t('askByVoice', lang)))
}

for (const lang of LANGS) {
  const html = renderToStaticMarkup(
    <VoiceAssistantControl lang={lang} input={VOICE_IN} output={VOICE_OUT} spokenSummary="x" />,
  )
  check(`VoiceAssistantControl degrades gracefully when unsupported in ${lang}`,
    html.includes(t('voiceUnsupported', lang)))
}

// ===========================================================================
console.log('\n--- Scenario 1: clean match ---')
const s1 = runScenario(0)
check('standard scenario resolves to match', s1.compliance.status === 'match', s1.compliance.status)
check('standard scenario uses real (non-illustrative) dimensions', !s1.geometry.isIllustrative)
check('standard scenario has a buildable envelope', s1.geometry.buildableRect !== null)

console.log('\n--- Scenario 2: amendment overrides ---')
const s2 = runScenario(1)
const s2Front = s2.coreAnswers.find((a) => a.topic === 'front_setback')
check('450 sq m plot is governed by the Aug 2026 amendment', s2Front?.version?.id === 'v-2026-08')
check('450 sq m plot keeps the superseded March 2025 row on record', (s2Front?.superseded.length ?? 0) > 0)

console.log('\n--- Scenario 3: violation ---')
const s3 = runScenario(2)
check('violation scenario resolves to violation', s3.compliance.status === 'violation', s3.compliance.status)
check('violation scenario records a front-setback violation', s3.compliance.violations.some((v) => v.zone === 'front'))
check('violation scenario draws the encroachment strip', s3.geometry.zones.front.violationRect !== null)
check('encroachment strip touches the buildable interior, not the outer plot edge',
  s3.geometry.zones.front.violationRect !== null &&
  Math.abs(s3.geometry.zones.front.violationRect!.y - s3.geometry.zones.front.requiredRect.y) < 0.01)

console.log('\n--- Scenario 4: missing details ---')
const s4 = runScenario(3)
check('missing-details scenario resolves to needs_input', s4.compliance.status === 'needs_input', s4.compliance.status)
check('missing-details scenario falls back to an illustrative layout', s4.geometry.isIllustrative)

const impossible = computePlotGeometry({
  plotArea: 20, plotWidth: 4, plotDepth: 5, roadWidth: 9,
  required: { front: 3, rear: 3, side: 3 }, proposed: { front: null, rear: null, left: null, right: null },
})
check('setbacks exceeding the plot clamp buildableRect to null', impossible.buildableRect === null)
const officerReview = computeComplianceStatus(s1.coreAnswers, s1.plotDetails, null, true)
check('no buildable footprint forces officer_review', officerReview.status === 'officer_review', officerReview.status)

// ===========================================================================
console.log('\n--- Visual components, both languages ---')

for (const lang of LANGS) {
  const mapHtml = renderToStaticMarkup(
    <PlotComplianceMap
      lang={lang} geometry={s3.geometry} roadWidth={s3.query.roadWidth}
      plotDetails={s3.plotDetails} coreAnswers={s3.coreAnswers}
      proposedFloors={s3.query.proposedFloors} onFocusTopic={noop}
    />,
  )
  check(`PlotComplianceMap renders (violation) in ${lang}`, mapHtml.length > 1500)
  check(`PlotComplianceMap shows the legend in ${lang}`, mapHtml.includes(t('legend', lang)))
  check(`PlotComplianceMap offers plan and 3D views in ${lang}`,
    mapHtml.includes(t('mapPlanView', lang)) && mapHtml.includes(t('mapIsoView', lang)))
  check(`PlotComplianceMap offers all four map controls in ${lang}`,
    [t('mapResetView', lang), t('mapToggleDimensions', lang), t('mapToggleCitations', lang), t('mapFullscreen', lang)]
      .every((label) => mapHtml.includes(label)))

  const illustrative = renderToStaticMarkup(
    <PlotComplianceMap
      lang={lang} geometry={s4.geometry} roadWidth={s4.query.roadWidth}
      plotDetails={s4.plotDetails} coreAnswers={s4.coreAnswers}
      proposedFloors={null} onFocusTopic={noop}
    />,
  )
  check(`PlotComplianceMap states the layout is illustrative in ${lang}`, illustrative.includes(t('mapIllustrative', lang)))

  const iso = renderToStaticMarkup(
    <IsometricPlotScene geometry={s1.geometry} floors={2} lang={lang} className="x" />,
  )
  check(`IsometricPlotScene renders polygons in ${lang}`, iso.includes('<polygon') && iso.length > 800)

  const states = [
    ['match', s1.compliance], ['violation', s3.compliance],
    ['needs_input', s4.compliance], ['officer_review', officerReview],
  ] as const
  for (const [label, res] of states) {
    const html = renderToStaticMarkup(<ComplianceStatusCard lang={lang} result={res} />)
    check(`ComplianceStatusCard renders ${label} in ${lang}`, html.includes(COMPLIANCE_STATUS_LABEL[res.status][lang]))
    check(`ComplianceStatusCard keeps the disclaimer on ${label} in ${lang}`,
      html.includes(t('statusCardDisclaimer', lang)))
  }

  const timeline = renderToStaticMarkup(
    <RuleVersionTimeline lang={lang} asOf="2026-10-11" onAsOfChange={noop} focusedAnswer={s2Front ?? null} />,
  )
  check(`RuleVersionTimeline renders in ${lang}`, timeline.length > 500)
  check(`RuleVersionTimeline explains the amendment override in ${lang}`, timeline.includes(t('timelineApplies', lang)))

  const why = renderToStaticMarkup(<WhyThisRule lang={lang} query={s2.query} answer={s2Front ?? null} />)
  check(`WhyThisRule renders the reasoning chain in ${lang}`, why.includes(t('whyThisRule', lang)))
  check(`WhyThisRule explains why the newer record wins in ${lang}`, why.includes(t('whySupersedeText', lang)))

  const refCode = makeReferenceCode({
    asOf: s3.query.asOf, plotArea: s3.query.plotArea, roadWidth: s3.query.roadWidth,
    use: s3.query.use, zone: s3.query.zone,
    versionIds: s3.answers.map((a) => a.version?.id).filter((x): x is string => !!x),
  })
  const slip = renderToStaticMarkup(
    <ComplianceSlip
      lang={lang} asOf={s3.query.asOf} dateIssued="2026-10-11"
      plotArea={s3.query.plotArea} roadWidth={s3.query.roadWidth} use={s3.query.use} zone={s3.query.zone}
      plotDetails={s3.plotDetails} answers={s3.answers} complianceResult={s3.compliance} referenceCode={refCode}
    />,
  )
  check(`ComplianceSlip renders with its reference code in ${lang}`, slip.includes(refCode))
  check(`ComplianceSlip states it is not an approval in ${lang}`, slip.includes(t('slipDisclaimer', lang)))
  check(`ComplianceSlip labels the data as demo in ${lang}`, slip.includes(t('demoDataBadge', lang)))

  const demos = renderToStaticMarkup(<DemoScenarioSelector lang={lang} onLoad={noop} />)
  check(`DemoScenarioSelector renders all 4 scenarios in ${lang}`,
    DEMO_SCENARIOS.every((s) => demos.includes(s.title[lang])))
}

console.log('\n--- Reference code ---')
const refArgs = {
  asOf: '2026-10-11', plotArea: 200, roadWidth: 9, use: 'residential', zone: null, versionIds: ['v-2026-08'],
}
check('identical inputs produce an identical code', makeReferenceCode(refArgs) === makeReferenceCode({ ...refArgs }))
check('a different plot produces a different code on the same day',
  makeReferenceCode(refArgs) !== makeReferenceCode({ ...refArgs, plotArea: 450 }))

console.log(failures === 0 ? '\nRENDER CHECKS PASSED' : `\n${failures} RENDER CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
