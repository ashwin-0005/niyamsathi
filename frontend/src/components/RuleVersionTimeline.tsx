/**
 * Amendment Time Machine — a horizontal track of every rulebook version, with
 * the one governing the focused answer lit up.
 *
 * The date control here writes to the *same* `asOf` state the input panel
 * uses. That is deliberate: a second, independent date would let the timeline
 * and the result cards disagree about which rules are in force, which is
 * exactly the confusion this panel exists to remove.
 */
import { BadgeCheck, CalendarClock, History, Milestone, ShieldAlert } from 'lucide-react'
import { pageLabel, VERSIONS } from '../lib/engine'
import { bi, formatDate, t } from '../lib/i18n'
import type { Answer, Lang } from '../lib/types'

const AMENDMENT_ID = 'v-2026-08'

interface Props {
  lang: Lang
  asOf: string
  onAsOfChange: (v: string) => void
  /** The core-topic answer currently in focus on the map. */
  focusedAnswer: Answer | null
}

export default function RuleVersionTimeline({ lang, asOf, onAsOfChange, focusedAnswer }: Props) {
  const activeVersionId = focusedAnswer?.version?.id ?? null
  const amendmentIsActive = activeVersionId === AMENDMENT_ID
  const superseded = focusedAnswer?.superseded ?? []
  const ordered = [...VERSIONS].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="display flex items-center gap-2 text-sm font-bold text-paper">
          <History className="h-4 w-4 text-teal" aria-hidden="true" />
          {t('timelineTitle', lang)}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="timelineAsOf" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
            <CalendarClock className="mr-1 inline h-3 w-3" aria-hidden="true" />
            {t('checkRulesOn', lang)}
          </label>
          <input
            id="timelineAsOf" type="date" min="2025-03-31" value={asOf}
            onChange={(e) => onAsOfChange(e.target.value)}
            className="field numeric w-auto py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Horizontal track */}
      <ol className="mt-5 grid gap-4 sm:grid-cols-2">
        {ordered.map((v, i) => {
          const active = v.id === activeVersionId
          const inForce = v.effectiveDate <= asOf
          return (
            <li key={v.id} className="relative">
              {/* Connector into the next node */}
              {i < ordered.length - 1 && (
                <span
                  className="absolute left-[calc(100%+0.25rem)] top-4 hidden h-px w-4 bg-line sm:block"
                  aria-hidden="true"
                />
              )}
              <div
                className={
                  active
                    ? 'panel-flat border-teal/45 bg-teal/5 p-3.5'
                    : inForce
                      ? 'panel-flat p-3.5'
                      : 'panel-flat border-dashed p-3.5 opacity-55'
                }
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={
                      active
                        ? 'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal text-teal-ink'
                        : 'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line bg-carbon text-faint'
                    }
                  >
                    <Milestone className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className={active ? 'text-sm font-semibold text-paper' : 'text-sm font-medium text-muted'}>
                      {v.id === AMENDMENT_ID ? t('timelineAmendment', lang) : t('timelineConsolidated', lang)}
                    </p>
                    <p className="numeric mt-0.5 text-xs text-faint">
                      {t('effective', lang)} {formatDate(v.effectiveDate, lang)}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-faint">{bi(v.scope, lang)}</p>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-faint">
                      {v.verified
                        ? <BadgeCheck className="h-3 w-3 shrink-0 text-ok" aria-hidden="true" />
                        : <ShieldAlert className="h-3 w-3 shrink-0 text-warn" aria-hidden="true" />}
                      {v.verified ? t('versionVerified', lang) : t('versionUnverified', lang)}
                    </p>
                    {active && (
                      <span className="chip tint-ok mt-2 border text-[11px]">{t('ruleVersionInForce', lang)}</span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {amendmentIsActive && (
        <p className="tint-saffron mt-4 rounded-xl border px-3.5 py-2.5 text-sm">
          {t('timelineApplies', lang)}
        </p>
      )}

      {focusedAnswer?.source && focusedAnswer.version && (
        <div className="panel-inset mt-3 px-3.5 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">{t('selectedRule', lang)}</p>
          <p className="numeric mt-1 text-sm">
            <span className="font-semibold text-teal">{focusedAnswer.source.ruleNumber}</span>
            <span className="text-ghost"> · </span>
            <span className="font-semibold text-teal">{focusedAnswer.source.tableNumber}</span>
            <span className="text-ghost"> · </span>
            <span className="text-muted">{t('page', lang)} {pageLabel(focusedAnswer.source)}</span>
          </p>
        </div>
      )}

      {superseded.length > 0 && (
        <div className="mt-3 rounded-xl border border-dashed border-line px-3.5 py-2.5">
          {superseded.map((s) => (
            <p key={s.rule.id} className="numeric text-xs text-faint">
              {t('previously', lang)}: {s.source.ruleNumber}, {s.source.tableNumber}, {t('page', lang)}{' '}
              {pageLabel(s.source)} ({bi(s.version.shortLabel, lang)}, {formatDate(s.version.effectiveDate, lang)})
            </p>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-faint">{t('timelineHistoricalNote', lang)}</p>
    </section>
  )
}
