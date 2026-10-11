/**
 * Isometric presentation of a plot, its mandatory open space, and the
 * buildable envelope.
 *
 * This is a *view*, not a second source of truth: every dimension is read back
 * out of the same `PlotGeometry` the flat plan view uses, converted from
 * pixels to metres via `geometry.scale`. The 3D and 2D views therefore cannot
 * drift apart — if a setback changes, both change together.
 *
 * Projection is a true 30° isometric:
 *     screenX = (x - y) · cos30
 *     screenY = (x + y) · sin30 - z
 * with x running left→right across the frontage, y running rear→front, and z
 * up. Under this projection the +x and +y faces of a box face the viewer, so a
 * building is drawn as exactly three visible faces (roof, right wall, front
 * wall) — cheap, crisp, and resolution-independent.
 */
import { useId, useRef, useState } from 'react'
import type { PlotGeometry } from '../lib/geometry'
import { usePrefersReducedMotion } from '../lib/hooks'
import { t } from '../lib/i18n'
import type { Lang } from '../lib/types'

const COS30 = Math.cos(Math.PI / 6)
const SIN30 = 0.5
const FLOOR_HEIGHT_M = 3

type Pt = [number, number]

function iso(x: number, y: number, z: number): Pt {
  return [(x - y) * COS30, (x + y) * SIN30 - z]
}

const poly = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')

/** A flat ground-level rectangle in plot metres → an isometric quad. */
function pad(x0: number, y0: number, x1: number, y1: number, z = 0): Pt[] {
  return [iso(x0, y0, z), iso(x1, y0, z), iso(x1, y1, z), iso(x0, y1, z)]
}

/** Metre-space description recovered from the pixel geometry. */
interface Metres {
  plotWidth: number
  plotDepth: number
  roadWidth: number
  front: number
  rear: number
  left: number
  right: number
  proposedFront: number | null
  buildable: { x0: number; y0: number; x1: number; y1: number } | null
}

function toMetres(g: PlotGeometry): Metres {
  const front = g.zones.front.requiredValue ?? 0
  const rear = g.zones.rear.requiredValue ?? 0
  const left = g.zones.left.requiredValue ?? 0
  const right = g.zones.right.requiredValue ?? 0
  const x0 = left
  const y0 = rear
  const x1 = g.plotWidth - right
  const y1 = g.plotDepth - front
  return {
    plotWidth: g.plotWidth,
    plotDepth: g.plotDepth,
    roadWidth: g.roadRect.height / g.scale,
    front,
    rear,
    left,
    right,
    proposedFront: g.zones.front.proposedValue,
    buildable: g.buildableRect && x1 > x0 && y1 > y0 ? { x0, y0, x1, y1 } : null,
  }
}

interface Props {
  geometry: PlotGeometry
  /** Storeys to extrude the envelope by; 0 draws the pad with no building. */
  floors: number
  lang: Lang
  showDimensions?: boolean
  /** Gentle cursor parallax — disabled automatically under reduced motion. */
  parallax?: boolean
  className?: string
}

