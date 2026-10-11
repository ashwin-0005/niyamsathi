/**
 * One topic's answer: the number, then the proof behind it.
 *
 * Replaces the earlier AnswerCard. Reads an `Answer` exactly as the engine
 * produced it and renders every branch of `AnswerStatus` — a matched value, a
 * needs-input prompt naming the missing fields, an ambiguous referral, or an
 * explicit "no rule found". It never falls back to a nearby value, because the
 * engine never does either.
 */
import {
  AlertTriangle, Ban, BadgeCheck, CalendarClock, Calculator, HelpCircle, History, Info, ShieldAlert,
} from 'lucide-react'
import CitationDrawer from './CitationDrawer'
import { formatValue, pageLabel } from '../lib/engine'
import { FIELD_LABEL, TOPIC_LABEL, bi, formatDate, t } from '../lib/i18n'
import type { Answer, Lang } from '../lib/types'

interface Props {
  answer: Answer
  lang: Lang
  index?: number
}

function StatusBadge({ answer, lang }: { answer: Answer; lang: Lang }) {
  if (answer.status === 'matched') {
    const verified = answer.source?.excerptStatus === 'verified'
    return verified ? (
      <span className="chip tint-ok border">
        <BadgeCheck className="h-3.5 w-3.5" /> {t('verifiedMatch', lang)}
      </span>
    ) : (
      <span className="chip tint-warn border">
        <ShieldAlert className="h-3.5 w-3.5" /> {t('demoDataBadge', lang)}
      </span>
    )
  }
  if (answer.status === 'needs_input') {
    return (
      <span className="chip tint-warn border">
        <HelpCircle className="h-3.5 w-3.5" /> {t('needsInput', lang)}
      </span>
    )
  }
  if (answer.status === 'ambiguous') {
    return (
      <span className="chip tint-review border">
        <AlertTriangle className="h-3.5 w-3.5" /> {t('ambiguous', lang)}
      </span>
    )
  }
  return (
    <span className="chip tint-bad border">
      <Ban className="h-3.5 w-3.5" /> {t('noRule', lang)}
    </span>
  )
}

export default function RuleResultCard({ answer, lang, index = 0 }: Props) {
  const { rule, source, version } = answer
  const topicName = TOPIC_LABEL[answer.topic][lang]

  return (
    <article
      className="panel rise overflow-hidden"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
      lang={lang}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{topicName}</p>
          {rule && source ? (
            <p className="numeric display metal mt-1 text-4xl font-bold leading-none">
              {formatValue(rule.value, lang)}
            </p>
          ) : (
            <p className="mt-1 text-base font-semibold text-muted">
              {answer.status === 'needs_input' ? t('needsInput', lang) : t('noRule', lang)}
            </p>
          )}
        </div>
        <StatusBadge answer={answer} lang={lang} />
      </div>

      {answer.status === 'needs_input' && (
        <div className="px-5 pb-5 pt-3 text-sm">
          <p className="text-muted">{t('needsInputHelp', lang)}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {answer.missing.map((f) => (
              <li key={f} className="chip tint-warn border">
                {bi(FIELD_LABEL[f], lang)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer.status === 'no_rule' && (
        <p className="px-5 pb-5 pt-3 text-sm text-muted">{t('noRuleHelp', lang)}</p>
      )}

      {rule && source && version && (
        <div className="space-y-3 px-5 pb-5 pt-4">
          <div className="hairline" />

          <p className="text-sm text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
              {t('appliesWhen', lang)}:{' '}
            </span>
            {bi(rule.conditionText, lang)}
          </p>

          <div className="panel-inset numeric flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 text-xs">
            <span className="font-semibold text-teal">{source.ruleNumber}</span>
            <span className="text-ghost">·</span>
            <span className="font-semibold text-teal">{source.tableNumber}</span>
            <span className="text-ghost">·</span>
            <span className="text-muted">{t('page', lang)} {pageLabel(source)}</span>
            <span className="text-ghost">·</span>
            <span className="inline-flex items-center gap-1 text-faint">
              <CalendarClock className="h-3 w-3" />
              {bi(version.shortLabel, lang)}, {formatDate(version.effectiveDate, lang)}
            </span>
          </div>

          {rule.note && (
            <p className="flex gap-2 text-xs text-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
              <span>{bi(rule.note, lang)}</span>
            </p>
          )}

          {answer.derived.map((d) => (
            <div key={d.label.en} className="rounded-xl border border-teal/25 bg-teal/5 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-teal/80">
                <Calculator className="h-3.5 w-3.5" /> {t('calculated', lang)}
              </p>
              <p className="numeric mt-1 text-base font-bold text-paper">
                {bi(d.label, lang)}: {d.value}
              </p>
              <p className="numeric mt-0.5 text-xs text-muted">{bi(d.formula, lang)}</p>
            </div>
          ))}

          {answer.cautions.map((c, i) => (
            <p key={i} className="tint-warn flex gap-2 rounded-xl border px-3 py-2.5 text-xs">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong className="font-semibold">{t('caution', lang)}: </strong>{bi(c, lang)}</span>
            </p>
          ))}

          {answer.superseded.length > 0 && (
            <div className="panel-inset px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
                <History className="h-3.5 w-3.5" />
                {answer.changedByAmendment ? t('changed', lang) : t('unchanged', lang)}
              </p>
              {answer.superseded.map((s) => (
                <p key={s.rule.id} className="numeric mt-1 text-xs text-muted">
                  <span className="font-medium">{t('previously', lang)}:</span>{' '}
                  <s className="decoration-faint">{formatValue(s.rule.value, lang)}</s>{' '}
                  — {s.source.ruleNumber}, {s.source.tableNumber}, {t('page', lang)} {pageLabel(s.source)}{' '}
                  ({bi(s.version.shortLabel, lang)})
                </p>
              ))}
            </div>
          )}

          <CitationDrawer source={source} version={version} lang={lang} />
        </div>
      )}
    </article>
  )
}
