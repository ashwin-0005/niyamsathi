/**
 * Pure SVG layout math for the Visual Plot Compliance Map. Nothing in this
 * file imports `Answer`/`Rule`/`Source` — it only ever sees plain numbers, so
 * it stays provably separate from rule-matching logic (`engine.ts`) and can
 * be unit-tested without the dataset.
 *
 * Canonical layout: the road is always drawn along the bottom edge and the
 * four setback zones always sit in the same screen positions (front=bottom,
 * rear=top, left/right=sides). We deliberately do not rotate the drawing to
 * match the real-world road-facing direction — a small compass badge in the
 * component layer conveys true orientation instead. This keeps the geometry
 * math, hit-testing and dimension labels simple and upright regardless of
 * facing (confirmed with the user as the preferred simplification over
 * literal rotation).
 */

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export type ZoneId = 'front' | 'rear' | 'left' | 'right'
export type ZoneStatus = 'ok' | 'violation' | 'unknown' | 'not_applicable'

export interface SetbackZoneGeometry {
  id: ZoneId
  /** The full mandatory-open-space band for this edge, measured at scale. */
  requiredRect: Rect
  /** The sub-strip where a proposed value encroaches into the required band, if any. */
  violationRect: Rect | null
  status: ZoneStatus
  requiredValue: number | null
  proposedValue: number | null
}

export interface PlotGeometry {
  viewBoxWidth: number
  viewBoxHeight: number
  roadRect: Rect
  /** True when roadWidth was not supplied and roadRect uses a placeholder thickness. */
  roadWidthKnown: boolean
  plotRect: Rect
  /** Null when opposing setbacks consume the whole plot — no legal footprint remains. */
  buildableRect: Rect | null
  zones: Record<ZoneId, SetbackZoneGeometry>
  isIllustrative: boolean
  /** Actual-or-synthesized dimensions, for the on-map dimension labels. */
  plotWidth: number
  plotDepth: number
  scale: number
}

export interface GeometryInput {
  plotArea: number | null
  plotWidth: number | null
  plotDepth: number | null
  roadWidth: number | null
  required: { front: number | null; rear: number | null; side: number | null }
  proposed: { front: number | null; rear: number | null; left: number | null; right: number | null }
}

const VIEW_W = 640
const VIEW_H = 560
const SIDE_MARGIN = 72
const TOP_MARGIN = 56
const BOTTOM_MARGIN = 40
const ROAD_OVERHANG = 24
const PLACEHOLDER_ROAD_WIDTH_M = 6

function clampRect(r: Rect): Rect | null {
  if (r.width <= 0 || r.height <= 0) return null
  return r
}

/**
 * One edge's required/violation split, measured inward from the plot's outer
 * boundary along `axis` ('x' for left/right, 'y' for front/rear).
 *
 * Worked example (front setback, required 3 m, proposed 1.8 m, scale 10 px/m):
 *   - 0–1.8 m from the edge is the citizen's own claimed open margin — still
 *     genuinely open, rendered orange as part of `requiredRect`.
 *   - 1.8–3 m from the edge is where their building actually starts per the
 *     proposal, but the rule requires it to stay open until 3 m — that band
 *     sits against the buildable interior, not against the outer edge, and is
 *     the `violationRect`, rendered red.
 *   - Beyond 3 m is ordinary buildable area.
 * If proposed >= required (or absent), the whole band is open and there is
 * no violationRect.
 */
function buildZone(
  id: ZoneId,
  requiredValue: number | null,
  proposedValue: number | null,
  scale: number,
  bandRectAtFullDepth: (depthM: number) => Rect,
): SetbackZoneGeometry {
  if (requiredValue === null) {
    return {
      id,
      requiredRect: bandRectAtFullDepth(0),
      violationRect: null,
      status: 'unknown',
      requiredValue: null,
      proposedValue,
    }
  }

  const requiredRect = bandRectAtFullDepth(requiredValue)
  let violationRect: Rect | null = null
  let status: ZoneStatus = 'ok'

  if (proposedValue !== null && proposedValue < requiredValue) {
    // The encroached strip runs from `proposed` to `required` metres inward
    // from the edge — i.e. the half of the band nearest the plot interior —
    // so it sits touching the buildable rect, not touching the plot edge.
    // Which raw coordinate counts as "nearest interior" flips per zone: for
    // front and right, the band's smaller x/y is already the interior-facing
    // line (unshifted); for rear and left, the band's smaller x/y is the
    // outer plot-edge line, so the interior-facing line is offset forward by
    // `proposed` metres.
    const encroachDepthM = requiredValue - proposedValue
    const full = bandRectAtFullDepth(requiredValue)
    const proposedOffsetPx = proposedValue * scale
    if (id === 'front' || id === 'rear') {
      violationRect = {
        x: full.x,
        y: id === 'rear' ? full.y + proposedOffsetPx : full.y,
        width: full.width,
        height: encroachDepthM * scale,
      }
    } else {
      violationRect = {
        x: id === 'left' ? full.x + proposedOffsetPx : full.x,
        y: full.y,
        width: encroachDepthM * scale,
        height: full.height,
      }
    }
    status = 'violation'
  }

  return { id, requiredRect, violationRect, status, requiredValue, proposedValue }
}

