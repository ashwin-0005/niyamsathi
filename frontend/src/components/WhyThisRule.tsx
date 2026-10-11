/**
 * Shows the reasoning chain that produced one answer: what was read from the
 * query, which row's conditions that satisfied, which version was in force,
 * and — when two versions both matched — why the newer one governs.
 *
 * Everything here is read back off the `Answer` the engine already returned.
 * No matching is re-run, so this panel cannot narrate a path the engine did
 * not actually take.
 */
import { ArrowRight, GitBranch, ScanSearch } from 'lucide-react'
import { formatValue, pageLabel } from '../lib/engine'
import { TOPIC_LABEL, USE_LABEL, bi, formatDate, t } from '../lib/i18n'
import type { Answer, Lang, Query } from '../lib/types'

interface Props {
  lang: Lang
  query: Query
  answer: Answer | null
}

export default function WhyThisRule({ lang, query, answer }: Props) {
  if (!answer) return null

  const detected: string[] = []
  if (query.plotArea !== null) detected.push(`${query.plotArea} ${t('unitSqm', lang)}`)
  if (query.roadWidth !== null) detected.push(`${query.roadWidth} ${t('unitM', lang)} ${t('roadLabel', lang).toLowerCase()}`)
  if (query.use !== null) detected.push(USE_LABEL[query.use][lang])

  const { rule, source, version } = answer
  const hasSuperseded = answer.superseded.length > 0

  return (
    <section className="panel p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-paper">
        <ScanSearch className="h-4 w-4 text-teal" aria-hidden="true" />
        {t('whyThisRule', lang)}
        <span className="text-faint">· {TOPIC_LABEL[answer.topic][lang]}</span>
      </p>

      <ol className="mt-4 space-y-3">
        <li>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">{t('whyDetected', lang)}</p>
          <p className="numeric mt-1 flex flex-wrap gap-1.5">
            {detected.length > 0 ? (
              detected.map((d) => (
                <span key={d} className="chip tint-saffron border text-xs">{d}</span>
              ))
            ) : (
              <span className="text-sm text-faint">{t('notFound', lang)}</span>
            )}
          </p>
        </li>

        {rule && (
          <li>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">{t('whyMatched', lang)}</p>
            <p className="mt-1 flex items-start gap-2 text-sm text-muted">
              <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
              <span>
                {bi(rule.conditionText, lang)}
                {source && (
                  <span className="numeric text-faint">
                    {' '}— {source.ruleNumber}, {source.tableNumber}, {t('page', lang)} {pageLabel(source)}
                  </span>
                )}
              </span>
            </p>
          </li>
        )}

        {version && (
          <li>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">{t('whyVersion', lang)}</p>
            <p className="numeric mt-1 text-sm text-muted">
              {bi(version.label, lang)} · {t('effective', lang)} {formatDate(version.effectiveDate, lang)}
            </p>
          </li>
        )}

        <li>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
            <GitBranch className="h-3 w-3" aria-hidden="true" />
            {hasSuperseded ? t('whySupersede', lang) : t('whyVersion', lang)}
          </p>
          <p className="mt-1 text-sm text-muted">
            {hasSuperseded ? t('whySupersedeText', lang) : t('whyOnlyRecord', lang)}
          </p>
          {hasSuperseded && (
            <ul className="numeric mt-2 space-y-1">
              {answer.superseded.map((s) => (
                <li key={s.rule.id} className="text-xs text-faint">
                  <s className="decoration-faint">{formatValue(s.rule.value, lang)}</s> — {bi(s.version.shortLabel, lang)},{' '}
                  {formatDate(s.version.effectiveDate, lang)}
                </li>
              ))}
            </ul>
          )}
        </li>
      </ol>
    </section>
  )
}
