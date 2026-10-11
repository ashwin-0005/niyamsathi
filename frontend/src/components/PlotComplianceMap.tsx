/**
 * The visual centrepiece: a plot drawn to scale with its mandatory open space,
 * buildable envelope, and any encroachment by the proposed plan.
 *
 * Two presentations of one truth. The flat plan view is the authoritative,
 * hit-testable one — each setback band is a click target that surfaces the
 * rule behind it. The isometric view is the same `PlotGeometry` rendered as a
 * massing model. Both consume geometry computed once by the caller, so a
 * dimension change moves them in lockstep.
 */
import { useEffect, useId, useState } from 'react'
import {
  Box, Compass, Expand, Info, Maximize2, MousePointerClick, Quote, Ruler, RotateCcw, Square, X,
} from 'lucide-react'
import IsometricPlotScene from './IsometricPlotScene'
import type { PlotGeometry, ZoneId } from '../lib/geometry'
import { formatValue, pageLabel } from '../lib/engine'
import { ROAD_FACING_LABEL, bi, formatDate, t } from '../lib/i18n'
import type { Answer, Lang, PlotDetails, RoadFacing, Topic } from '../lib/types'

interface Props {
  lang: Lang
  geometry: PlotGeometry
  roadWidth: number | null
  plotDetails: PlotDetails
  coreAnswers: Answer[]
  proposedFloors: number | null
  onFocusTopic: (topic: Topic) => void
}

const ZONE_TOPIC: Record<ZoneId, Topic> = {
  front: 'front_setback', rear: 'rear_setback', left: 'side_setback', right: 'side_setback',
}
const ZONE_LABEL_KEY = {
  front: 'zoneFront', rear: 'zoneRear', left: 'zoneLeft', right: 'zoneRight',
} as const
const ZONE_IDS: ZoneId[] = ['front', 'rear', 'left', 'right']

const COMPASS_POINTS: { facing: RoadFacing; dx: number; dy: number }[] = [
  { facing: 'north', dx: 0, dy: -17 },
  { facing: 'south', dx: 0, dy: 17 },
  { facing: 'east', dx: 17, dy: 0 },
  { facing: 'west', dx: -17, dy: 0 },
]

/** Splits a sentence into two balanced lines for SVG <tspan> wrapping. */
function wrapTwoLines(message: string): [string, string] {
  const words = message.split(' ')
  if (words.length < 2) return [message, '']
  const half = message.length / 2
  let best = 1
  let bestDiff = Infinity
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(' ').length - half)
    if (diff < bestDiff) { bestDiff = diff; best = i }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}

