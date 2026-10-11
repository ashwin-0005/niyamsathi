import { useId, useState } from 'react'
// SVG `url(#id)` fill references don't need CSS-selector escaping, but
// useId()'s raw output contains colons — stripped here so the id is a plain
// token, avoiding any doubt across browsers/renderers.
import { Compass, Info, MousePointerClick } from 'lucide-react'
import type { PlotGeometry, ZoneId } from '../lib/geometry'
import { formatValue, pageLabel } from '../lib/engine'
import { ROAD_FACING_LABEL, bi, formatDate, t } from '../lib/i18n'
import type { Answer, Lang, PlotDetails, RoadFacing, Topic } from '../lib/types'

interface Props {
  lang: Lang
  /** Computed once by the caller (shared with the compliance-status calculation). */
  geometry: PlotGeometry
  roadWidth: number | null
  plotDetails: PlotDetails
  coreAnswers: Answer[]
  onFocusTopic: (topic: Topic) => void
}

const ZONE_TOPIC: Record<ZoneId, Topic> = {
  front: 'front_setback', rear: 'rear_setback', left: 'side_setback', right: 'side_setback',
}
const ZONE_LABEL_KEY: Record<ZoneId, 'zoneFront' | 'zoneRear' | 'zoneLeft' | 'zoneRight'> = {
  front: 'zoneFront', rear: 'zoneRear', left: 'zoneLeft', right: 'zoneRight',
}
/** Splits a message into two roughly-even lines at a word boundary, for SVG <tspan> wrapping. */
function wrapTwoLines(message: string): [string, string] {
  const words = message.split(' ')
  let mid = Math.ceil(words.length / 2)
  // Nudge the break to land near the midpoint character count, not just word count.
  const half = message.length / 2
  let best = mid
  let bestDiff = Infinity
  for (let i = 1; i < words.length; i++) {
    const len = words.slice(0, i).join(' ').length
    const diff = Math.abs(len - half)
    if (diff < bestDiff) { bestDiff = diff; best = i }
  }
  mid = best
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

const COMPASS_POINTS: { facing: RoadFacing; dx: number; dy: number }[] = [
  { facing: 'north', dx: 0, dy: -18 },
  { facing: 'south', dx: 0, dy: 18 },
  { facing: 'east', dx: 18, dy: 0 },
  { facing: 'west', dx: -18, dy: 0 },
]

export default function PlotComplianceMap({ lang, geometry, roadWidth, plotDetails, coreAnswers, onFocusTopic }: Props) {
  const hatchId = `hatch-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [pinnedZone, setPinnedZone] = useState<ZoneId | null>(null)
  const [hoverZone, setHoverZone] = useState<ZoneId | null>(null)
  const activeZone = pinnedZone ?? hoverZone

  const byTopic = new Map(coreAnswers.map((a) => [a.topic, a]))

  const handleZoneClick = (zone: ZoneId) => {
    setPinnedZone((cur) => (cur === zone ? null : zone))
    onFocusTopic(ZONE_TOPIC[zone])
  }
  const handleZoneEnter = (zone: ZoneId) => {
    setHoverZone(zone)
    if (!pinnedZone) onFocusTopic(ZONE_TOPIC[zone])
  }

  const zoneFill = (status: 'ok' | 'violation' | 'unknown' | 'not_applicable') =>
    status === 'unknown' ? `url(#${hatchId})` : '#fdba74'

  const detailAnswer = activeZone ? byTopic.get(ZONE_TOPIC[activeZone]) ?? null : null
  const detailZoneGeometry = activeZone ? geometry.zones[activeZone] : null

  return (
    <section className="card rise overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-5 py-4">
        <p className="text-sm font-semibold text-ink-900">{t('mapTitle', lang)}</p>
        {geometry.isIllustrative && (
          <span className="chip bg-amber-50 text-amber-800 ring-1 ring-amber-200">{t('mapIllustrative', lang)}</span>
        )}
      </div>

      <div className="p-5">
        <svg
          viewBox={`0 0 ${geometry.viewBoxWidth} ${geometry.viewBoxHeight}`}
          className="w-full"
          role="img"
          aria-label={t('mapTitle', lang)}
        >
          <defs>
            <pattern id={hatchId} width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#e2e8f0" />
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="2" />
            </pattern>
          </defs>

          {/* Road */}
          <rect {...geometry.roadRect} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1}
            strokeDasharray={geometry.roadWidthKnown ? undefined : '6 4'} />
          <text
            x={geometry.roadRect.x + geometry.roadRect.width / 2}
            y={geometry.roadRect.y + geometry.roadRect.height / 2 + 4}
            textAnchor="middle" fontSize="12" fill="#475569" fontWeight={600}
          >
            {t('roadLabel', lang)}{geometry.roadWidthKnown ? ` — ${roadWidth?.toFixed(1)} m` : ` (${t('mapRoadUnknown', lang)})`}
          </text>

          {/* Plot boundary */}
          <rect
            {...geometry.plotRect}
            fill={geometry.isIllustrative ? '#f8fafc' : '#ffffff'}
            stroke="#64748b"
            strokeWidth={2}
            strokeDasharray={geometry.isIllustrative ? '8 5' : undefined}
          />

          {/* Setback zones */}
          {(['front', 'rear', 'left', 'right'] as ZoneId[]).map((zone) => {
            const z = geometry.zones[zone]
            return (
              <g key={zone}>
                <rect
                  {...z.requiredRect}
                  fill={zoneFill(z.status)}
                  fillOpacity={0.8}
                  stroke={activeZone === zone ? '#9a3412' : 'none'}
                  strokeWidth={activeZone === zone ? 2 : 0}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onMouseEnter={() => handleZoneEnter(zone)}
                  onMouseLeave={() => setHoverZone(null)}
                  onClick={() => handleZoneClick(zone)}
                />
                {z.violationRect && (
                  <rect {...z.violationRect} fill="#fb7185" fillOpacity={0.85} className="pointer-events-none" />
                )}
                {z.requiredValue !== null && z.requiredRect.width > 18 && z.requiredRect.height > 14 && (
                  <text
                    x={z.requiredRect.x + z.requiredRect.width / 2}
                    y={z.requiredRect.y + z.requiredRect.height / 2 + 4}
                    textAnchor="middle" fontSize="11" fontWeight={600} fill="#7c2d12"
                    className="pointer-events-none numeric"
                  >
                    {z.requiredValue.toFixed(1)} m
                  </text>
                )}
              </g>
            )
          })}

          {/* Buildable footprint */}
          {geometry.buildableRect ? (
            <rect {...geometry.buildableRect} fill="#86efac" fillOpacity={0.55} stroke="#16a34a" strokeWidth={1.5} />
          ) : (
            <text
              x={geometry.plotRect.x + geometry.plotRect.width / 2}
              y={geometry.plotRect.y + geometry.plotRect.height / 2}
              textAnchor="middle" fontSize="11" fill="#b91c1c" fontWeight={600}
            >
              {wrapTwoLines(t('mapNoFootprint', lang)).map((line, i) => (
                <tspan key={i} x={geometry.plotRect.x + geometry.plotRect.width / 2} dy={i === 0 ? '-0.6em' : '1.3em'}>
                  {line}
                </tspan>
              ))}
            </text>
          )}

          {/* Plot dimension labels */}
          <text x={geometry.plotRect.x + geometry.plotRect.width / 2} y={geometry.plotRect.y - 10}
            textAnchor="middle" fontSize="12" fill="#1e2a4a" fontWeight={600} className="numeric">
            {geometry.plotWidth.toFixed(1)} m
          </text>
          <text
            x={geometry.plotRect.x - 14} y={geometry.plotRect.y + geometry.plotRect.height / 2}
            textAnchor="middle" fontSize="12" fill="#1e2a4a" fontWeight={600} className="numeric"
            transform={`rotate(-90 ${geometry.plotRect.x - 14} ${geometry.plotRect.y + geometry.plotRect.height / 2})`}
          >
            {geometry.plotDepth.toFixed(1)} m
          </text>

          {/* Compass badge */}
          <g transform={`translate(${geometry.viewBoxWidth - 48}, 48)`}>
            <circle r="26" fill="#ffffff" stroke="#c8d1e6" strokeWidth={1.5} />
            {COMPASS_POINTS.map((p) => (
              <text key={p.facing} x={p.dx} y={p.dy + 4} textAnchor="middle" fontSize="10"
                fontWeight={plotDetails.roadFacing === p.facing ? 800 : 500}
                fill={plotDetails.roadFacing === p.facing ? '#0b1223' : '#c8d1e6'}>
                {ROAD_FACING_LABEL[p.facing][lang].slice(0, 1)}
              </text>
            ))}
            <Compass className="pointer-events-none" x={-8} y={-8} width={16} height={16} color="#7083ad" />
          </g>
        </svg>

        {!plotDetails.roadFacing && (
          <p className="mt-1 text-right text-xs text-ink-400">{t('facingNotProvided', lang)}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-600">
          <span className="font-semibold uppercase tracking-wider text-ink-400">{t('legend', lang)}</span>
          <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded-sm bg-emerald-300" />{t('legendBuildable', lang)}</span>
          <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded-sm bg-orange-300" />{t('legendSetback', lang)}</span>
          <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded-sm bg-rose-400" />{t('legendViolation', lang)}</span>
          <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded-sm bg-slate-300" />{t('legendUnknown', lang)}</span>
        </div>

        <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50/60 p-4 text-sm">
          {!activeZone && (
            <p className="flex items-center gap-2 text-ink-400">
              <MousePointerClick className="h-4 w-4" /> {t('clickZoneHint', lang)}
            </p>
          )}
          {activeZone && detailAnswer && (
            <div>
              <p className="font-semibold text-ink-900">{t(ZONE_LABEL_KEY[activeZone], lang)}</p>
              {detailAnswer.status === 'matched' && detailAnswer.rule && detailAnswer.source && detailAnswer.version ? (
                <>
                  <p className="numeric mt-1 text-ink-800">
                    {t('required', lang)}: {formatValue(detailAnswer.rule.value, lang)}
                    {detailZoneGeometry?.proposedValue !== null && detailZoneGeometry?.proposedValue !== undefined && (
                      <> · {t('proposed', lang)}: {detailZoneGeometry.proposedValue.toFixed(1)} m</>
                    )}
                  </p>
                  <p className="numeric mt-1 text-xs text-ink-600">
                    {detailAnswer.source.ruleNumber} · {detailAnswer.source.tableNumber} · {t('page', lang)} {pageLabel(detailAnswer.source)}
                  </p>
                  <blockquote className="mt-2 border-l-2 border-ink-200 pl-3 text-xs italic leading-relaxed text-ink-600">
                    {bi(detailAnswer.source.excerpt, lang)}
                  </blockquote>
                  <p className="numeric mt-2 text-xs text-ink-400">
                    {bi(detailAnswer.version.shortLabel, lang)} · {t('effective', lang)} {formatDate(detailAnswer.version.effectiveDate, lang)}
                  </p>
                </>
              ) : (
                <p className="mt-1 flex items-center gap-2 text-ink-600">
                  <Info className="h-4 w-4 shrink-0" />
                  {detailAnswer.status === 'needs_input' ? t('needsInput', lang) : t('noRule', lang)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
