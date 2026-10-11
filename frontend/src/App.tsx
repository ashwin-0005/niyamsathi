import { useMemo, useState } from 'react'
import {
  BookOpenCheck, Check, ClipboardCopy, Database, FileDown, Languages, Printer,
  ScrollText, ShieldAlert, Sparkles, X,
} from 'lucide-react'
import QueryPanel, { EMPTY_PLOT_DETAILS_FORM, type FormState, type PlotDetailsFormState } from './components/QueryPanel'
import AnswerCard from './components/AnswerCard'
import RuleExplorer from './components/RuleExplorer'
import PlotComplianceMap from './components/PlotComplianceMap'
import ComplianceStatusCard from './components/ComplianceStatusCard'
import RuleVersionTimeline from './components/RuleVersionTimeline'
import ComplianceSlip from './components/ComplianceSlip'
import DemoScenarioSelector from './components/DemoScenarioSelector'
import { ALL_TOPICS, answerQuery, formatValue, pageLabel } from './lib/engine'
import { parseQuestion } from './lib/parse'
import { computeComplianceStatus, CORE_TOPICS } from './lib/compliance'
import { computePlotGeometry, type GeometryInput } from './lib/geometry'
import { makeReferenceCode } from './lib/referenceCode'
import type { DemoScenario } from './lib/demoScenarios'
import { FIELD_LABEL, TOPIC_LABEL, USE_LABEL, bi, formatDate, t } from './lib/i18n'
import type { Answer, ComplianceResult, Lang, PlotDetails, Query, Topic } from './lib/types'

const TODAY = new Date().toISOString().slice(0, 10)

const EMPTY_FORM: FormState = {
  plotArea: '', roadWidth: '', use: '', zone: '', proposedFloors: '', topics: [],
}

interface Result {
  query: Query
  answers: Answer[]
  extracted: Record<string, boolean> | null
  plotDetails: PlotDetails
  coreAnswers: Answer[]
}

