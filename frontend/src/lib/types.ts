export type Lang = 'en' | 'hi'

export type Topic =
  | 'front_setback'
  | 'side_setback'
  | 'rear_setback'
  | 'far'
  | 'ground_coverage'
  | 'max_floors'
  | 'fee'

export type Use = 'residential' | 'commercial' | 'mixed'

export type Bi = { en: string; hi: string }

export interface Version {
  id: string
  label: Bi
  shortLabel: Bi
  effectiveDate: string
  notification: string
  scope: Bi
  verified: boolean
}

export interface Source {
  id: string
  versionId: string
  ruleNumber: string
  ruleTitle: Bi
  tableNumber: string
  tableTitle: Bi
  pageNumber: number
  pageSuffix?: string
  excerptStatus: 'placeholder' | 'verified'
  excerpt: Bi
}

export interface Conditions {
  /** exclusive lower bound on plot area in sq m (`> min`); null = unbounded */
  plotAreaMin: number | null
  /** inclusive upper bound on plot area in sq m (`<= max`); null = unbounded */
  plotAreaMax: number | null
  /** inclusive lower bound on road width in m (`>= min`); null = unbounded */
  roadWidthMin: number | null
  /** exclusive upper bound on road width in m (`< max`); null = unbounded */
  roadWidthMax: number | null
}

export type ValueKind = 'length' | 'ratio' | 'percent' | 'floors' | 'rate' | 'not_permitted'

export interface RuleValue {
  kind: ValueKind
  number: number | null
  unit: string
  label?: Bi
}

export interface Rule {
  id: string
  topic: Topic
  sourceId: string
  use: Use[]
  conditions: Conditions
  value: RuleValue
  conditionText: Bi
  note?: Bi
}

/** What the clerk asked, after extraction or form entry. */
export interface Query {
  plotArea: number | null
  roadWidth: number | null
  use: Use | null
  zone: string | null
  proposedFloors: number | null
  topics: Topic[]
  /** ISO date the answer is evaluated as of — lets a clerk check pre-amendment position */
  asOf: string
  lang: Lang
  rawText?: string
}

export type MissingField = 'plotArea' | 'roadWidth' | 'use'

export type AnswerStatus = 'matched' | 'needs_input' | 'no_rule' | 'ambiguous'

export interface Derived {
  label: Bi
  value: string
  formula: Bi
}

export interface Answer {
  topic: Topic
  status: AnswerStatus
  rule?: Rule
  source?: Source
  version?: Version
  /** Rows from earlier versions that this answer replaces. */
  superseded: { rule: Rule; source: Source; version: Version }[]
  /** True when an older version gave a different value for the same query. */
  changedByAmendment: boolean
  missing: MissingField[]
  derived: Derived[]
  cautions: Bi[]
}

export type RoadFacing = 'north' | 'south' | 'east' | 'west'

/**
 * Inputs for the visual compliance map and the proposed-plan comparison.
 * Kept as a sibling of `Query`, not merged into it: the rule-matching engine
 * in `engine.ts` never reads any of these fields, only the geometry/compliance
 * layer does. Folding them into `Query` would make the matcher's input type
 * carry fields it silently ignores forever.
 */
export interface PlotDetails {
  plotWidth: number | null
  plotDepth: number | null
  roadFacing: RoadFacing | null
  proposedFrontSetback: number | null
  proposedRearSetback: number | null
  proposedLeftSetback: number | null
  proposedRightSetback: number | null
}

export type ComplianceStatus = 'match' | 'needs_input' | 'violation' | 'officer_review'

export type ComplianceZone = 'front' | 'rear' | 'left' | 'right' | 'floors'

export interface ComplianceViolation {
  zone: ComplianceZone
  required: number
  proposed: number
}

export interface ComplianceResult {
  status: ComplianceStatus
  violations: ComplianceViolation[]
  /** Core topics the engine could not resolve at all (ambiguous or no_rule). */
  officerReviewTopics: Topic[]
  /** Core topics still missing an input the engine needs to find the rule. */
  missingInputTopics: Topic[]
}