export function computePlotGeometry(input: GeometryInput): PlotGeometry {
  const isIllustrative = input.plotWidth === null || input.plotDepth === null
  // Illustrative fallback: a square is the least presumptive shape when we
  // have no real frontage-to-depth ratio to go on, and the arithmetic
  // (width = depth = sqrt(area)) is trivially auditable at a counter.
  const plotWidth = input.plotWidth ?? (input.plotArea ? Math.sqrt(input.plotArea) : 10)
  const plotDepth = input.plotDepth ?? (input.plotArea ? Math.sqrt(input.plotArea) : 10)
  const roadWidthKnown = input.roadWidth !== null
  const roadDepthM = input.roadWidth ?? PLACEHOLDER_ROAD_WIDTH_M

  const totalDepthM = plotDepth + roadDepthM
  const scale = Math.min(
    (VIEW_W - 2 * SIDE_MARGIN) / plotWidth,
    (VIEW_H - TOP_MARGIN - BOTTOM_MARGIN) / totalDepthM,
  )

  const plotRect: Rect = {
    x: SIDE_MARGIN,
    y: TOP_MARGIN,
    width: plotWidth * scale,
    height: plotDepth * scale,
  }
  const roadRect: Rect = {
    x: plotRect.x - ROAD_OVERHANG,
    y: plotRect.y + plotRect.height,
    width: plotRect.width + 2 * ROAD_OVERHANG,
    height: roadDepthM * scale,
  }

  const front = buildZone('front', input.required.front, input.proposed.front, scale, (depthM) => ({
    x: plotRect.x,
    y: plotRect.y + plotRect.height - depthM * scale,
    width: plotRect.width,
    height: depthM * scale,
  }))
  const rear = buildZone('rear', input.required.rear, input.proposed.rear, scale, (depthM) => ({
    x: plotRect.x,
    y: plotRect.y,
    width: plotRect.width,
    height: depthM * scale,
  }))

  // Left/right bands span only the height between the front and rear bands,
  // so the four zones never double-draw the corners.
  const rearDepthPx = (input.required.rear ?? 0) * scale
  const frontDepthPx = (input.required.front ?? 0) * scale
  const sidesY = plotRect.y + rearDepthPx
  const sidesHeight = Math.max(0, plotRect.height - rearDepthPx - frontDepthPx)
  const sideBand = (depthM: number, atRight: boolean): Rect => ({
    x: atRight ? plotRect.x + plotRect.width - depthM * scale : plotRect.x,
    y: sidesY,
    width: depthM * scale,
    height: sidesHeight,
  })

  const left = buildZone('left', input.required.side, input.proposed.left, scale, (depthM) => sideBand(depthM, false))
  const right = buildZone('right', input.required.side, input.proposed.right, scale, (depthM) => sideBand(depthM, true))

  const insetLeft = (input.required.side ?? 0) * scale
  const insetRight = (input.required.side ?? 0) * scale
  const insetTop = (input.required.rear ?? 0) * scale
  const insetBottom = (input.required.front ?? 0) * scale

  const buildableRect = clampRect({
    x: plotRect.x + insetLeft,
    y: plotRect.y + insetTop,
    width: plotRect.width - insetLeft - insetRight,
    height: plotRect.height - insetTop - insetBottom,
  })

  return {
    viewBoxWidth: VIEW_W,
    viewBoxHeight: VIEW_H,
    roadRect,
    roadWidthKnown,
    plotRect,
    buildableRect,
    zones: { front, rear, left, right },
    isIllustrative,
    plotWidth,
    plotDepth,
    scale,
  }
}
