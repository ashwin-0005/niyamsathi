import { useMemo, useState } from 'react'
import { Database, Search } from 'lucide-react'
import { ALL_TOPICS, RULES, VERSIONS, formatValue, pageLabel, sourceOf, versionOf } from '../lib/engine'
import { TOPIC_LABEL, USE_LABEL, bi, formatDate, t } from '../lib/i18n'
import type { Lang, Topic, Use } from '../lib/types'

const pillOn = 'focus-ring rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white'
const pillOff = 'focus-ring rounded-full border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-ink-400'

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
    <section className="card overflow-hidden">
      <div className="border-b border-ink-100 bg-ink-50/50 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Database className="h-4 w-4 text-ink-400" />
          {t('explorerTab', lang)}
          <span className="numeric font-normal text-ink-400">
            — {rows.length} / {RULES.length} {t('rows', lang)}
          </span>
        </p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchRules', lang)}
            className="focus-ring w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm transition hover:border-ink-400"
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
          <thead className="border-b border-ink-100 bg-white text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-5 py-3 font-semibold">{t('topicsAsked', lang)}</th>
              <th className="px-5 py-3 font-semibold">{t('appliesWhen', lang)}</th>
              <th className="px-5 py-3 font-semibold">{t('value', lang)}</th>
              <th className="px-5 py-3 font-semibold">{t('source', lang)}</th>
              <th className="px-5 py-3 font-semibold">{t('version', lang)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map(({ rule, source, version }) => (
              <tr key={rule.id} className="align-top transition hover:bg-ink-50/60">
                <td className="px-5 py-3">
                  <span className="font-medium text-ink-900">{TOPIC_LABEL[rule.topic][lang]}</span>
                  <span className="mt-0.5 block text-xs text-ink-400">
                    {rule.use.map((u: Use) => USE_LABEL[u][lang]).join(', ')}
                  </span>
                </td>
                <td className="max-w-xs px-5 py-3 text-ink-600">{bi(rule.conditionText, lang)}</td>
                <td className="numeric px-5 py-3 font-semibold text-ink-900">{formatValue(rule.value, lang)}</td>
                <td className="numeric px-5 py-3 text-ink-600">
                  {source.ruleNumber}
                  <span className="mt-0.5 block text-xs text-ink-400">
                    {source.tableNumber} · {t('page', lang)} {pageLabel(source)}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-ink-600">
                  {bi(version.shortLabel, lang)}
                  <span className="numeric mt-0.5 block text-ink-400">
                    {formatDate(version.effectiveDate, lang)}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink-400">
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