export default function IsometricPlotScene({
  geometry,
  floors,
  lang,
  showDimensions = true,
  parallax = true,
  className = '',
}: Props) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const reducedMotion = usePrefersReducedMotion()
  const [tilt, setTilt] = useState<Pt>([0, 0])
  const frameRef = useRef<HTMLDivElement | null>(null)

  const m = toMetres(geometry)
  const hasViolation = Object.values(geometry.zones).some((z) => z.violationRect !== null)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!parallax || reducedMotion || !frameRef.current) return
    const r = frameRef.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    setTilt([nx, ny])
  }
  const onLeave = () => setTilt([0, 0])

  // ---- geometry in iso space ---------------------------------------------
  const plotQuad = pad(0, 0, m.plotWidth, m.plotDepth)
  const roadQuad = pad(-1.5, m.plotDepth, m.plotWidth + 1.5, m.plotDepth + m.roadWidth)

  const bands: { key: string; pts: Pt[] }[] = []
  if (m.rear > 0) bands.push({ key: 'rear', pts: pad(0, 0, m.plotWidth, m.rear) })
  if (m.front > 0) bands.push({ key: 'front', pts: pad(0, m.plotDepth - m.front, m.plotWidth, m.plotDepth) })
  if (m.left > 0) bands.push({ key: 'left', pts: pad(0, m.rear, m.left, m.plotDepth - m.front) })
  if (m.right > 0) {
    bands.push({ key: 'right', pts: pad(m.plotWidth - m.right, m.rear, m.plotWidth, m.plotDepth - m.front) })
  }

  // The encroachment strip: from the proposed line inward to the required
  // line, i.e. the slice of mandatory open space the proposal would cover.
  const violationQuad =
    m.proposedFront !== null && m.front > 0 && m.proposedFront < m.front
      ? pad(0, m.plotDepth - m.front, m.plotWidth, m.plotDepth - m.proposedFront)
      : null

  const h = Math.max(0, floors) * FLOOR_HEIGHT_M
  const b = m.buildable
  const building =
    b && h > 0
      ? {
          roof: [iso(b.x0, b.y0, h), iso(b.x1, b.y0, h), iso(b.x1, b.y1, h), iso(b.x0, b.y1, h)] as Pt[],
          // +x face (right wall) and +y face (front wall) are the two the
          // viewer can see under this projection.
          rightWall: [iso(b.x1, b.y0, 0), iso(b.x1, b.y1, 0), iso(b.x1, b.y1, h), iso(b.x1, b.y0, h)] as Pt[],
          frontWall: [iso(b.x0, b.y1, 0), iso(b.x1, b.y1, 0), iso(b.x1, b.y1, h), iso(b.x0, b.y1, h)] as Pt[],
          floorLines: Array.from({ length: Math.max(0, Math.round(floors) - 1) }, (_, i) => {
            const z = (i + 1) * FLOOR_HEIGHT_M
            return {
              right: [iso(b.x1, b.y0, z), iso(b.x1, b.y1, z)] as [Pt, Pt],
              front: [iso(b.x0, b.y1, z), iso(b.x1, b.y1, z)] as [Pt, Pt],
            }
          }),
        }
      : null

  // ---- auto-fit viewBox over everything actually drawn --------------------
  const all: Pt[] = [...plotQuad, ...roadQuad]
  if (building) all.push(...building.roof)
  if (showDimensions) {
    all.push(iso(-3.2, 0, 0), iso(-3.2, m.plotDepth, 0), iso(0, -3.2, 0), iso(m.plotWidth, -3.2, 0))
  }
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  const padPx = 2.4
  const minX = Math.min(...xs) - padPx
  const minY = Math.min(...ys) - padPx
  const vbW = Math.max(...xs) - minX + padPx
  const vbH = Math.max(...ys) - minY + padPx

  // Parallax is applied in viewBox units so it scales with the drawing.
  const shift = reducedMotion || !parallax ? [0, 0] : [tilt[0] * vbW * 0.025, tilt[1] * vbH * 0.025]

  const dimLabel = (value: number) => `${value.toFixed(1)} m`

  return (
    <div
      ref={frameRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ touchAction: 'pan-y' }}
    >
      <svg
        viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
        className="h-full w-full overflow-visible"
        role="img"
        aria-label={t('mapIsoView', lang)}
      >
        <defs>
          <linearGradient id={`roof-${gid}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#e8eef9" />
            <stop offset="100%" stopColor="#b8c6dd" />
          </linearGradient>
          <linearGradient id={`wallR-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7e8ca6" />
            <stop offset="100%" stopColor="#5a6578" />
          </linearGradient>
          <linearGradient id={`wallF-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5d6a81" />
            <stop offset="100%" stopColor="#3e4859" />
          </linearGradient>
          <linearGradient id={`build-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#12a37a" stopOpacity="0.3" />
          </linearGradient>
          <filter id={`soft-${gid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.55" />
          </filter>
        </defs>

        <g
          transform={`translate(${shift[0].toFixed(3)} ${shift[1].toFixed(3)})`}
          style={{ transition: reducedMotion ? 'none' : 'transform 0.35s cubic-bezier(0.16,1,0.3,1)' }}
        >
          {/* Ground shadow */}
          <polygon
            points={poly(pad(-0.6, -0.6, m.plotWidth + 0.6, m.plotDepth + 0.6))}
            fill="#000000"
            opacity="0.5"
            filter={`url(#soft-${gid})`}
          />

          {/* Road */}
          <polygon points={poly(roadQuad)} fill="#1b2231" stroke="#2b3647" strokeWidth="0.1" />
          <polyline
            points={poly([
              iso(0.6, m.plotDepth + m.roadWidth / 2, 0),
              iso(m.plotWidth - 0.6, m.plotDepth + m.roadWidth / 2, 0),
            ])}
            fill="none"
            stroke="#50607a"
            strokeWidth="0.09"
            strokeDasharray="0.8 0.7"
          />

          {/* Plot pad */}
          <polygon points={poly(plotQuad)} fill="#121a27" stroke="#36435a" strokeWidth="0.11" />

          {/* Mandatory open space */}
          {bands.map((band) => (
            <polygon key={band.key} points={poly(band.pts)} fill="#f0ab45" fillOpacity="0.26" />
          ))}

          {/* Encroachment */}
          {violationQuad && (
            <polygon
              points={poly(violationQuad)}
              fill="#f2616d"
              fillOpacity="0.55"
              className={reducedMotion ? undefined : 'bad-pulse'}
            />
          )}

          {/* Buildable pad */}
          {b && (
            <polygon
              points={poly(pad(b.x0, b.y0, b.x1, b.y1))}
              fill={`url(#build-${gid})`}
              stroke="#34d399"
              strokeWidth="0.09"
            />
          )}

          {/* Building envelope */}
          {building && (
            <g>
              <polygon points={poly(building.frontWall)} fill={`url(#wallF-${gid})`} />
              <polygon points={poly(building.rightWall)} fill={`url(#wallR-${gid})`} />
              <polygon points={poly(building.roof)} fill={`url(#roof-${gid})`} stroke="#dbe4f2" strokeWidth="0.05" />
              {building.floorLines.map((fl, i) => (
                <g key={i} stroke="#0b0f18" strokeOpacity="0.35" strokeWidth="0.05">
                  <line x1={fl.right[0][0]} y1={fl.right[0][1]} x2={fl.right[1][0]} y2={fl.right[1][1]} />
                  <line x1={fl.front[0][0]} y1={fl.front[0][1]} x2={fl.front[1][0]} y2={fl.front[1][1]} />
                </g>
              ))}
            </g>
          )}

          {/* Dimension lines */}
          {showDimensions && (
            <g stroke="#64718a" strokeWidth="0.055" fill="none">
              <polyline points={poly([iso(-1.6, 0, 0), iso(-1.6, m.plotDepth, 0)])} />
              <polyline points={poly([iso(0, -1.6, 0), iso(m.plotWidth, -1.6, 0)])} />
              <g
                fill="#9aa8c0"
                stroke="none"
                fontSize="1.15"
                fontWeight="600"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                <text
                  x={iso(-2.5, m.plotDepth / 2, 0)[0]}
                  y={iso(-2.5, m.plotDepth / 2, 0)[1]}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {dimLabel(m.plotDepth)}
                </text>
                <text
                  x={iso(m.plotWidth / 2, -2.5, 0)[0]}
                  y={iso(m.plotWidth / 2, -2.5, 0)[1]}
                  textAnchor="start"
                  dominantBaseline="middle"
                >
                  {dimLabel(m.plotWidth)}
                </text>
                <text
                  x={iso(m.plotWidth / 2, m.plotDepth + m.roadWidth / 2, 0)[0]}
                  y={iso(m.plotWidth / 2, m.plotDepth + m.roadWidth / 2, 0)[1]}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#64718a"
                  fontSize="1.05"
                >
                  {t('roadLabel', lang)} {dimLabel(m.roadWidth)}
                </text>
              </g>
            </g>
          )}
        </g>
      </svg>

      {hasViolation && <span className="sr-only">{t('legendViolation', lang)}</span>}
    </div>
  )
}
