/**
 * A concise, practical checklist for what to do with this preliminary check —
 * built entirely from data the app already has (the computed `ComplianceResult`
 * and the query's zone/locality field). It never names a specific external
 * service or form: NiyamSathi does not submit applications or confirm zoning,
 * so the checklist only ever points the citizen back to the Building
 * Permission Branch for anything outside what the rule tables cover.
 */
import { AlertTriangle, CheckSquare, HelpCircle, MapPinned, ScrollText } from 'lucide-react'
import { TOPIC_LABEL, t } from '../lib/i18n'
import type { ComplianceResult, ComplianceZone, Lang, Topic } from '../lib/types'

interface Props {
  lang: Lang
  result: ComplianceResult
  zone: string | null
}

const ZONE_TOPIC: Record<ComplianceZone, Topic | null> = {
  front: 'front_setback', rear: 'rear_setback', left: 'side_setback', right: 'side_setback', floors: 'max_floors',
}

function zoneLabel(zone: ComplianceZone, lang: Lang): string {
  const topic = ZONE_TOPIC[zone]
  return topic ? TOPIC_LABEL[topic][lang] : zone
}

export default function BeforeYouApplyChecklist({ lang, result, zone }: Props) {
  const violationLabels = [...new Set(result.violations.map((v) => zoneLabel(v.zone, lang)))]
  const officerReviewLabels = result.officerReviewTopics.map((tp) => TOPIC_LABEL[tp][lang])
  const missingLabels = result.missingInputTopics.map((tp) => TOPIC_LABEL[tp][lang])

  return (
    <section className="panel p-5">
      <p className="display flex items-center gap-2 text-sm font-bold text-paper">
        <CheckSquare className="h-4 w-4 text-teal" aria-hidden="true" />
        {t('beforeYouApplyTitle', lang)}
      </p>

      <ul className="mt-3 space-y-2.5 text-sm text-muted">
        <li className="flex items-start gap-2">
          <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
          <span>{t('beforeYouApplyZoning', lang)}</span>
        </li>

        {zone === null && (
          <li className="tint-warn flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t('beforeYouApplyZone', lang)}</span>
          </li>
        )}

        {violationLabels.length > 0 && (
          <li className="tint-bad flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span><strong className="font-semibold">{t('beforeYouApplyViolation', lang)}:</strong> {violationLabels.join(', ')}</span>
          </li>
        )}

        {officerReviewLabels.length > 0 && (
          <li className="tint-review flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span><strong className="font-semibold">{t('beforeYouApplyOfficerReview', lang)}:</strong> {officerReviewLabels.join(', ')}</span>
          </li>
        )}

        {missingLabels.length > 0 && (
          <li className="tint-warn flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span><strong className="font-semibold">{t('beforeYouApplyMissing', lang)}:</strong> {missingLabels.join(', ')}</span>
          </li>
        )}

        <li className="flex items-start gap-2">
          <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
          <span>{t('beforeYouApplyCarry', lang)}</span>
        </li>
      </ul>

      <div className="hairline mt-3" />
      <p className="mt-3 text-xs leading-relaxed text-faint">{t('beforeYouApplyNotApproval', lang)}</p>
    </section>
  )
}
