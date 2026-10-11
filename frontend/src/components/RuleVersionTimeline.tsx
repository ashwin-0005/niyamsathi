import { CalendarClock, History, Milestone } from 'lucide-react'
import { pageLabel, VERSIONS } from '../lib/engine'
import { bi, formatDate, t } from '../lib/i18n'
import type { Answer, Lang } from '../lib/types'

interface Props {
  lang: Lang
  asOf: string
  onAsOfChange: (v: string) => void
  /** The core-topic answer currently in focus (hovered/clicked on the map). */
  focusedAnswer: Answer | null
}

const inputClass =
  'focus-ring w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 transition hover:border-ink-400'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-400'

export default function RuleVersionTimeline({ lang, asOf, onAsOfChange, focusedAnswer }: Props) {
  const activeVersionId = focusedAnswer?.version?.id ?? null
  const amendmentId = 'v-2026-08'
  const amendmentIsActive = activeVersionId === amendmentId
  const superseded = focusedAnswer?.superseded ?? []

  return (
    <section className="card rise p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <History className="h-4 w-4 text-ink-400" />
        {t('timelineTitle', lang)}
      </p>

      <div className="mt-4 space-y-3">
        {VERSIONS.map((v, i) => {
          const active = v.id === activeVersionId
          return (
            <div key={v.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={
                    active
                      ? 'grid h-6 w-6 place-items-center rounded-full bg-ink-900 text-white'
                      : 'grid h-6 w-6 place-items-center rounded-full border-2 border-ink-200 bg-white text-ink-300'
                  }
                >
                  <Milestone className="h-3.5 w-3.5" />
                </span>
                {i < VERSIONS.length - 1 && <span className="mt-1 h-8 w-px bg-ink-200" />}
              </div>
              <div className={active ? 'text-ink-900' : 'text-ink-400'}>
                <p className="text-sm font-semibold">
                  {v.id === amendmentId ? t('timelineAmendment', lang) : t('timelineConsolidated', lang)}
                </p>
                <p className="numeric text-xs">{formatDate(v.effectiveDate, lang)}</p>
                {active && <p className="mt-0.5 text-xs text-ink-500">{bi(v.scope, lang)}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {amendmentIsActive && (
        <p className="mt-4 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm text-indigo-900 ring-1 ring-indigo-100">
          {t('timelineApplies', lang)}
        </p>
      )}

      {focusedAnswer?.source && focusedAnswer.version && (
        <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2.5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{t('selectedRule', lang)}</p>
          <p className="numeric mt-0.5 font-medium text-ink-800">
            {focusedAnswer.source.ruleNumber} · {focusedAnswer.source.tableNumber} · {t('page', lang)} {pageLabel(focusedAnswer.source)}
          </p>
          <p className="mt-0.5 text-xs text-ink-500">
            {bi(focusedAnswer.version.shortLabel, lang)} · {t('effective', lang)} {formatDate(focusedAnswer.version.effectiveDate, lang)}
          </p>
        </div>
      )}

      {superseded.length > 0 && (
        <div className="mt-3 rounded-xl border border-dashed border-ink-200 px-3 py-2.5 text-xs text-ink-500">
          {superseded.map((s) => (
            <p key={s.rule.id} className="numeric">
              {t('previously', lang)}: {s.source.ruleNumber}, {s.source.tableNumber}, {t('page', lang)} {pageLabel(s.source)}{' '}
              ({bi(s.version.shortLabel, lang)}, {formatDate(s.version.effectiveDate, lang)})
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-ink-100 pt-4">
        <label htmlFor="timelineAsOf" className={labelClass}>
          <CalendarClock className="mr-1 inline h-3.5 w-3.5" />
          {t('checkRulesOn', lang)}
        </label>
        <input
          id="timelineAsOf" type="date" min="2025-03-31"
          value={asOf}
          onChange={(e) => onAsOfChange(e.target.value)}
          className={inputClass + ' numeric'}
        />
        <p className="mt-1.5 text-xs text-ink-400">{t('timelineHistoricalNote', lang)}</p>
      </div>
    </section>
  )
}
