import { CalendarClock, Compass, Eraser, ListFilter, Search, Sparkles, SquarePen } from 'lucide-react'
import { ALL_TOPICS } from '../lib/engine'
import { BHOPAL_LOCALITIES } from '../lib/parse'
import { FIELD_LABEL, ROAD_FACING_LABEL, TOPIC_LABEL, USE_LABEL, bi, t } from '../lib/i18n'
import type { Lang, RoadFacing, Topic, Use } from '../lib/types'

export interface FormState {
  plotArea: string
  roadWidth: string
  use: Use | ''
  zone: string
  proposedFloors: string
  topics: Topic[]
}

/** String-valued mirror of `PlotDetails`, for controlled form inputs. */
export interface PlotDetailsFormState {
  plotWidth: string
  plotDepth: string
  roadFacing: RoadFacing | ''
  proposedFrontSetback: string
  proposedRearSetback: string
  proposedLeftSetback: string
  proposedRightSetback: string
}

export const EMPTY_PLOT_DETAILS_FORM: PlotDetailsFormState = {
  plotWidth: '', plotDepth: '', roadFacing: '',
  proposedFrontSetback: '', proposedRearSetback: '', proposedLeftSetback: '', proposedRightSetback: '',
}

interface Props {
  lang: Lang
  mode: 'ask' | 'form'
  onModeChange: (m: 'ask' | 'form') => void
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
}

const EXAMPLES: { lang: Lang; text: string }[] = [
  { lang: 'en', text: '200 sq m residential plot on a 9 m road. What front setback is required?' },
  { lang: 'hi', text: '200 वर्ग मीटर के प्लॉट और 9 मीटर सड़क के लिए फ्रंट सेटबैक कितना है?' },
  { lang: 'en', text: 'My plot is 200 sq m on a 9 m road. How much front setback do I leave, how many floors can I build, and what fee do I pay?' },
  { lang: 'hi', text: '300 वर्ग मीटर का वाणिज्यिक भूखंड, 12 मीटर सड़क — एफ.ए.आर. और शुल्क कितना होगा?' },
  { lang: 'en', text: 'Residential plot of 800 sq m in Arera Colony on an 18 m road — all topics' },
]

const inputClass =
  'focus-ring w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition hover:border-ink-400'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-400'
const pillOn = 'focus-ring rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white'
const pillOff = 'focus-ring rounded-full border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-ink-400'

