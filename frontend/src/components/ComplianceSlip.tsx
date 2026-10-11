/**
 * The printable citizen hand-out.
 *
 * Deliberately the one light-on-white surface in a dark product: this is a
 * paper document, and what is reviewed on screen must be exactly what leaves
 * the printer. It therefore uses literal slate tones rather than the app's
 * theme tokens, so a future theme change cannot silently turn a handed-out
 * document unreadable.
 *
 * It reports; it never recomputes. Every figure is read out of the `Answer[]`
 * and `ComplianceResult` already on screen.
 */
import { ScrollText } from 'lucide-react'
import { formatValue, pageLabel } from '../lib/engine'
import {
  COMPLIANCE_STATUS_LABEL, FIELD_LABEL, ROAD_FACING_LABEL, TOPIC_LABEL, USE_LABEL, bi, formatDate, t,
} from '../lib/i18n'
import type { Answer, ComplianceResult, ComplianceStatus, Lang, PlotDetails, Use } from '../lib/types'

interface Props {
  lang: Lang
  asOf: string
  dateIssued: string
  plotArea: number | null
  roadWidth: number | null
  use: Use | null
  zone: string | null
  plotDetails: PlotDetails
  answers: Answer[]
  complianceResult: ComplianceResult
  referenceCode: string
}

const SETBACK_TOPICS = ['front_setback', 'side_setback', 'rear_setback'] as const
const SUMMARY_TOPICS = ['ground_coverage', 'far', 'max_floors', 'fee'] as const

const STATUS_PAPER: Record<ComplianceStatus, string> = {
  match: 'bg-emerald-50 text-emerald-900 border-emerald-300',
  needs_input: 'bg-amber-50 text-amber-900 border-amber-300',
  violation: 'bg-rose-50 text-rose-900 border-rose-300',
  officer_review: 'bg-slate-100 text-slate-800 border-slate-300',
}

