import { AlertTriangle, BadgeCheck, HelpCircle, UserCog } from 'lucide-react'
import { COMPLIANCE_STATUS_LABEL, TOPIC_LABEL, t } from '../lib/i18n'
import type { ComplianceResult, Lang } from '../lib/types'

interface Props {
  lang: Lang
  result: ComplianceResult
}

const ZONE_LABEL_KEY: Record<string, 'zoneFront' | 'zoneRear' | 'zoneLeft' | 'zoneRight'> = {
  front: 'zoneFront', rear: 'zoneRear', left: 'zoneLeft', right: 'zoneRight',
}

const THEME: Record<ComplianceResult['status'], { bg: string; border: string; text: string; icon: typeof BadgeCheck }> = {
  match: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: BadgeCheck },
  needs_input: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: HelpCircle },
  violation: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', icon: AlertTriangle },
  officer_review: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-800', icon: UserCog },
}

export default function ComplianceStatusCard({ lang, result }: Props) {
  const theme = THEME[result.status]
  const Icon = theme.icon

  return (
    <section className={`card rise overflow-hidden border-2 ${theme.border}`}>
      <div className={`${theme.bg} px-5 py-4`}>
        <p className={`flex items-center gap-2 text-lg font-bold ${theme.text}`}>
          <Icon className="h-5 w-5 shrink-0" />
          {COMPLIANCE_STATUS_LABEL[result.status][lang]}
        </p>
      </div>

      <div className="space-y-3 px-5 py-4 text-sm">
        {result.violations.length > 0 && (
          <ul className="space-y-1.5">
            {result.violations.map((v, i) => (
              <li key={i} className="numeric rounded-lg bg-rose-50 px-3 py-2 text-rose-800">
                {v.zone === 'floors' ? (
                  <>
                    <span className="font-semibold">{TOPIC_LABEL.max_floors[lang]}:</span>{' '}
                    {t('proposed', lang)} {v.proposed} {t('violationDetailFloors', lang)} {(v.proposed - v.required).toFixed(0)}
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{t(ZONE_LABEL_KEY[v.zone], lang)}:</span>{' '}
                    {t('proposed', lang)} {v.proposed.toFixed(1)} m, {t('required', lang)} {v.required.toFixed(1)} m —{' '}
                    {t('violationDetail', lang)} {(v.required - v.proposed).toFixed(1)} m
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {result.officerReviewTopics.length > 0 && (
          <p className="text-slate-600">
            {t('officerReviewReason', lang)}: {result.officerReviewTopics.map((tp) => TOPIC_LABEL[tp][lang]).join(', ')}
          </p>
        )}

        {result.missingInputTopics.length > 0 && (
          <p className="text-amber-800">
            {t('needsInputReason', lang)}: {result.missingInputTopics.map((tp) => TOPIC_LABEL[tp][lang]).join(', ')}
          </p>
        )}

        <p className="border-t border-ink-100 pt-3 text-xs italic text-ink-400">
          {t('statusCardDisclaimer', lang)}
        </p>
      </div>
    </section>
  )
}
