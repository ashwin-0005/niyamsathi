/**
 * The plot-check command centre.
 *
 * Owns all query state and the derived view models, then hands plain data to
 * presentational panels. Two invariants are load-bearing here:
 *
 *  - `asOf` is a single piece of state rendered by two controls (the input
 *    panel and the amendment timeline). They can never disagree about which
 *    rules are in force.
 *  - The AnswerCard grid honours the clerk's chosen topics, but the map and
 *    the compliance verdict always need all four core topics. So the engine is
 *    asked twice — same pure function, different topic lists — rather than the
 *    visual layer guessing at values it wasn't given.
 */
import { useCallback, useMemo, useState } from 'react'
import {
  ArrowLeft, BookOpenCheck, Check, ClipboardCopy, Database, FileDown, Languages,
  Printer, ScrollText, ShieldAlert, Sparkles, X,
} from 'lucide-react'
import PlotInputPanel from './PlotInputPanel'
import PlotComplianceMap from './PlotComplianceMap'
import ComplianceStatusCard from './ComplianceStatusCard'
import RuleResultCard from './RuleResultCard'
import RuleVersionTimeline from './RuleVersionTimeline'
import ComplianceSlip from './ComplianceSlip'
import DemoScenarioSelector from './DemoScenarioSelector'
import RuleExplorer from './RuleExplorer'
import WhyThisRule from './WhyThisRule'
import { ALL_TOPICS, answerQuery, formatValue, pageLabel } from '../lib/engine'
import { parseQuestion } from '../lib/parse'
import { computeComplianceStatus, CORE_TOPICS } from '../lib/compliance'
import { computePlotGeometry, type GeometryInput } from '../lib/geometry'
import { makeReferenceCode } from '../lib/referenceCode'
import {
  EMPTY_FORM, EMPTY_PLOT_DETAILS_FORM, toNumberOrNull, toPlotDetails,
  type FormState, type PlotDetailsFormState,
} from '../lib/formState'
import { useSpeechInput, useSpeechOutput } from '../lib/hooks'
import { DEMO_SCENARIOS, type DemoScenario } from '../lib/demoScenarios'
import { FIELD_LABEL, TOPIC_LABEL, USE_LABEL, bi, formatDate, t } from '../lib/i18n'
import type { Answer, ComplianceResult, Lang, PlotDetails, Query, Topic } from '../lib/types'

const TODAY = new Date().toISOString().slice(0, 10)

interface Result {
  query: Query
  answers: Answer[]
  extracted: Record<string, boolean> | null
  plotDetails: PlotDetails
  coreAnswers: Answer[]
}

/** Resolves already-computed core answers into the plain numbers geometry needs. */
function toGeometryInput(coreAnswers: Answer[], plotDetails: PlotDetails, query: Query): GeometryInput {
  const byTopic = new Map(coreAnswers.map((a) => [a.topic, a]))
  const requiredOf = (topic: Topic) => {
    const a = byTopic.get(topic)
    return a?.status === 'matched' ? (a.rule?.value.number ?? null) : null
  }
  return {
    plotArea: query.plotArea,
    plotWidth: plotDetails.plotWidth,
    plotDepth: plotDetails.plotDepth,
    roadWidth: query.roadWidth,
    required: {
      front: requiredOf('front_setback'),
      rear: requiredOf('rear_setback'),
      side: requiredOf('side_setback'),
    },
    proposed: {
      front: plotDetails.proposedFrontSetback,
      rear: plotDetails.proposedRearSetback,
      left: plotDetails.proposedLeftSetback,
      right: plotDetails.proposedRightSetback,
    },
  }
}

function queryFromForm(form: FormState, asOf: string, lang: Lang): Query {
  return {
    plotArea: toNumberOrNull(form.plotArea),
    roadWidth: toNumberOrNull(form.roadWidth),
    use: form.use === '' ? null : form.use,
    zone: form.zone.trim() || null,
    proposedFloors: toNumberOrNull(form.proposedFloors),
    topics: form.topics.length ? form.topics : [...ALL_TOPICS],
    asOf,
    lang,
  }
}