export default function PlotComplianceMap({
  lang, geometry, roadWidth, plotDetails, coreAnswers, proposedFloors, onFocusTopic,
}: Props) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [mode, setMode] = useState<'plan' | 'iso'>('plan')
  const [showDimensions, setShowDimensions] = useState(true)
  const [showCitations, setShowCitations] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [pinnedZone, setPinnedZone] = useState<ZoneId | null>(null)
  const [hoverZone, setHoverZone] = useState<ZoneId | null>(null)

  const activeZone = pinnedZone ?? hoverZone
  const byTopic = new Map(coreAnswers.map((a) => [a.topic, a]))

  // Escape closes the expanded map — a modal that traps the user is worse
  // than no modal at all.
  useEffect(() => {
    if (!expanded || typeof window === 'undefined') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  const resetView = () => {
    setMode('plan')
    setShowDimensions(true)
    setShowCitations(true)
    setPinnedZone(null)
    setHoverZone(null)
  }

  const handleZoneClick = (zone: ZoneId) => {
    setPinnedZone((cur) => (cur === zone ? null : zone))
    onFocusTopic(ZONE_TOPIC[zone])
  }
  const handleZoneEnter = (zone: ZoneId) => {
    setHoverZone(zone)
    if (!pinnedZone) onFocusTopic(ZONE_TOPIC[zone])
  }

  const detailAnswer = activeZone ? byTopic.get(ZONE_TOPIC[activeZone]) ?? null : null
  const detailZone = activeZone ? geometry.zones[activeZone] : null

  const planSvg = (
    <svg
      viewBox={`0 0 ${geometry.viewBoxWidth} ${geometry.viewBoxHeight}`}
      className="geo-animate h-full w-full"
      role="img"
      aria-label={t('mapTitle', lang)}
    >
      <defs>
        <pattern id={`hatch-${gid}`} width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#1b2332" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#3a455c" strokeWidth="2.5" />
        </pattern>
        <linearGradient id={`plot-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141b28" />
          <stop offset="100%" stopColor="#0d131e" />
        </linearGradient>
        <linearGradient id={`green-${gid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0f9b74" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* Road */}
      <rect
        {...geometry.roadRect}
        fill="#161d2b"
        stroke="#2b3647"
        strokeWidth={1}
        strokeDasharray={geometry.roadWidthKnown ? undefined : '7 5'}
      />
      <line
        x1={geometry.roadRect.x + 10}
        y1={geometry.roadRect.y + geometry.roadRect.height / 2}
        x2={geometry.roadRect.x + geometry.roadRect.width - 10}
        y2={geometry.roadRect.y + geometry.roadRect.height / 2}
        stroke="#49566e"
        strokeWidth={1.5}
        strokeDasharray="12 9"
      />
      <text
        x={geometry.roadRect.x + geometry.roadRect.width / 2}
        y={geometry.roadRect.y + geometry.roadRect.height / 2 - 7}
        textAnchor="middle" fontSize="11" fill="#9aa8c0" fontWeight={600}
      >
        {t('roadLabel', lang)}
        {geometry.roadWidthKnown ? ` — ${roadWidth?.toFixed(1)} m` : ` · ${t('mapRoadUnknown', lang)}`}
      </text>

      {/* Plot boundary */}
      <rect
        {...geometry.plotRect}
        fill={`url(#plot-${gid})`}
        stroke={geometry.isIllustrative ? '#5c6880' : '#8f9cb3'}
        strokeWidth={2}
        strokeDasharray={geometry.isIllustrative ? '9 6' : undefined}
      />

      {/* Setback bands */}
      {ZONE_IDS.map((zone) => {
        const z = geometry.zones[zone]
        const isActive = activeZone === zone
        return (
          <g key={zone}>
            <rect
              {...z.requiredRect}
              fill={z.status === 'unknown' ? `url(#hatch-${gid})` : '#f0ab45'}
              fillOpacity={z.status === 'unknown' ? 1 : isActive ? 0.42 : 0.26}
              stroke={isActive ? '#f0ab45' : 'none'}
              strokeWidth={isActive ? 2 : 0}
              className="zone-hit"
              role="button"
              tabIndex={0}
              aria-label={`${t(ZONE_LABEL_KEY[zone], lang)}${z.requiredValue !== null ? `, ${t('required', lang)} ${z.requiredValue} m` : ''}`}
              onMouseEnter={() => handleZoneEnter(zone)}
              onMouseLeave={() => setHoverZone(null)}
              onFocus={() => handleZoneEnter(zone)}
              onBlur={() => setHoverZone(null)}
              onClick={() => handleZoneClick(zone)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneClick(zone) }
              }}
            />
            {z.violationRect && (
              <rect {...z.violationRect} fill="#f2616d" fillOpacity={0.6} className="bad-pulse pointer-events-none" />
            )}
            {showDimensions && z.requiredValue !== null && z.requiredRect.width > 20 && z.requiredRect.height > 15 && (
              <text
                x={z.requiredRect.x + z.requiredRect.width / 2}
                y={z.requiredRect.y + z.requiredRect.height / 2 + 4}
                textAnchor="middle" fontSize="11" fontWeight={700} fill="#f7d6a4"
                className="numeric pointer-events-none"
              >
                {z.requiredValue.toFixed(1)} m
              </text>
            )}
          </g>
        )
      })}

      {/* Buildable envelope */}
      {geometry.buildableRect ? (
        <>
          <rect {...geometry.buildableRect} fill={`url(#green-${gid})`} stroke="#34d399" strokeWidth={1.5} />
          {showDimensions && geometry.buildableRect.height > 34 && (
            <text
              x={geometry.buildableRect.x + geometry.buildableRect.width / 2}
              y={geometry.buildableRect.y + geometry.buildableRect.height / 2 + 4}
              textAnchor="middle" fontSize="11" fontWeight={600} fill="#7ee7bd"
              className="pointer-events-none"
            >
              {t('legendBuildable', lang)}
            </text>
          )}
        </>
      ) : (
        <text
          x={geometry.plotRect.x + geometry.plotRect.width / 2}
          y={geometry.plotRect.y + geometry.plotRect.height / 2}
          textAnchor="middle" fontSize="11" fill="#f2616d" fontWeight={600}
        >
          {wrapTwoLines(t('mapNoFootprint', lang)).map((line, i) => (
            <tspan key={i} x={geometry.plotRect.x + geometry.plotRect.width / 2} dy={i === 0 ? '-0.6em' : '1.35em'}>
              {line}
            </tspan>
          ))}
        </text>
      )}

      {/* Plot dimensions */}
      {showDimensions && (
        <g className="numeric" fill="#cfd9e8" fontSize="12" fontWeight={700}>
          <text x={geometry.plotRect.x + geometry.plotRect.width / 2} y={geometry.plotRect.y - 12} textAnchor="middle">
            {geometry.plotWidth.toFixed(1)} m
          </text>
          <text
            x={geometry.plotRect.x - 16}
            y={geometry.plotRect.y + geometry.plotRect.height / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${geometry.plotRect.x - 16} ${geometry.plotRect.y + geometry.plotRect.height / 2})`}
          >
            {geometry.plotDepth.toFixed(1)} m
          </text>
        </g>
      )}

      {/* Compass */}
      <g transform={`translate(${geometry.viewBoxWidth - 46}, 46)`} aria-hidden="true">
        <circle r="25" fill="#10151f" stroke="#232c3d" strokeWidth={1.5} />
        {COMPASS_POINTS.map((p) => {
          const on = plotDetails.roadFacing === p.facing
          return (
            <text
              key={p.facing} x={p.dx} y={p.dy + 4} textAnchor="middle" fontSize="10"
              fontWeight={on ? 800 : 500} fill={on ? '#2fd3bb' : '#44506580'}
            >
              {ROAD_FACING_LABEL[p.facing].en.slice(0, 1)}
            </text>
          )
        })}
        <Compass x={-7} y={-7} width={14} height={14} color="#5c6880" />
      </g>
    </svg>
  )

  const body = (
    <>
      <div className={expanded ? 'h-[min(70vh,640px)]' : 'aspect-[8/7] w-full'}>
        {mode === 'plan' ? (
          planSvg
        ) : (
          <IsometricPlotScene
            geometry={geometry}
            floors={proposedFloors ?? 2}
            lang={lang}
            showDimensions={showDimensions}
            className="h-full w-full"
          />
        )}
      </div>

      {geometry.isIllustrative && (
        <p className="tint-warn mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t('mapIllustrative', lang)}
        </p>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">{t('legend', lang)}</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-ok" aria-hidden="true" />{t('legendBuildable', lang)}</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-saffron" aria-hidden="true" />{t('legendSetback', lang)}</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-bad" aria-hidden="true" />{t('legendViolation', lang)}</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-raised" aria-hidden="true" />{t('legendUnknown', lang)}</span>
      </div>

      {/* Zone citation readout */}
      {showCitations && (
        <div className="panel-inset mt-3 p-4 text-sm">
          {!activeZone && (
            <p className="flex items-center gap-2 text-faint">
              <MousePointerClick className="h-4 w-4" aria-hidden="true" /> {t('clickZoneHint', lang)}
            </p>
          )}
          {activeZone && detailAnswer && (
            <div className="fade-in">
              <p className="font-semibold text-paper">{t(ZONE_LABEL_KEY[activeZone], lang)}</p>
              {detailAnswer.status === 'matched' && detailAnswer.rule && detailAnswer.source && detailAnswer.version ? (
                <>
                  <p className="numeric mt-1 text-muted">
                    <span className="display metal text-2xl font-bold">
                      {formatValue(detailAnswer.rule.value, lang)}
                    </span>
                    <span className="ml-2 text-xs text-faint">{t('required', lang)}</span>
                    {detailZone?.proposedValue != null && (
                      <span className={detailZone.violationRect ? 'ml-3 text-bad' : 'ml-3 text-ok'}>
                        {t('proposed', lang)} {detailZone.proposedValue.toFixed(1)} m
                      </span>
                    )}
                  </p>
                  <p className="numeric mt-1.5 text-xs">
                    <span className="font-semibold text-teal">{detailAnswer.source.ruleNumber}</span>
                    <span className="text-ghost"> · </span>
                    <span className="font-semibold text-teal">{detailAnswer.source.tableNumber}</span>
                    <span className="text-ghost"> · </span>
                    <span className="text-muted">{t('page', lang)} {pageLabel(detailAnswer.source)}</span>
                  </p>
                  <blockquote className="mt-2 border-l-2 border-teal/50 pl-3 text-xs italic leading-relaxed text-muted">
                    {bi(detailAnswer.source.excerpt, lang)}
                  </blockquote>
                  <p className="numeric mt-2 text-[11px] text-faint">
                    {bi(detailAnswer.version.shortLabel, lang)} · {t('effective', lang)}{' '}
                    {formatDate(detailAnswer.version.effectiveDate, lang)}
                  </p>
                </>
              ) : (
                <p className="mt-1 flex items-center gap-2 text-muted">
                  <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {detailAnswer.status === 'needs_input' ? t('needsInput', lang) : t('noRule', lang)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )

  const controls = (
    <div className="flex items-center gap-1.5">
      <div className="mr-1 flex rounded-lg border border-line p-0.5" role="group" aria-label={t('mapViewMode', lang)}>
        {([['plan', Square], ['iso', Box]] as const).map(([m, Icon]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            aria-label={m === 'plan' ? t('mapPlanView', lang) : t('mapIsoView', lang)}
            title={m === 'plan' ? t('mapPlanView', lang) : t('mapIsoView', lang)}
            className={
              mode === m
                ? 'focus-ring inline-flex items-center gap-1.5 rounded-md bg-teal px-2.5 py-1 text-xs font-semibold text-teal-ink'
                : 'focus-ring inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted transition hover:text-paper'
            }
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {m === 'plan' ? t('mapPlanView', lang) : t('mapIsoView', lang)}
          </button>
        ))}
      </div>

      <button
        type="button" onClick={() => setShowDimensions((v) => !v)} aria-pressed={showDimensions}
        className="btn-icon focus-ring" title={t('mapToggleDimensions', lang)} aria-label={t('mapToggleDimensions', lang)}
      >
        <Ruler className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button" onClick={() => setShowCitations((v) => !v)} aria-pressed={showCitations}
        className="btn-icon focus-ring" title={t('mapToggleCitations', lang)} aria-label={t('mapToggleCitations', lang)}
      >
        <Quote className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button" onClick={resetView}
        className="btn-icon focus-ring" title={t('mapResetView', lang)} aria-label={t('mapResetView', lang)}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button" onClick={() => setExpanded((v) => !v)} aria-pressed={expanded}
        className="btn-icon focus-ring"
        title={expanded ? t('mapExitFullscreen', lang) : t('mapFullscreen', lang)}
        aria-label={expanded ? t('mapExitFullscreen', lang) : t('mapFullscreen', lang)}
      >
        {expanded ? <Maximize2 className="h-4 w-4" aria-hidden="true" /> : <Expand className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  )

  return (
    <>
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <p className="display text-sm font-bold text-paper">{t('mapTitle', lang)}</p>
          <div className="no-print">{controls}</div>
        </div>
        <div className="p-5">{body}</div>
      </section>

      {expanded && (
        <div
          className="no-print fixed inset-0 z-50 overflow-y-auto bg-void/85 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={t('mapTitle', lang)}
        >
          <div className="panel mx-auto max-w-5xl overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <p className="display text-sm font-bold text-paper">{t('mapTitle', lang)}</p>
              <div className="flex items-center gap-1.5">
                {controls}
                <button
                  type="button" onClick={() => setExpanded(false)}
                  className="btn-icon focus-ring" aria-label={t('mapExitFullscreen', lang)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="p-5">{body}</div>
          </div>
        </div>
      )}
    </>
  )
}