function toNumberOrNull(v: string): number | null {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

function toPlotDetails(f: PlotDetailsFormState, overrides: Partial<PlotDetails> = {}): PlotDetails {
  return {
    plotWidth: overrides.plotWidth ?? toNumberOrNull(f.plotWidth),
    plotDepth: overrides.plotDepth ?? toNumberOrNull(f.plotDepth),
    roadFacing: overrides.roadFacing ?? (f.roadFacing || null),
    proposedFrontSetback: toNumberOrNull(f.proposedFrontSetback),
    proposedRearSetback: toNumberOrNull(f.proposedRearSetback),
    proposedLeftSetback: toNumberOrNull(f.proposedLeftSetback),
    proposedRightSetback: toNumberOrNull(f.proposedRightSetback),
  }
}

/** Resolves already-computed core-topic Answers into the plain numbers `geometry.ts` needs. */
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

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const [tab, setTab] = useState<'assistant' | 'explorer'>('assistant')
  const [mode, setMode] = useState<'ask' | 'form'>('ask')
  const [question, setQuestion] = useState('')
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [plotDetailsForm, setPlotDetailsForm] = useState<PlotDetailsFormState>(EMPTY_PLOT_DETAILS_FORM)
  const [asOf, setAsOf] = useState(TODAY)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState(false)
  const [focusedTopic, setFocusedTopic] = useState<Topic>('front_setback')
  const [slipOpen, setSlipOpen] = useState(false)

  const applyResult = (
    query: Query,
    answers: Answer[],
    extracted: Record<string, boolean> | null,
    plotDetails: PlotDetails,
  ) => {
    const coreAnswers = answerQuery({ ...query, topics: CORE_TOPICS })
    setResult({ query, answers, extracted, plotDetails, coreAnswers })
    setFocusedTopic('front_setback')
    setCopied(false)
  }

  const handleSubmit = () => {
    if (mode === 'ask') {
      if (!question.trim()) return
      const parsed = parseQuestion(question, asOf)
      const { extracted, plotDetails: parsedPlotDetails, ...query } = parsed
      applyResult(query, answerQuery(query), extracted, toPlotDetails(plotDetailsForm, parsedPlotDetails))
    } else {
      const query: Query = {
        plotArea: toNumberOrNull(form.plotArea),
        roadWidth: toNumberOrNull(form.roadWidth),
        use: form.use === '' ? null : form.use,
        zone: form.zone.trim() || null,
        proposedFloors: toNumberOrNull(form.proposedFloors),
        topics: form.topics.length ? form.topics : [...ALL_TOPICS],
        asOf,
        lang,
      }
      applyResult(query, answerQuery(query), null, toPlotDetails(plotDetailsForm))
    }
  }

  const handleLoadScenario = (scenario: DemoScenario) => {
    setMode('form')
    setForm(scenario.form)
    setPlotDetailsForm(scenario.plotDetailsForm)
    setAsOf(scenario.asOf)
    // Build the query from the scenario data directly rather than from state —
    // state setters above are async, so `form`/`asOf` aren't updated yet here.
    const query: Query = {
      plotArea: toNumberOrNull(scenario.form.plotArea),
      roadWidth: toNumberOrNull(scenario.form.roadWidth),
      use: scenario.form.use === '' ? null : scenario.form.use,
      zone: scenario.form.zone.trim() || null,
      proposedFloors: toNumberOrNull(scenario.form.proposedFloors),
      topics: scenario.form.topics.length ? scenario.form.topics : [...ALL_TOPICS],
      asOf: scenario.asOf,
      lang,
    }
    applyResult(query, answerQuery(query), null, toPlotDetails(scenario.plotDetailsForm))
  }

  const handleClear = () => {
    setQuestion('')
    setForm(EMPTY_FORM)
    setPlotDetailsForm(EMPTY_PLOT_DETAILS_FORM)
    setResult(null)
    setCopied(false)
    setSlipOpen(false)
  }

  const answerLang: Lang = result ? result.query.lang : lang

  const geometry = useMemo(() => {
    if (!result) return null
    return computePlotGeometry(toGeometryInput(result.coreAnswers, result.plotDetails, result.query))
  }, [result])

  const complianceResult: ComplianceResult | null = useMemo(() => {
    if (!result || !geometry) return null
    return computeComplianceStatus(
      result.coreAnswers,
      result.plotDetails,
      result.query.proposedFloors,
      geometry.buildableRect === null,
    )
  }, [result, geometry])

  const focusedAnswer = result ? result.coreAnswers.find((a) => a.topic === focusedTopic) ?? null : null

  const referenceCode = useMemo(() => {
    if (!result) return ''
    return makeReferenceCode({
      asOf: result.query.asOf,
      plotArea: result.query.plotArea,
      roadWidth: result.query.roadWidth,
      use: result.query.use,
      zone: result.query.zone,
      versionIds: result.answers.map((a) => a.version?.id).filter((x): x is string => !!x),
    })
  }, [result])

  const plainText = useMemo(() => {
    if (!result) return ''
    const L = answerLang
    const lines: string[] = []
    lines.push(`NiyamSathi — ${t('tagline', L)}`)
    lines.push(`${t('asOf', L)}: ${formatDate(result.query.asOf, L)}`)
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

  return (
    <div className={slipOpen ? 'min-h-screen slip-open' : 'min-h-screen'} lang={lang}>
      <div className="app-root">
      <header className="no-print bg-gradient-to-br from-ink-950 via-ink-900 to-ink-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <ScrollText className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {t('appName', lang)}
                  <span className="ml-2 text-sm font-normal text-white/60">{t('tagline', lang)}</span>
                </h1>
                <p className="mt-0.5 max-w-xl text-sm text-white/70">{t('subtitle', lang)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white/10 p-1 ring-1 ring-white/20">
              <Languages className="ml-2 h-4 w-4 text-white/60" />
              {(['en', 'hi'] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={
                    lang === l
                      ? 'focus-ring rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink-900'
                      : 'focus-ring rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 transition hover:text-white'
                  }
                >
                  {l === 'en' ? 'English' : 'हिन्दी'}
                </button>
              ))}
            </div>
          </div>

          <nav className="mt-6 flex gap-1">
            {([
              { id: 'assistant', label: t('askTab', lang), icon: Sparkles },
              { id: 'explorer', label: t('explorerTab', lang), icon: Database },
            ] as const).map((item) => {
              const Icon = item.icon
              const active = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={
                    active
                      ? 'focus-ring flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/20'
                      : 'focus-ring flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white'
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <span><strong className="font-semibold">Demo dataset. </strong>{t('demoBanner', lang)}</span>
        </p>

        {tab === 'explorer' ? (
          <RuleExplorer lang={lang} />
        ) : (
          <div className="space-y-6">
            <DemoScenarioSelector lang={lang} onLoad={handleLoadScenario} />

            <QueryPanel
              lang={lang}
              mode={mode}
              onModeChange={setMode}
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
            />

            {result && geometry && complianceResult && (
              <>
                <section className="card rise p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                      <BookOpenCheck className="h-4 w-4 text-ink-400" />
                      {result.extracted ? t('understood', lang) : t('topicsAsked', lang)}
                    </p>
                    <p className="numeric text-xs text-ink-400">
                      {t('asOf', lang)} {formatDate(result.query.asOf, lang)}
                    </p>
                  </div>
                  <dl className="mt-3 flex flex-wrap gap-2 text-sm">
                    {([
                      ['plotArea', result.query.plotArea === null ? null : `${result.query.plotArea} ${t('unitSqm', lang)}`],
                      ['roadWidth', result.query.roadWidth === null ? null : `${result.query.roadWidth} ${t('unitM', lang)}`],
                      ['use', result.query.use === null ? null : USE_LABEL[result.query.use][lang]],
                      ['zone', result.query.zone],
                      ['proposedFloors', result.query.proposedFloors === null ? null : String(result.query.proposedFloors)],
                    ] as [string, string | null][]).map(([field, value]) => (
                      <div
                        key={field}
                        className={
                          value
                            ? 'chip border border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'chip border border-ink-200 bg-ink-50 text-ink-400'
                        }
                      >
                        <dt className="font-normal opacity-70">{bi(FIELD_LABEL[field], lang)}:</dt>
                        <dd className="numeric font-semibold">{value ?? t('notFound', lang)}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-xs text-ink-400">
                    {result.extracted ? t('editFields', lang) : t('answeredIn', lang)}
                  </p>
                </section>

                <div className="grid gap-4 lg:grid-cols-5">
                  <div className="lg:col-span-3">
                    <PlotComplianceMap
                      lang={answerLang}
                      geometry={geometry}
                      roadWidth={result.query.roadWidth}
                      plotDetails={result.plotDetails}
                      coreAnswers={result.coreAnswers}
                      onFocusTopic={setFocusedTopic}
                    />
                  </div>
                  <div className="space-y-4 lg:col-span-2">
                    <ComplianceStatusCard lang={answerLang} result={complianceResult} />
                    <RuleVersionTimeline
                      lang={answerLang}
                      asOf={asOf}
                      onAsOfChange={setAsOf}
                      focusedAnswer={focusedAnswer}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-ink-900">{t('results', lang)}</h2>
                  <div className="no-print flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <ClipboardCopy className="h-4 w-4" />}
                      {copied ? t('copied', lang) : t('copy', lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
                    >
                      <Printer className="h-4 w-4" /> {t('print', lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlipOpen(true)}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-ink-800"
                    >
                      <FileDown className="h-4 w-4" /> {t('downloadSlip', lang)}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {result.answers.map((a, i) => (
                    <AnswerCard key={a.topic} answer={a} lang={answerLang} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <footer className="mt-10 border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-ink-400 sm:px-6">
          <p>{t('footer', lang)}</p>
          <p className="mt-1">MP Bhumi Vikas Rules, 2012 · Bhopal Municipal Corporation · {t('appName', lang)}</p>
        </div>
      </footer>
      </div>

      {result && complianceResult && (
        <div className="slip-root">
          <div className="mx-auto max-w-2xl">
            <div className="no-print mb-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink-900 shadow-sm transition hover:bg-ink-50"
              >
                <Printer className="h-4 w-4" /> {t('printSlip', lang)}
              </button>
              <button
                type="button"
                onClick={() => setSlipOpen(false)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-ink-600 shadow-sm transition hover:bg-ink-50"
              >
                <X className="h-4 w-4" /> {t('closeSlip', lang)}
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