/**
 * Resolves `#/check?demo=<id>` into fully-populated initial state, so a demo
 * link lands on a finished check rather than an empty form. Computed during
 * render rather than in an effect, which keeps it server-renderable.
 */
function initialStateFor(scenarioId: string | null | undefined, lang: Lang) {
  const scenario = scenarioId ? DEMO_SCENARIOS.find((s) => s.id === scenarioId) : undefined
  if (!scenario) {
    return {
      form: EMPTY_FORM, plotDetailsForm: EMPTY_PLOT_DETAILS_FORM,
      asOf: TODAY, result: null as Result | null, scenarioId: null as string | null,
    }
  }
  const query = queryFromForm(scenario.form, scenario.asOf, lang)
  return {
    form: scenario.form,
    plotDetailsForm: scenario.plotDetailsForm,
    asOf: scenario.asOf,
    scenarioId: scenario.id,
    result: {
      query,
      answers: answerQuery(query),
      extracted: null,
      plotDetails: toPlotDetails(scenario.plotDetailsForm),
      coreAnswers: answerQuery({ ...query, topics: CORE_TOPICS }),
    } as Result,
  }
}

interface Props {
  lang: Lang
  onLangChange: (l: Lang) => void
  onExit: () => void
  /** Demo scenario to open pre-loaded, from `#/check?demo=<id>`. */
  initialScenarioId?: string | null
}

