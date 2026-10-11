/**
 * String-valued mirrors of `Query` and `PlotDetails` for controlled inputs,
 * plus the conversions back to the typed domain models.
 *
 * These live outside the components because three places need them — the
 * input panel, the demo scenarios, and the app shell — and routing that
 * through a component module would make the scenario data depend on the UI.
 * Empty string always converts to `null`, never to 0: "not stated" and "zero
 * metres" are different answers, and the engine treats them differently.
 */
import type { PlotDetails, RoadFacing, Topic, Use } from './types'

export interface FormState {
  plotArea: string
  roadWidth: string
  use: Use | ''
  zone: string
  proposedFloors: string
  topics: Topic[]
}

export interface PlotDetailsFormState {
  plotWidth: string
  plotDepth: string
  roadFacing: RoadFacing | ''
  proposedFrontSetback: string
  proposedRearSetback: string
  proposedLeftSetback: string
  proposedRightSetback: string
}

export const EMPTY_FORM: FormState = {
  plotArea: '', roadWidth: '', use: '', zone: '', proposedFloors: '', topics: [],
}

export const EMPTY_PLOT_DETAILS_FORM: PlotDetailsFormState = {
  plotWidth: '', plotDepth: '', roadFacing: '',
  proposedFrontSetback: '', proposedRearSetback: '', proposedLeftSetback: '', proposedRightSetback: '',
}

export function toNumberOrNull(v: string): number | null {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

/**
 * `overrides` carries values the parser recovered from free text. They only
 * fill gaps the clerk left blank — a typed field always wins over a parsed
 * one, so editing a box is never silently undone by re-parsing the question.
 */
export function toPlotDetails(
  f: PlotDetailsFormState,
  overrides: Partial<PlotDetails> = {},
): PlotDetails {
  return {
    plotWidth: toNumberOrNull(f.plotWidth) ?? overrides.plotWidth ?? null,
    plotDepth: toNumberOrNull(f.plotDepth) ?? overrides.plotDepth ?? null,
    roadFacing: (f.roadFacing || null) ?? overrides.roadFacing ?? null,
    proposedFrontSetback: toNumberOrNull(f.proposedFrontSetback),
    proposedRearSetback: toNumberOrNull(f.proposedRearSetback),
    proposedLeftSetback: toNumberOrNull(f.proposedLeftSetback),
    proposedRightSetback: toNumberOrNull(f.proposedRightSetback),
  }
}