export default function QueryPanel(p: Props) {
  const { lang, mode, form, plotDetailsForm } = p
  const setPlotDetails = (patch: Partial<PlotDetailsFormState>) =>
    p.onPlotDetailsFormChange({ ...plotDetailsForm, ...patch })
  const tabs: { id: 'ask' | 'form'; label: string; icon: typeof Search }[] = [
    { id: 'ask', label: t('askTab', lang), icon: Search },
    { id: 'form', label: t('formTab', lang), icon: SquarePen },
  ]

  const toggleTopic = (topic: Topic) => {
    const has = form.topics.includes(topic)
    p.onFormChange({
      ...form,
      topics: has ? form.topics.filter((x) => x !== topic) : [...form.topics, topic],
    })
  }

  return (
    <section className="card no-print overflow-hidden">
      <div role="tablist" className="flex items-center gap-1 border-b border-ink-100 bg-ink-50/50 px-3 pt-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = mode === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => p.onModeChange(tab.id)}
              className={
                active
                  ? 'focus-ring -mb-px flex items-center gap-2 rounded-t-xl border border-ink-100 border-b-white bg-white px-4 py-2.5 text-sm font-semibold text-ink-900'
                  : 'focus-ring -mb-px flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:text-ink-900'
              }
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="p-5">
        {mode === 'ask' ? (
          <div>
            <label htmlFor="question" className={labelClass}>
              {t('askTab', lang)} — हिन्दी / English
            </label>
            <textarea
              id="question"
              rows={3}
              value={p.question}
              onChange={(e) => p.onQuestionChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) p.onSubmit() }}
              placeholder={t('placeholder', lang)}
              className={inputClass + ' resize-y leading-relaxed'}
            />
            <div className="mt-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-ink-400">
                <Sparkles className="h-3.5 w-3.5" /> {t('examples', lang)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.text}
                    type="button"
                    lang={ex.lang}
                    onClick={() => p.onQuestionChange(ex.text)}
                    title={ex.text}
                    className="focus-ring max-w-xs truncate rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs text-ink-600 transition hover:border-ink-400 hover:text-ink-900"
                  >
                    {ex.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="plotArea" className={labelClass}>
                {bi(FIELD_LABEL.plotArea, lang)} ({t('unitSqm', lang)})
              </label>
              <input
                id="plotArea" type="number" min="1" step="any" inputMode="decimal" placeholder="200"
                value={form.plotArea}
                onChange={(e) => p.onFormChange({ ...form, plotArea: e.target.value })}
                className={inputClass + ' numeric'}
              />
            </div>
            <div>
              <label htmlFor="roadWidth" className={labelClass}>
                {bi(FIELD_LABEL.roadWidth, lang)} ({t('unitM', lang)})
              </label>
              <input
                id="roadWidth" type="number" min="1" step="any" inputMode="decimal" placeholder="9"
                value={form.roadWidth}
                onChange={(e) => p.onFormChange({ ...form, roadWidth: e.target.value })}
                className={inputClass + ' numeric'}
              />
            </div>
            <div>
              <label htmlFor="use" className={labelClass}>{bi(FIELD_LABEL.use, lang)}</label>
              <select
                id="use"
                value={form.use}
                onChange={(e) => p.onFormChange({ ...form, use: e.target.value as Use | '' })}
                className={inputClass}
              >
                <option value="">— {t('select', lang)} —</option>
                {(Object.keys(USE_LABEL) as Use[]).map((u) => (
                  <option key={u} value={u}>{USE_LABEL[u][lang]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="zone" className={labelClass}>
                {bi(FIELD_LABEL.zone, lang)} <span className="normal-case text-ink-400">({t('optional', lang)})</span>
              </label>
              <input
                id="zone" list="localities"
                value={form.zone}
                onChange={(e) => p.onFormChange({ ...form, zone: e.target.value })}
                placeholder={lang === 'hi' ? 'अरेरा कॉलोनी' : 'Arera Colony'}
                className={inputClass}
              />
              <datalist id="localities">
                {BHOPAL_LOCALITIES.map((l) => <option key={l.en} value={l.en} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="floors" className={labelClass}>
                {bi(FIELD_LABEL.proposedFloors, lang)} <span className="normal-case text-ink-400">({t('optional', lang)})</span>
              </label>
              <input
                id="floors" type="number" min="1" step="1" inputMode="numeric" placeholder="4"
                value={form.proposedFloors}
                onChange={(e) => p.onFormChange({ ...form, proposedFloors: e.target.value })}
                className={inputClass + ' numeric'}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <p className={labelClass}>
                <ListFilter className="mr-1 inline h-3.5 w-3.5" />
                {t('anyTopic', lang)}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => p.onFormChange({ ...form, topics: [] })}
                  className={form.topics.length === 0 ? pillOn : pillOff}>
                  {t('allTopics', lang)}
                </button>
                {ALL_TOPICS.map((topic) => (
                  <button key={topic} type="button" onClick={() => toggleTopic(topic)}
                    className={form.topics.includes(topic) ? pillOn : pillOff}>
                    {TOPIC_LABEL[topic][lang]}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-ink-100 bg-ink-50/40 p-4">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
                <Compass className="h-3.5 w-3.5" />
                {t('mapTitle', lang)} <span className="normal-case text-ink-400">({t('optional', lang)})</span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="plotWidth" className={labelClass}>{bi(FIELD_LABEL.plotWidth, lang)}</label>
                  <input
                    id="plotWidth" type="number" min="1" step="any" inputMode="decimal" placeholder="10"
                    value={plotDetailsForm.plotWidth}
                    onChange={(e) => setPlotDetails({ plotWidth: e.target.value })}
                    className={inputClass + ' numeric'}
                  />
                </div>
                <div>
                  <label htmlFor="plotDepth" className={labelClass}>{bi(FIELD_LABEL.plotDepth, lang)}</label>
                  <input
                    id="plotDepth" type="number" min="1" step="any" inputMode="decimal" placeholder="20"
                    value={plotDetailsForm.plotDepth}
                    onChange={(e) => setPlotDetails({ plotDepth: e.target.value })}
                    className={inputClass + ' numeric'}
                  />
                </div>
                <div>
                  <label htmlFor="roadFacing" className={labelClass}>{bi(FIELD_LABEL.roadFacing, lang)}</label>
                  <select
                    id="roadFacing"
                    value={plotDetailsForm.roadFacing}
                    onChange={(e) => setPlotDetails({ roadFacing: e.target.value as RoadFacing | '' })}
                    className={inputClass}
                  >
                    <option value="">— {t('select', lang)} —</option>
                    {(Object.keys(ROAD_FACING_LABEL) as RoadFacing[]).map((f) => (
                      <option key={f} value={f}>{ROAD_FACING_LABEL[f][lang]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-ink-400">
                {FIELD_LABEL.proposedFrontSetback[lang].split(' ')[0]} {lang === 'hi' ? 'प्रस्तावित निर्माण योजना' : 'proposed construction plan'}{' '}
                <span className="normal-case text-ink-400">({t('optional', lang)})</span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {([
                  ['proposedFrontSetback', 'front'],
                  ['proposedRearSetback', 'rear'],
                  ['proposedLeftSetback', 'left'],
                  ['proposedRightSetback', 'right'],
                ] as const).map(([field]) => (
                  <div key={field}>
                    <label htmlFor={field} className={labelClass}>{bi(FIELD_LABEL[field], lang)}</label>
                    <input
                      id={field} type="number" min="0" step="any" inputMode="decimal" placeholder="e.g. 1.5"
                      value={plotDetailsForm[field]}
                      onChange={(e) => setPlotDetails({ [field]: e.target.value })}
                      className={inputClass + ' numeric'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink-100 bg-ink-50/50 px-5 py-4">
        <div>
          <label htmlFor="asOf" className={labelClass}>
            <CalendarClock className="mr-1 inline h-3.5 w-3.5" />
            {t('asOf', lang)}
          </label>
          <input
            id="asOf" type="date" min="2025-03-31"
            value={p.asOf}
            onChange={(e) => p.onAsOfChange(e.target.value)}
            className={inputClass + ' numeric w-auto'}
          />
          <p className="mt-1.5 max-w-xs text-xs text-ink-400">{t('asOfHelp', lang)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={p.onClear}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
          >
            <Eraser className="h-4 w-4" /> {t('clear', lang)}
          </button>
          <button
            type="button"
            onClick={p.onSubmit}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ink-800 active:scale-[0.99]"
          >
            <Search className="h-4 w-4" />
            {mode === 'ask' ? t('getAnswer', lang) : t('submitForm', lang)}
          </button>
        </div>
      </div>
    </section>
  )
}