export default function Dashboard({ lang, onLangChange, onExit, initialScenarioId = null }: Props) {
  const [initial] = useState(() => initialStateFor(initialScenarioId, lang))
  const [tab, setTab] = useState<'check' | 'explorer'>('check')
  const [question, setQuestion] = useState('')
  const [form, setForm] = useState<FormState>(initial.form)
  const [plotDetailsForm, setPlotDetailsForm] = useState<PlotDetailsFormState>(initial.plotDetailsForm)
  const [asOf, setAsOf] = useState(initial.asOf)
  const [result, setResult] = useState<Result | null>(initial.result)
  const [focusedTopic, setFocusedTopic] = useState<Topic>('front_setback')
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(initial.scenarioId)
  const [slipOpen, setSlipOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const applyResult = useCallback(
    (query: Query, answers: Answer[], extracted: Record<string, boolean> | null, plotDetails: PlotDetails) => {
      setResult({
        query,
        answers,
        extracted,
        plotDetails,
        coreAnswers: answerQuery({ ...query, topics: CORE_TOPICS }),
      })
      setFocusedTopic('front_setback')
      setCopied(false)
    },
    [],
  )

  const handleSubmit = useCallback(() => {
    if (question.trim()) {
      const parsed = parseQuestion(question, asOf)
      const { extracted, plotDetails: parsedDetails, ...query } = parsed
      // A typed topic selection still wins over whatever the text implied.
      const merged: Query = { ...query, topics: form.topics.length ? form.topics : query.topics }
      applyResult(merged, answerQuery(merged), extracted, toPlotDetails(plotDetailsForm, parsedDetails))
    } else {
      const query = queryFromForm(form, asOf, lang)
      applyResult(query, answerQuery(query), null, toPlotDetails(plotDetailsForm))
    }
    setActiveScenarioId(null)
  }, [question, asOf, form, plotDetailsForm, lang, applyResult])

  const handleLoadScenario = useCallback(
    (scenario: DemoScenario) => {
      setQuestion('')
      setForm(scenario.form)
      setPlotDetailsForm(scenario.plotDetailsForm)
      setAsOf(scenario.asOf)
      setActiveScenarioId(scenario.id)
      // Built from the scenario directly: the setters above have not flushed yet.
      const query = queryFromForm(scenario.form, scenario.asOf, lang)
      applyResult(query, answerQuery(query), null, toPlotDetails(scenario.plotDetailsForm))
    },
    [lang, applyResult],
  )

  const handleClear = useCallback(() => {
    setQuestion('')
    setForm(EMPTY_FORM)
    setPlotDetailsForm(EMPTY_PLOT_DETAILS_FORM)
    setResult(null)
    setActiveScenarioId(null)
    setSlipOpen(false)
    setCopied(false)
  }, [])

  const answerLang: Lang = result ? result.query.lang : lang

  const geometry = useMemo(
    () => (result ? computePlotGeometry(toGeometryInput(result.coreAnswers, result.plotDetails, result.query)) : null),
    [result],
  )

  const complianceResult: ComplianceResult | null = useMemo(
    () =>
      result && geometry
        ? computeComplianceStatus(
            result.coreAnswers,
            result.plotDetails,
            result.query.proposedFloors,
            geometry.buildableRect === null,
          )
        : null,
    [result, geometry],
  )

  const focusedAnswer = result ? result.coreAnswers.find((a) => a.topic === focusedTopic) ?? null : null

  const referenceCode = useMemo(
    () =>
      result
        ? makeReferenceCode({
            asOf: result.query.asOf,
            plotArea: result.query.plotArea,
            roadWidth: result.query.roadWidth,
            use: result.query.use,
            zone: result.query.zone,
            versionIds: result.answers.map((a) => a.version?.id).filter((x): x is string => !!x),
          })
        : '',
    [result],
  )

  /** Headline figure + rule number only — the full citation stays on screen. */
  const spokenSummary = useMemo(() => {
    if (!result) return null
    const a = result.answers.find((x) => x.status === 'matched' && x.rule && x.source)
    if (!a?.rule || !a.source) return null
    const topic = TOPIC_LABEL[a.topic][answerLang]
    const value = formatValue(a.rule.value, answerLang)
    return answerLang === 'hi'
      ? `इस प्लॉट के लिए ${topic} ${value} है। स्रोत: ${a.source.ruleNumber}, ${a.source.tableNumber}।`
      : `For this plot, the ${topic.toLowerCase()} is ${value}. Source: ${a.source.ruleNumber}, ${a.source.tableNumber}.`
  }, [result, answerLang])

  const voiceInput = useSpeechInput(lang, setQuestion)
  const voiceOutput = useSpeechOutput(answerLang)

  const plainText = useMemo(() => {
    if (!result) return ''
    const L = answerLang
    const lines: string[] = [
      `${t('appName', L)} — ${t('tagline', L)}`,
      `${t('asOf', L)}: ${formatDate(result.query.asOf, L)}`,
    ]
    if (result.query.rawText) lines.push(`Q: ${result.query.rawText}`)
    lines.push('')
    for (const a of result.answers) {
      const name = TOPIC_LABEL[a.topic][L]
      if (a.status === 'matched' && a.rule && a.source && a.version) {
        lines.push(`${name}: ${formatValue(a.rule.value, L)}`)
        lines.push(`  ${t('source', L)}: ${a.source.ruleNumber}, ${a.source.tableNumber}, ${t('page', L)} ${pageLabel(a.source)}`)
        lines.push(`  ${t('version', L)}: ${bi(a.version.label, L)}`)
        for (const d of a.derived) lines.push(`  ${bi(d.label, L)}: ${d.value} (${bi(d.formula, L)})`)
      } else if (a.status === 'needs_input') {
        lines.push(`${name}: ${t('needsInput', L)} — ${a.missing.map((m) => bi(FIELD_LABEL[m], L)).join(', ')}`)
      } else {
        lines.push(`${name}: ${t('noRule', L)}`)
      }
      lines.push('')
    }
    lines.push(t('demoBanner', L))
    return lines.join('\n')
  }, [result, answerLang])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const understood: [string, string | null][] = result
    ? [
        ['plotArea', result.query.plotArea === null ? null : `${result.query.plotArea} ${t('unitSqm', lang)}`],
        ['roadWidth', result.query.roadWidth === null ? null : `${result.query.roadWidth} ${t('unitM', lang)}`],
        ['use', result.query.use === null ? null : USE_LABEL[result.query.use][lang]],
        ['proposedFloors', result.query.proposedFloors === null ? null : String(result.query.proposedFloors)],
      ]
    : []

  return (
    <div className={slipOpen ? 'slip-open' : undefined} lang={lang}>
      <div className="app-root min-h-screen">
        {/* ---- Header ------------------------------------------------- */}
        <header className="no-print sticky top-0 z-40 border-b border-line/70 bg-void/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[110rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onExit} className="btn-icon focus-ring" aria-label={t('backToHome', lang)}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white/[0.04]">
                  <ScrollText className="h-4.5 w-4.5 text-teal" aria-hidden="true" />
                </span>
                <span className="leading-tight">
                  <span className="display metal block text-sm font-extrabold">{t('appName', lang)}</span>
                  <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
                    {t('dashboardTitle', lang)}
                  </span>
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <nav className="flex rounded-xl border border-line p-0.5" aria-label="Views">
                {([['check', Sparkles, t('dashboardTitle', lang)], ['explorer', Database, t('explorerTab', lang)]] as const).map(
                  ([id, Icon, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTab(id)}
                      aria-pressed={tab === id}
                      className={
                        tab === id
                          ? 'focus-ring inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-paper'
                          : 'focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition hover:text-paper'
                      }
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {label}
                    </button>
                  ),
                )}
              </nav>

              <div className="flex items-center gap-0.5 rounded-xl border border-line bg-white/[0.03] p-0.5" role="group" aria-label={t('langToggle', lang)}>
                <Languages className="ml-1.5 h-3.5 w-3.5 text-faint" aria-hidden="true" />
                {(['en', 'hi'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onLangChange(l)}
                    aria-pressed={lang === l}
                    className={
                      lang === l
                        ? 'focus-ring rounded-lg bg-chrome px-2.5 py-1 text-xs font-bold text-void'
                        : 'focus-ring rounded-lg px-2.5 py-1 text-xs font-medium text-muted transition hover:text-paper'
                    }
                  >
                    {l === 'en' ? 'EN' : 'हिं'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[110rem] px-4 py-5 sm:px-6">
          <p className="tint-saffron mb-5 flex gap-2.5 rounded-xl border px-4 py-2.5 text-xs">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t('demoBanner', lang)}</span>
          </p>

          {tab === 'explorer' ? (
            <RuleExplorer lang={lang} />
          ) : (
            <div className="space-y-5">
              <DemoScenarioSelector lang={lang} onLoad={handleLoadScenario} activeId={activeScenarioId} />

              <div className="grid items-start gap-5 xl:grid-cols-12">
                {/* ---- Left: inputs ---------------------------------- */}
                <div className="xl:col-span-3">
                  <PlotInputPanel
                    lang={lang}
                    question={question}
                    onQuestionChange={setQuestion}
                    form={form}
                    onFormChange={setForm}
                    plotDetailsForm={plotDetailsForm}
                    onPlotDetailsFormChange={setPlotDetailsForm}
                    asOf={asOf}
                    onAsOfChange={setAsOf}
                    onSubmit={handleSubmit}
                    onClear={handleClear}
                    voiceInput={voiceInput}
                    voiceOutput={voiceOutput}
                    spokenSummary={spokenSummary}
                  />
                </div>

                {/* ---- Centre: the map ------------------------------- */}
                <div className="space-y-5 xl:col-span-5">
                  {result && geometry ? (
                    <>
                      <section className="panel px-5 py-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
                            <BookOpenCheck className="h-3 w-3" aria-hidden="true" />
                            {result.extracted ? t('understood', lang) : t('topicsAsked', lang)}
                          </p>
                          <p className="numeric text-[11px] text-faint">
                            {t('asOf', lang)} {formatDate(result.query.asOf, lang)}
                          </p>
                        </div>
                        <dl className="mt-2 flex flex-wrap gap-1.5">
                          {understood.map(([field, value]) => (
                            <div key={field} className={value ? 'chip tint-ok border text-[11px]' : 'chip text-[11px]'}>
                              <dt className="font-normal opacity-70">{bi(FIELD_LABEL[field], lang)}:</dt>
                              <dd className="numeric font-bold">{value ?? t('notFound', lang)}</dd>
                            </div>
                          ))}
                        </dl>
                      </section>

                      <PlotComplianceMap
                        lang={answerLang}
                        geometry={geometry}
                        roadWidth={result.query.roadWidth}
                        plotDetails={result.plotDetails}
                        coreAnswers={result.coreAnswers}
                        proposedFloors={result.query.proposedFloors}
                        onFocusTopic={setFocusedTopic}
                      />

                      <WhyThisRule lang={answerLang} query={result.query} answer={focusedAnswer} />
                    </>
                  ) : (
                    <section className="panel grid min-h-[22rem] place-items-center p-10 text-center">
                      <div>
                        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-line bg-white/[0.03]">
                          <Sparkles className="h-5 w-5 text-faint" aria-hidden="true" />
                        </span>
                        <p className="display mt-4 text-base font-bold text-paper">{t('awaitingInput', lang)}</p>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-faint">
                          {t('awaitingInputHelp', lang)}
                        </p>
                      </div>
                    </section>
                  )}
                </div>

                {/* ---- Right: verdict + cited results ---------------- */}
                <div className="space-y-4 xl:col-span-4">
                  {result && complianceResult ? (
                    <>
                      <ComplianceStatusCard lang={answerLang} result={complianceResult} />

                      <div className="no-print flex flex-wrap gap-2">
                        <button type="button" onClick={handleCopy} className="btn btn-ghost focus-ring flex-1 text-xs">
                          {copied ? <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" /> : <ClipboardCopy className="h-3.5 w-3.5" aria-hidden="true" />}
                          {copied ? t('copied', lang) : t('copy', lang)}
                        </button>
                        <button type="button" onClick={() => window.print()} className="btn btn-ghost focus-ring text-xs">
                          <Printer className="h-3.5 w-3.5" aria-hidden="true" /> {t('print', lang)}
                        </button>
                      </div>

                      <h2 className="display px-1 pt-1 text-sm font-bold text-paper">{t('panelResults', lang)}</h2>
                      {result.answers.map((a, i) => (
                        <RuleResultCard key={a.topic} answer={a} lang={answerLang} index={i} />
                      ))}
                    </>
                  ) : (
                    <section className="panel p-6">
                      <p className="text-sm text-faint">{t('awaitingInputHelp', lang)}</p>
                    </section>
                  )}
                </div>
              </div>

              {/* ---- Bottom: timeline + slip ------------------------- */}
              {result && complianceResult && (
                <div className="grid items-start gap-5 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <RuleVersionTimeline
                      lang={answerLang}
                      asOf={asOf}
                      onAsOfChange={setAsOf}
                      focusedAnswer={focusedAnswer}
                    />
                  </div>

                  <section className="panel no-print p-5">
                    <p className="display text-sm font-bold text-paper">{t('slipTitle', lang)}</p>
                    <p className="mt-2 text-xs leading-relaxed text-faint">{t('slipDisclaimer', lang)}</p>
                    <div className="panel-inset numeric mt-3 flex items-center justify-between px-3 py-2 text-xs">
                      <span className="text-faint">{t('slipReference', lang)}</span>
                      <span className="font-bold tracking-wider text-teal">{referenceCode}</span>
                    </div>
                    <button type="button" onClick={() => setSlipOpen(true)} className="btn btn-primary focus-ring mt-3 w-full">
                      <FileDown className="h-4 w-4" aria-hidden="true" />
                      {t('downloadSlip', lang)}
                    </button>
                  </section>
                </div>
              )}
            </div>
          )}

          <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-faint">
            {t('trustDisclaimer', lang)}
          </p>
        </main>
      </div>

      {/* ---- Printable slip ------------------------------------------- */}
      {result && complianceResult && (
        <div className="slip-root">
          <div className="mx-auto max-w-3xl">
            <div className="no-print mb-3 flex items-center justify-end gap-2">
              <button type="button" onClick={() => window.print()} className="btn btn-primary focus-ring">
                <Printer className="h-4 w-4" aria-hidden="true" /> {t('printSlip', lang)}
              </button>
              <button type="button" onClick={() => setSlipOpen(false)} className="btn btn-ghost focus-ring">
                <X className="h-4 w-4" aria-hidden="true" /> {t('closeSlip', lang)}
              </button>
            </div>
            <ComplianceSlip
              lang={answerLang}
              asOf={result.query.asOf}
              dateIssued={TODAY}
              plotArea={result.query.plotArea}
              roadWidth={result.query.roadWidth}
              use={result.query.use}
              zone={result.query.zone}
              plotDetails={result.plotDetails}
              answers={result.answers}
              complianceResult={complianceResult}
              referenceCode={referenceCode}
            />
          </div>
        </div>
      )}
    </div>
  )
}