export default function ComplianceSlip(props: Props) {
  const {
    lang, asOf, dateIssued, plotArea, roadWidth, use, zone,
    plotDetails, answers, complianceResult, referenceCode,
  } = props
  const byTopic = new Map(answers.map((a) => [a.topic, a]))

  const facts: [string, string][] = [
    [bi(FIELD_LABEL.plotArea, lang), plotArea !== null ? `${plotArea} ${t('unitSqm', lang)}` : '—'],
    [bi(FIELD_LABEL.roadWidth, lang), roadWidth !== null ? `${roadWidth} ${t('unitM', lang)}` : '—'],
    [bi(FIELD_LABEL.use, lang), use ? USE_LABEL[use][lang] : '—'],
    [bi(FIELD_LABEL.zone, lang), zone ?? '—'],
    [bi(FIELD_LABEL.plotWidth, lang), plotDetails.plotWidth !== null ? `${plotDetails.plotWidth} ${t('unitM', lang)}` : '—'],
    [bi(FIELD_LABEL.plotDepth, lang), plotDetails.plotDepth !== null ? `${plotDetails.plotDepth} ${t('unitM', lang)}` : '—'],
    [bi(FIELD_LABEL.roadFacing, lang), plotDetails.roadFacing ? ROAD_FACING_LABEL[plotDetails.roadFacing][lang] : '—'],
  ]

  return (
    <div className="compliance-slip rounded-2xl p-8 shadow-2xl" lang={lang}>
      <header className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
        <div className="flex items-center gap-2.5">
          <ScrollText className="h-7 w-7 text-slate-900" aria-hidden="true" />
          <div>
            <p className="text-lg font-bold text-slate-900">{t('appName', lang)}</p>
            <p className="text-xs text-slate-500">{t('slipTitle', lang)}</p>
          </div>
        </div>
        <div className="numeric text-right text-xs text-slate-600">
          <p>{t('slipDate', lang)}: <span className="font-semibold text-slate-900">{formatDate(dateIssued, lang)}</span></p>
          <p className="mt-0.5">{t('asOf', lang)}: <span className="font-semibold text-slate-900">{formatDate(asOf, lang)}</span></p>
          <p className="mt-0.5">{t('slipLanguage', lang)}: <span className="font-semibold text-slate-900">{lang === 'hi' ? 'हिन्दी' : 'English'}</span></p>
        </div>
      </header>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {t('slipReference', lang)}
        </span>
        <span className="numeric text-sm font-bold tracking-wider text-slate-900">{referenceCode}</span>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">{t('slipReferenceNote', lang)}</p>

      <p className={`mt-4 rounded-lg border px-3 py-2.5 text-sm font-bold ${STATUS_PAPER[complianceResult.status]}`}>
        {COMPLIANCE_STATUS_LABEL[complianceResult.status][lang]}
      </p>

      {complianceResult.violations.length > 0 && (
        <ul className="numeric mt-2 space-y-1 text-xs text-rose-800">
          {complianceResult.violations.map((v, i) => (
            <li key={i}>
              • {v.zone === 'floors' ? TOPIC_LABEL.max_floors[lang] : v.zone} — {t('proposed', lang)}{' '}
              {v.proposed}, {t('required', lang)} {v.required}
            </li>
          ))}
        </ul>
      )}

      <section className="mt-5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('slipPlotDetails', lang)}</h2>
        <dl className="numeric mt-1.5 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {facts.map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-slate-100 py-0.5">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-semibold text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('slipSetbackSummary', lang)}</h2>
        <table className="numeric mt-1.5 w-full text-left text-sm">
          <tbody>
            {SETBACK_TOPICS.map((topic) => {
              const a = byTopic.get(topic)
              return (
                <tr key={topic} className="border-b border-slate-100">
                  <td className="py-1 pr-2 font-medium text-slate-700">{TOPIC_LABEL[topic][lang]}</td>
                  <td className="py-1 pr-2 font-bold text-slate-900">
                    {a?.status === 'matched' && a.rule ? formatValue(a.rule.value, lang) : '—'}
                  </td>
                  <td className="py-1 text-[11px] text-slate-500">
                    {a?.status === 'matched' && a.source && a.version
                      ? `${a.source.ruleNumber}, ${a.source.tableNumber}, ${t('page', lang)} ${pageLabel(a.source)} (${bi(a.version.shortLabel, lang)}, ${formatDate(a.version.effectiveDate, lang)})`
                      : a?.status === 'needs_input'
                        ? t('needsInput', lang)
                        : ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="mt-5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('slipFloorsFarFee', lang)}</h2>
        <table className="numeric mt-1.5 w-full text-left text-sm">
          <tbody>
            {SUMMARY_TOPICS.map((topic) => {
              const a = byTopic.get(topic)
              if (!a) return null
              return (
                <tr key={topic} className="border-b border-slate-100">
                  <td className="py-1 pr-2 font-medium text-slate-700">{TOPIC_LABEL[topic][lang]}</td>
                  <td className="py-1 pr-2 font-bold text-slate-900">
                    {a.status === 'matched' && a.rule ? formatValue(a.rule.value, lang) : '—'}
                  </td>
                  <td className="py-1 text-[11px] text-slate-600">
                    {a.derived[0] ? `${bi(a.derived[0].label, lang)}: ${a.derived[0].value}` : ''}
                  </td>
                  <td className="py-1 text-[11px] text-slate-500">
                    {a.status === 'matched' && a.source
                      ? `${a.source.ruleNumber}, ${t('page', lang)} ${pageLabel(a.source)}`
                      : ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <footer className="mt-6 space-y-1.5 border-t-2 border-slate-900 pt-3 text-[11px]">
        <p className="font-bold text-rose-700">{t('slipDisclaimer', lang)}</p>
        <p className="text-slate-600">{t('trustDisclaimer', lang)}</p>
        <p className="text-slate-500">{t('demoDataBadge', lang)}</p>
        <p className="text-slate-400">{t('footer', lang)}</p>
      </footer>
    </div>
  )
}
