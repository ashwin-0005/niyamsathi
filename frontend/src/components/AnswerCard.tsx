import { useState } from 'react'
import {
  AlertTriangle, Ban, BadgeCheck, CalendarClock, ChevronDown, Calculator,
  FileText, HelpCircle, History, Info, ShieldAlert,
} from 'lucide-react'
import { formatValue, pageLabel } from '../lib/engine'
import { FIELD_LABEL, TOPIC_LABEL, bi, formatDate, t } from '../lib/i18n'
import type { Answer, Lang } from '../lib/types'

interface Props {
  answer: Answer
  lang: Lang
  index: number
}

function StatusBadge({ answer, lang }: { answer: Answer; lang: Lang }) {
  if (answer.status === 'matched') {
    const verified = answer.source?.excerptStatus === 'verified'
    return verified ? (
      <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
        <BadgeCheck className="h-3.5 w-3.5" /> {t('verifiedMatch', lang)}
      </span>
    ) : (
      <span className="chip bg-amber-50 text-amber-800 ring-1 ring-amber-200">
        <ShieldAlert className="h-3.5 w-3.5" /> {t('demoMatch', lang)}
      </span>
    )
  }
  if (answer.status === 'needs_input') {
    return (
      <span className="chip bg-sky-50 text-sky-700 ring-1 ring-sky-200">
        <HelpCircle className="h-3.5 w-3.5" /> {t('needsInput', lang)}
      </span>
    )
  }
  if (answer.status === 'ambiguous') {
    return (
      <span className="chip bg-orange-50 text-orange-700 ring-1 ring-orange-200">
        <AlertTriangle className="h-3.5 w-3.5" /> {t('ambiguous', lang)}
      </span>
    )
  }
  return (
    <span className="chip bg-rose-50 text-rose-700 ring-1 ring-rose-200">
      <Ban className="h-3.5 w-3.5" /> {t('noRule', lang)}
    </span>
  )
}

export default function AnswerCard({ answer, lang, index }: Props) {
  const [open, setOpen] = useState(false)
  const { rule, source, version } = answer
  const topicName = TOPIC_LABEL[answer.topic][lang]

  return (
    <article
      className="card rise overflow-hidden"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      lang={lang}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{topicName}</p>
          {rule && source ? (
            <p className="numeric mt-1 text-3xl font-bold text-ink-900">
              {formatValue(rule.value, lang)}
            </p>
          ) : (
            <p className="mt-1 text-lg font-semibold text-ink-600">
              {answer.status === 'needs_input' ? t('needsInput', lang) : t('noRule', lang)}
            </p>
          )}
        </div>
        <StatusBadge answer={answer} lang={lang} />
      </div>

      {answer.status === 'needs_input' && (
        <div className="px-5 py-4 text-sm">
          <p className="text-ink-600">{t('needsInputHelp', lang)}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {answer.missing.map((f) => (
              <li key={f} className="chip bg-sky-50 text-sky-800 ring-1 ring-sky-200">
                {bi(FIELD_LABEL[f], lang)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer.status === 'no_rule' && (
        <div className="px-5 py-4 text-sm text-ink-600">{t('noRuleHelp', lang)}</div>
      )}

      {rule && source && version && (
        <div className="space-y-4 px-5 py-4">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                {t('appliesWhen', lang)}
              </dt>
              <dd className="mt-0.5 text-ink-800">{bi(rule.conditionText, lang)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                {t('source', lang)}
              </dt>
              <dd className="numeric mt-0.5 font-medium text-ink-800">
                {source.ruleNumber} · {source.tableNumber} · {t('page', lang)} {pageLabel(source)}
              </dd>
              <dd className="mt-0.5 text-xs text-ink-600">{bi(source.tableTitle, lang)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                {t('version', lang)}
              </dt>
              <dd className="mt-0.5 font-medium text-ink-800">{bi(version.shortLabel, lang)}</dd>
              <dd className="numeric mt-0.5 flex items-center gap-1 text-xs text-ink-600">
                <CalendarClock className="h-3 w-3" />
                {t('effective', lang)} {formatDate(version.effectiveDate, lang)}
              </dd>
            </div>
          </dl>

          {rule.note && (
            <p className="flex gap-2 rounded-xl bg-ink-50 px-3 py-2.5 text-sm text-ink-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
              <span>{bi(rule.note, lang)}</span>
            </p>
          )}

          {answer.derived.map((d) => (
            <div key={d.label.en} className="rounded-xl bg-indigo-50/60 px-3 py-2.5 ring-1 ring-indigo-100">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-500">
                <Calculator className="h-3.5 w-3.5" /> {t('calculated', lang)}
              </p>
              <p className="numeric mt-1 text-base font-semibold text-indigo-900">
                {bi(d.label, lang)}: {d.value}
              </p>
              <p className="numeric mt-0.5 text-xs text-indigo-700/80">{bi(d.formula, lang)}</p>
            </div>
          ))}

          {answer.cautions.map((c, i) => (
            <p key={i} className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900 ring-1 ring-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span><strong className="font-semibold">{t('caution', lang)}: </strong>{bi(c, lang)}</span>
            </p>
          ))}

          {answer.superseded.length > 0 && (
            <div className="rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
                <History className="h-3.5 w-3.5" />
                {answer.changedByAmendment ? t('changed', lang) : t('unchanged', lang)}
              </p>
              {answer.superseded.map((s) => (
                <p key={s.rule.id} className="numeric mt-1 text-sm text-ink-600">
                  <span className="font-medium">{t('previously', lang)}:</span>{' '}
                  <s className="decoration-ink-400/60">{formatValue(s.rule.value, lang)}</s>{' '}
                  — {s.source.ruleNumber}, {s.source.tableNumber}, {t('page', lang)} {pageLabel(s.source)}{' '}
                  ({bi(s.version.shortLabel, lang)})
                </p>
              ))}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="focus-ring no-print inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
              aria-expanded={open}
            >
              <FileText className="h-4 w-4" />
              {open ? t('hideExcerpt', lang) : t('openExcerpt', lang)}
              <ChevronDown className={open ? 'h-4 w-4 rotate-180 transition-transform' : 'h-4 w-4 transition-transform'} />
            </button>

            {open && (
              <div className="rise mt-3 rounded-xl border border-ink-200 bg-ink-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  {t('exactWording', lang)} — {source.ruleNumber}, {source.tableNumber},{' '}
                  {t('page', lang)} {pageLabel(source)}
                </p>
                <p className="mt-1 text-sm font-medium text-ink-800">{bi(source.ruleTitle, lang)}</p>
                {source.excerptStatus === 'placeholder' && (
                  <p className="mt-2 flex gap-2 rounded-lg bg-amber-100/70 px-2.5 py-2 text-xs text-amber-900">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{t('placeholderText', lang)}</span>
                  </p>
                )}
                <blockquote className="mt-3 border-l-2 border-ink-200 pl-3 text-sm leading-relaxed text-ink-800">
                  {bi(source.excerpt, lang)}
                </blockquote>
                <p className="numeric mt-3 text-xs text-ink-400">
                  {version.notification} · {t('effective', lang)} {formatDate(version.effectiveDate, lang)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
