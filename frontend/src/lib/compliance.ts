/**
 * Preliminary compliance status for the visual map, derived purely from
 * already-computed `Answer`s (never re-runs rule matching) plus the
 * citizen's optional proposed values. Kept separate from `geometry.ts` so
 * the spatial drawing logic and the status/traffic-light logic can be
 * reasoned about and tested independently.
 *
 * Priority — Red > Grey > Amber > Green — and why:
 *
 * 1. Red "Potential rule violation": any core topic is `matched` AND a
 *    proposed value for it is known to fail. A confirmed violation is a
 *    fact already in hand; it must never be hidden by some unrelated
 *    missing field elsewhere, so it outranks everything else.
 * 2. Grey "Officer review required": a core topic is `ambiguous`/`no_rule`
 *    (the dataset itself cannot resolve it), or the geometry layer reports
 *    no buildable footprint remains. This is a data/geometry problem, more
 *    serious than a clerk simply not having typed a number yet, so it
 *    outranks Amber.
 * 3. Amber "More information required": a core topic is `needs_input` (the
 *    engine needs one more field just to find the rule). Note: a clerk
 *    simply not having entered a *proposed* setback/floor count is NOT an
 *    Amber trigger on its own — those fields are optional by design, and
 *    Amber means the rule lookup is blocked, not that no comparison ran.
 * 4. Green "Preliminary rule match": every core topic matched, and every
 *    proposed value actually supplied is within its limit.
 */
import type { Answer, ComplianceResult, ComplianceViolation, PlotDetails, Topic } from './types'

export const CORE_TOPICS: Topic[] = ['front_setback', 'side_setback', 'rear_setback', 'max_floors']

const ZONE_BY_TOPIC: Record<string, ComplianceViolation['zone'] | undefined> = {
  front_setback: 'front',
  rear_setback: 'rear',
}

export function computeComplianceStatus(
  coreAnswers: Answer[],
  plotDetails: PlotDetails,
  proposedFloors: number | null,
  geometryImpossible: boolean,
): ComplianceResult {
  const violations: ComplianceViolation[] = []
  const officerReviewTopics: Topic[] = []
  const missingInputTopics: Topic[] = []

  for (const answer of coreAnswers) {
    if (answer.status === 'ambiguous' || answer.status === 'no_rule') {
      officerReviewTopics.push(answer.topic)
      continue
    }
    if (answer.status === 'needs_input') {
      missingInputTopics.push(answer.topic)
      continue
    }
    if (answer.status !== 'matched' || !answer.rule || answer.rule.value.number === null) continue

    const required = answer.rule.value.number

    if (answer.topic === 'max_floors') {
      if (proposedFloors !== null && proposedFloors > required) {
        violations.push({ zone: 'floors', required, proposed: proposedFloors })
      }
      continue
    }

    if (answer.topic === 'side_setback') {
      if (plotDetails.proposedLeftSetback !== null && plotDetails.proposedLeftSetback < required) {
        violations.push({ zone: 'left', required, proposed: plotDetails.proposedLeftSetback })
      }
      if (plotDetails.proposedRightSetback !== null && plotDetails.proposedRightSetback < required) {
        violations.push({ zone: 'right', required, proposed: plotDetails.proposedRightSetback })
      }
      continue
    }

    const zone = ZONE_BY_TOPIC[answer.topic]
    if (!zone) continue
    const proposed = zone === 'front' ? plotDetails.proposedFrontSetback : plotDetails.proposedRearSetback
    if (proposed !== null && proposed < required) {
      violations.push({ zone, required, proposed })
    }
  }

  const status =
    violations.length > 0
      ? 'violation'
      : officerReviewTopics.length > 0 || geometryImpossible
        ? 'officer_review'
        : missingInputTopics.length > 0
          ? 'needs_input'
          : 'match'

  return { status, violations, officerReviewTopics, missingInputTopics }
}
