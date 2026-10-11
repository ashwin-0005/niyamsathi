/**
 * The traffic-light verdict for the whole plot.
 *
 * Renders a `ComplianceResult` exactly as `compliance.ts` computed it — this
 * component makes no judgement of its own, it only presents one. The
 * "preliminary guidance" disclaimer is unconditional: it shows on green as
 * loudly as on red, because a clean rule match is still not an approval.
 */
import { AlertTriangle, BadgeCheck, HelpCircle, UserCog } from 'lucide-react'
import { COMPLIANCE_STATUS_LABEL, TOPIC_LABEL, t } from '../lib/i18n'
import type { ComplianceResult, ComplianceStatus, Lang } from '../lib/types'

interface Props {
  lang: Lang
  result: ComplianceResult
}

const ZONE_LABEL_KEY = {
  front: 'zoneFront', rear: 'zoneRear', left: 'zoneLeft', right: 'zoneRight',
} as const

const THEME: Record<ComplianceStatus, { tint: string; icon: typeof BadgeCheck }> = {
  match: { tint: 'tint-ok', icon: BadgeCheck },
  needs_input: { tint: 'tint-warn', icon: HelpCircle },
  violation: { tint: 'tint-bad', icon: AlertTriangle },
  officer_review: { tint: 'tint-review', icon: UserCog },
}

export default function ComplianceStatusCard({ lang, result }: Props) {
  const theme = THEME[result.status]
  const Icon = theme.icon
  const isViolation = result.status === 'violation'

  return (
    <section className={`panel rise overflow-hidden border ${theme.tint}`} aria-live="polite">
      <div className={`flex items-center gap-3 border-b border-current/15 px-5 py-4 ${theme.tint}`}>
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-current/30 bg-current/10">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          {isViolation && (
            <span className="listen-ring absolute inset-0 rounded-full ring-2 ring-current" aria-hidden="true" />
          )}
        </span>
        <p className="display text-lg font-bold leading-tight">
          {COMPLIANCE_STATUS_LABEL[result.status][lang]}
        </p>
      </div>

      <div className="space-y-3 px-5 py-4 text-sm">
        {result.violations.length > 0 && (
          <ul className="space-y-1.5">
            {result.violations.map((v, i) => (
              <li key={i} className="numeric rounded-lg border border-bad/25 bg-bad/10 px-3 py-2 text-bad">
                {v.zone === 'floors' ? (
                  <>
                    <span className="font-semibold">{TOPIC_LABEL.max_floors[lang]}:</span>{' '}
                    {t('proposed', lang)} {v.proposed} — {t('violationDetailFloors', lang)}{' '}
                    {(v.proposed - v.required).toFixed(0)}
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
          <p className="text-muted">
            <span className="font-semibold text-review">{t('officerReviewReason', lang)}:</span>{' '}
            {result.officerReviewTopics.map((tp) => TOPIC_LABEL[tp][lang]).join(', ')}
          </p>
        )}

        {result.missingInputTopics.length > 0 && (
          <p className="text-muted">
            <span className="font-semibold text-warn">{t('needsInputReason', lang)}:</span>{' '}
            {result.missingInputTopics.map((tp) => TOPIC_LABEL[tp][lang]).join(', ')}
          </p>
        )}

        <div className="hairline" />
        <p className="text-xs leading-relaxed text-faint">{t('statusCardDisclaimer', lang)}</p>
        <p className="text-xs leading-relaxed text-faint">{t('scopeNote', lang)}</p>
      </div>
    </section>
  )
}
