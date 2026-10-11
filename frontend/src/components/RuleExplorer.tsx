import { useMemo, useState } from 'react'
import { BadgeCheck, Database, Search, ShieldAlert } from 'lucide-react'
import { ALL_TOPICS, RULES, VERSIONS, formatValue, pageLabel, sourceOf, versionOf } from '../lib/engine'
import { TOPIC_LABEL, USE_LABEL, bi, formatDate, t } from '../lib/i18n'
import type { Lang, Topic, Use } from '../lib/types'

const pillOn = 'chip chip-on focus-ring px-3 py-1.5'
const pillOff = 'chip chip-button focus-ring px-3 py-1.5'

export default function RuleExplorer({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<Topic | 'all'>('all')
  const [versionId, setVersionId] = useState<string | 'all'>('all')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return RULES.map((rule) => ({ rule, source: sourceOf(rule), version: versionOf(rule) }))
      .filter((r) => topic === 'all' || r.rule.topic === topic)
      .filter((r) => versionId === 'all' || r.version.id === versionId)
      .filter((r) => {
        if (!needle) return true
        const hay = [
          r.source.ruleNumber, r.source.tableNumber, String(r.source.pageNumber),
          r.rule.conditionText.en, r.rule.conditionText.hi,
          r.source.tableTitle.en, r.source.tableTitle.hi,
          TOPIC_LABEL[r.rule.topic].en, TOPIC_LABEL[r.rule.topic].hi,
        ].join(' ').toLowerCase()
        return hay.includes(needle)
      })
  }, [query, topic, versionId])

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-line bg-white/[0.02] p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-paper">
          <Database className="h-4 w-4 text-faint" />
          {t('explorerTab', lang)}
          <span className="numeric font-normal text-faint">
            — {rows.length} / {RULES.length} {t('rows', lang)}
          </span>
        </p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchRules', lang)}
            className="field py-2.5 pl-9 pr-3"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setTopic('all')} className={topic === 'all' ? pillOn : pillOff}>
            {t('allTopics', lang)}
          </button>
          {ALL_TOPICS.map((tp) => (
            <button key={tp} type="button" onClick={() => setTopic(tp)} className={topic === tp ? pillOn : pillOff}>
              {TOPIC_LABEL[tp][lang]}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => setVersionId('all')} className={versionId === 'all' ? pillOn : pillOff}>
            {lang === 'hi' ? 'सभी संस्करण' : 'All versions'}
          </button>
          {VERSIONS.map((v) => (
            <button key={v.id} type="button" onClick={() => setVersionId(v.id)} className={versionId === v.id ? pillOn : pillOff}>
              {bi(v.shortLabel, lang)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="border-b border-line bg-white/[0.02] text-xs uppercase tracking-[0.1em] text-faint">
            <tr>
              <th className="px-5 py-3 font-semibold">{t('topicsAsked', lang)}</th>
              <th className="px-5 py-3 font-semibold">{t('appliesWhen', lang)}</th>
              <th className="px-5 py-3 font-semibold">{t('value', lang)}</th>
              <th className="px-5 py-3 font-semibold">{t('source', lang)}</th>
              <th className="px-5 py-3 font-semibold">{t('version', lang)}</th>
              <th className="px-5 py-3 font-semibold">{t('verificationStatus', lang)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ rule, source, version }) => (
              <tr key={rule.id} className="align-top transition hover:bg-white/[0.03]">
                <td className="px-5 py-3">
                  <span className="font-medium text-paper">{TOPIC_LABEL[rule.topic][lang]}</span>
                  <span className="mt-0.5 block text-xs text-faint">
                    {rule.use.map((u: Use) => USE_LABEL[u][lang]).join(', ')}
                  </span>
                </td>
                <td className="max-w-xs px-5 py-3 text-muted">{bi(rule.conditionText, lang)}</td>
                <td className="numeric px-5 py-3 font-semibold text-paper">{formatValue(rule.value, lang)}</td>
                <td className="numeric px-5 py-3 text-muted">
                  {source.ruleNumber}
                  <span className="mt-0.5 block text-xs text-faint">
                    {source.tableNumber} · {t('page', lang)} {pageLabel(source)}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-muted">
                  {bi(version.shortLabel, lang)}
                  <span className="numeric mt-0.5 block text-faint">
                    {formatDate(version.effectiveDate, lang)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {source.excerptStatus === 'verified' ? (
                    <span className="chip tint-ok border text-[11px]"><BadgeCheck className="h-3 w-3" /> {t('verifiedMatch', lang)}</span>
                  ) : (
                    <span className="chip tint-warn border text-[11px]"><ShieldAlert className="h-3 w-3" /> {t('demoDataBadge', lang)}</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-faint">
                  {t('noRule', lang)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
