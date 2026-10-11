import { ScrollText } from 'lucide-react'
import { formatValue, pageLabel } from '../lib/engine'
import { COMPLIANCE_STATUS_LABEL, FIELD_LABEL, ROAD_FACING_LABEL, TOPIC_LABEL, USE_LABEL, bi, formatDate, t } from '../lib/i18n'
import type { Answer, ComplianceResult, Lang, PlotDetails, Use } from '../lib/types'

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

export default function ComplianceSlip(props: Props) {
  const { lang, asOf, dateIssued, plotArea, roadWidth, use, zone, plotDetails, answers, complianceResult, referenceCode } = props
  const byTopic = new Map(answers.map((a) => [a.topic, a]))
  const far = byTopic.get('far')
  const coverage = byTopic.get('ground_coverage')
  const floors = byTopic.get('max_floors')
  const fee = byTopic.get('fee')

  return (
    <div className="compliance-slip rounded-2xl bg-white p-8 text-ink-900 shadow-xl" lang={lang}>
        <header className="flex items-center justify-between border-b-2 border-ink-900 pb-4">
          <div className="flex items-center gap-2">
            <ScrollText className="h-7 w-7" />
            <div>
              <p className="text-lg font-bold">{t('appName', lang)}</p>
              <p className="text-xs text-ink-500">{t('slipTitle', lang)}</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p>{t('slipDate', lang)}: <span className="numeric font-medium">{formatDate(dateIssued, lang)}</span></p>
            <p>{t('slipLanguage', lang)}: <span className="font-medium">{lang === 'hi' ? 'हिन्दी' : 'English'}</span></p>
          </div>
        </header>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">{t('slipReference', lang)}</span>
          <span className="numeric text-sm font-bold tracking-wider">{referenceCode}</span>
        </div>
        <p className="mt-1 text-[11px] text-ink-400">{t('slipReferenceNote', lang)}</p>

        <section className="mt-4">
          <p
            className="rounded-lg px-3 py-2 text-sm font-bold"
            style={{
              background: complianceResult.status === 'match' ? '#ecfdf5'
                : complianceResult.status === 'violation' ? '#fff1f2'
                : complianceResult.status === 'officer_review' ? '#f1f5f9' : '#fffbeb',
            }}
          >
            {COMPLIANCE_STATUS_LABEL[complianceResult.status][lang]}
          </p>
        </section>

        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">{t('slipPlotDetails', lang)}</h2>
          <dl className="numeric mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div><dt className="inline text-ink-500">{bi(FIELD_LABEL.plotArea, lang)}: </dt><dd className="inline font-medium">{plotArea ?? '—'} {t('unitSqm', lang)}</dd></div>
            <div><dt className="inline text-ink-500">{bi(FIELD_LABEL.roadWidth, lang)}: </dt><dd className="inline font-medium">{roadWidth ?? '—'} {t('unitM', lang)}</dd></div>
            <div><dt className="inline text-ink-500">{bi(FIELD_LABEL.use, lang)}: </dt><dd className="inline font-medium">{use ? USE_LABEL[use][lang] : '—'}</dd></div>
            <div><dt className="inline text-ink-500">{bi(FIELD_LABEL.zone, lang)}: </dt><dd className="inline font-medium">{zone ?? '—'}</dd></div>
            <div><dt className="inline text-ink-500">{bi(FIELD_LABEL.plotWidth, lang)}: </dt><dd className="inline font-medium">{plotDetails.plotWidth ?? '—'} {t('unitM', lang)}</dd></div>
            <div><dt className="inline text-ink-500">{bi(FIELD_LABEL.plotDepth, lang)}: </dt><dd className="inline font-medium">{plotDetails.plotDepth ?? '—'} {t('unitM', lang)}</dd></div>
            <div><dt className="inline text-ink-500">{bi(FIELD_LABEL.roadFacing, lang)}: </dt><dd className="inline font-medium">{plotDetails.roadFacing ? ROAD_FACING_LABEL[plotDetails.roadFacing][lang] : '—'}</dd></div>
          </dl>
        </section>

        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">{t('slipSetbackSummary', lang)}</h2>
          <table className="numeric mt-1 w-full text-sm">
            <tbody>
              {SETBACK_TOPICS.map((topic) => {
                const a = byTopic.get(topic)
                return (
                  <tr key={topic} className="border-b border-ink-100">
                    <td className="py-1 pr-2 font-medium">{TOPIC_LABEL[topic][lang]}</td>
                    <td className="py-1 pr-2">{a?.status === 'matched' && a.rule ? formatValue(a.rule.value, lang) : '—'}</td>
                    <td className="py-1 text-xs text-ink-500">
                      {a?.status === 'matched' && a.source && a.version
                        ? `${a.source.ruleNumber}, ${a.source.tableNumber}, ${t('page', lang)} ${pageLabel(a.source)} (${bi(a.version.shortLabel, lang)}, ${formatDate(a.version.effectiveDate, lang)})`
                        : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">{t('slipBuildableSummary', lang)}</h2>
            <ul className="numeric mt-1 space-y-0.5 text-sm">
              {coverage?.status === 'matched' && coverage.rule && (
                <li>{TOPIC_LABEL.ground_coverage[lang]}: {formatValue(coverage.rule.value, lang)}{coverage.derived[0] ? ` → ${coverage.derived[0].value}` : ''}</li>
              )}
              {far?.status === 'matched' && far.rule && (
                <li>{TOPIC_LABEL.far[lang]}: {formatValue(far.rule.value, lang)}{far.derived[0] ? ` → ${far.derived[0].value}` : ''}</li>
              )}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">{t('slipFloorsFarFee', lang)}</h2>
            <ul className="numeric mt-1 space-y-0.5 text-sm">
              {floors?.status === 'matched' && floors.rule && <li>{TOPIC_LABEL.max_floors[lang]}: {formatValue(floors.rule.value, lang)}</li>}
              {fee?.status === 'matched' && fee.rule && (
                <li>{TOPIC_LABEL.fee[lang]}: {formatValue(fee.rule.value, lang)}{fee.derived[0] ? ` → ${fee.derived[0].value}` : ''}</li>
              )}
            </ul>
          </div>
        </section>

        <footer className="mt-6 space-y-1.5 border-t-2 border-ink-900 pt-3 text-xs">
          <p className="font-bold text-rose-700">{t('slipDisclaimer', lang)}</p>
          <p className="text-ink-600">{t('statusCardDisclaimer', lang)}</p>
          <p className="text-ink-400">{t('footer', lang)}</p>
          <p className="text-ink-400">{t('asOf', lang)}: {formatDate(asOf, lang)}</p>
        </footer>
    </div>
  )
}
