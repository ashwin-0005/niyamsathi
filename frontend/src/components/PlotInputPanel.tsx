/**
 * The clerk's control surface: a free-text question, voice input, and the
 * structured fields the engine actually discriminates on.
 *
 * The two input routes are not alternatives — whatever is typed, spoken, or
 * filled in here converges on the same `Query` + `PlotDetails` pair. Fields
 * the rule tables genuinely need (area, road width, use) are grouped and
 * labelled "required"; the geometry fields that only sharpen the drawing are
 * grouped separately and marked optional, so a clerk can tell at a glance
 * which blanks will actually block an answer.
 */
import { CalendarClock, Compass, Eraser, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import VoiceAssistantControl from './VoiceAssistantControl'
import { ALL_TOPICS } from '../lib/engine'
import { FIELD_LABEL, ROAD_FACING_LABEL, TOPIC_LABEL, USE_LABEL, bi, t } from '../lib/i18n'
import type { FormState, PlotDetailsFormState } from '../lib/formState'
import type { VoiceInput, VoiceOutput } from '../lib/hooks'
import type { Lang, RoadFacing, Topic, Use } from '../lib/types'

const EXAMPLES: { en: string; hi: string }[] = [
  {
    en: '200 sq m residential plot on a 9 m road. What front setback is required?',
    hi: '200 वर्ग मीटर के प्लॉट और 9 मीटर सड़क के लिए फ्रंट सेटबैक कितना है?',
  },
  {
    en: '450 sq m plot, 9 m road, residential — FAR and max floors?',
    hi: '450 वर्ग मीटर भूखंड, 9 मीटर सड़क, आवासीय — एफ.ए.आर. और अधिकतम तल?',
  },
  {
    en: 'Commercial plot 800 sq m on an 18 m road, permission fee?',
    hi: '18 मीटर सड़क पर 800 वर्ग मीटर वाणिज्यिक भूखंड, अनुज्ञा शुल्क?',
  },
]

const PROPOSED_FIELDS = [
  'proposedFrontSetback', 'proposedRearSetback', 'proposedLeftSetback', 'proposedRightSetback',
] as const

interface Props {
  lang: Lang
  question: string
  onQuestionChange: (v: string) => void
  form: FormState
  onFormChange: (f: FormState) => void
  plotDetailsForm: PlotDetailsFormState
  onPlotDetailsFormChange: (f: PlotDetailsFormState) => void
  asOf: string
  onAsOfChange: (v: string) => void
  onSubmit: () => void
  onClear: () => void
  voiceInput: VoiceInput
  voiceOutput: VoiceOutput
  spokenSummary: string | null
}

export default function PlotInputPanel(p: Props) {
  const { lang, form, plotDetailsForm } = p

  const setForm = (patch: Partial<FormState>) => p.onFormChange({ ...form, ...patch })
  const setPlot = (patch: Partial<PlotDetailsFormState>) =>
    p.onPlotDetailsFormChange({ ...plotDetailsForm, ...patch })

  const toggleTopic = (topic: Topic) =>
    setForm({
      topics: form.topics.includes(topic)
        ? form.topics.filter((x) => x !== topic)
        : [...form.topics, topic],
    })

  return (
    <section className="panel flex flex-col gap-5 p-5">
      {/* ---- Natural language ------------------------------------------- */}
      <div>
        <label htmlFor="question" className="label">
          <Sparkles className="mr-1 inline h-3 w-3" aria-hidden="true" />
          {t('askTab', lang)}
        </label>
        <textarea
          id="question"
          rows={3}
          value={p.question}
          onChange={(e) => p.onQuestionChange(e.target.value)}
          onKeyDown={(e) => {
            // Ctrl/Cmd+Enter submits; plain Enter keeps making new lines.
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') p.onSubmit()
          }}
          placeholder={t('placeholder', lang)}
          className="field resize-y leading-relaxed"
          lang={lang}
        />
      </div>

      <VoiceAssistantControl
        lang={lang}
        input={p.voiceInput}
        output={p.voiceOutput}
        spokenSummary={p.spokenSummary}
      />

      <div>
        <p className="label">{t('examples', lang)}</p>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => p.onQuestionChange(ex[lang])}
              className="chip chip-button focus-ring max-w-full truncate text-left"
              title={ex[lang]}
            >
              {ex[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="hairline" />

      {/* ---- Step 1: essential structured inputs ------------------------- */}
      <div>
        <p className="label">
          <SlidersHorizontal className="mr-1 inline h-3 w-3" aria-hidden="true" />
          {t('step1Title', lang)}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="plotArea" className="label">{bi(FIELD_LABEL.plotArea, lang)}</label>
            <input
              id="plotArea" type="number" min="1" step="any" inputMode="decimal" placeholder="200"
              value={form.plotArea} onChange={(e) => setForm({ plotArea: e.target.value })}
              className="field numeric"
              aria-describedby="plotAreaHelp"
            />
            <p id="plotAreaHelp" className="mt-1 text-xs leading-relaxed text-faint">{t('plotAreaHelp', lang)}</p>
          </div>
          <div>
            <label htmlFor="roadWidth" className="label">{bi(FIELD_LABEL.roadWidth, lang)}</label>
            <input
              id="roadWidth" type="number" min="0.1" step="any" inputMode="decimal" placeholder="9"
              value={form.roadWidth} onChange={(e) => setForm({ roadWidth: e.target.value })}
              className="field numeric"
              aria-describedby="roadWidthHelp"
            />
            <p id="roadWidthHelp" className="mt-1 text-xs leading-relaxed text-faint">{t('roadWidthHelp', lang)}</p>
          </div>
          <div className="col-span-2">
            <label htmlFor="use" className="label">{bi(FIELD_LABEL.use, lang)}</label>
            <select
              id="use" value={form.use}
              onChange={(e) => setForm({ use: e.target.value as Use | '' })}
              className="field"
              aria-describedby="useHelp"
            >
              <option value="">— {t('select', lang)} —</option>
              {(Object.keys(USE_LABEL) as Use[]).map((u) => (
                <option key={u} value={u}>{USE_LABEL[u][lang]}</option>
              ))}
            </select>
            <p id="useHelp" className="mt-1 text-xs leading-relaxed text-faint">{t('useHelp', lang)}</p>
          </div>
        </div>
      </div>

      {/* ---- Step 2 (optional): geometry + proposed plan ----------------- */}
      <div>
        <p className="label">
          <Compass className="mr-1 inline h-3 w-3" aria-hidden="true" />
          {t('step2Title', lang)}
        </p>
        <p className="mb-2 text-xs leading-relaxed text-faint">{t('step2Help', lang)}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="plotWidth" className="label">{bi(FIELD_LABEL.plotWidth, lang)}</label>
            <input
              id="plotWidth" type="number" min="1" step="any" inputMode="decimal" placeholder="10"
              value={plotDetailsForm.plotWidth} onChange={(e) => setPlot({ plotWidth: e.target.value })}
              className="field numeric"
            />
          </div>
          <div>
            <label htmlFor="plotDepth" className="label">{bi(FIELD_LABEL.plotDepth, lang)}</label>
            <input
              id="plotDepth" type="number" min="1" step="any" inputMode="decimal" placeholder="20"
              value={plotDetailsForm.plotDepth} onChange={(e) => setPlot({ plotDepth: e.target.value })}
              className="field numeric"
            />
          </div>
          <div>
            <label htmlFor="proposedFloors" className="label">{bi(FIELD_LABEL.proposedFloors, lang)}</label>
            <input
              id="proposedFloors" type="number" min="1" step="1" inputMode="numeric" placeholder="2"
              value={form.proposedFloors} onChange={(e) => setForm({ proposedFloors: e.target.value })}
              className="field numeric"
              aria-describedby="proposedFloorsHelp"
            />
          </div>
          <div>
            <label htmlFor="roadFacing" className="label">{bi(FIELD_LABEL.roadFacing, lang)}</label>
            <select
              id="roadFacing" value={plotDetailsForm.roadFacing}
              onChange={(e) => setPlot({ roadFacing: e.target.value as RoadFacing | '' })}
              className="field"
            >
              <option value="">— {t('select', lang)} —</option>
              {(Object.keys(ROAD_FACING_LABEL) as RoadFacing[]).map((f) => (
                <option key={f} value={f}>{ROAD_FACING_LABEL[f][lang]}</option>
              ))}
            </select>
          </div>
          <p id="proposedFloorsHelp" className="col-span-2 -mt-1.5 text-xs leading-relaxed text-faint">
            {t('proposedFloorsHelp', lang)}
          </p>
          {PROPOSED_FIELDS.map((field) => (
            <div key={field}>
              <label htmlFor={field} className="label">{bi(FIELD_LABEL[field], lang)}</label>
              <input
                id={field} type="number" min="0" step="any" inputMode="decimal" placeholder="1.5"
                value={plotDetailsForm[field]} onChange={(e) => setPlot({ [field]: e.target.value })}
                className="field numeric"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ---- Topics ------------------------------------------------------ */}
      <div>
        <p className="label">{t('anyTopic', lang)} <span className="normal-case tracking-normal">({t('allTopics', lang)})</span></p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              aria-pressed={form.topics.includes(topic)}
              className={form.topics.includes(topic) ? 'chip chip-on focus-ring' : 'chip chip-button focus-ring'}
            >
              {TOPIC_LABEL[topic][lang]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="asOf" className="label">
          <CalendarClock className="mr-1 inline h-3 w-3" aria-hidden="true" />
          {t('asOf', lang)}
        </label>
        <input
          id="asOf" type="date" min="2025-03-31" value={p.asOf}
          onChange={(e) => p.onAsOfChange(e.target.value)}
          className="field numeric"
        />
        <p className="mt-1.5 text-xs text-faint">{t('asOfHelp', lang)}</p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={p.onSubmit} className="btn btn-primary focus-ring flex-1">
          <Search className="h-4 w-4" aria-hidden="true" />
          {t('checkCompliance', lang)}
        </button>
        <button
          type="button" onClick={p.onClear}
          className="btn btn-ghost focus-ring" aria-label={t('clear', lang)}
        >
          <Eraser className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
