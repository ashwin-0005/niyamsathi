/**
 * One-click presets that load a complete query and run it immediately.
 *
 * Each scenario is chosen to expose a different branch of the engine — a
 * clean match, an amendment override, a detected violation, and a deliberately
 * incomplete query — so a reviewer can see the "ask, don't guess" behaviour
 * without having to invent inputs.
 */
import { PlayCircle } from 'lucide-react'
import { DEMO_SCENARIOS, type DemoScenario } from '../lib/demoScenarios'
import { bi, t } from '../lib/i18n'
import type { Lang } from '../lib/types'

interface Props {
  lang: Lang
  onLoad: (scenario: DemoScenario) => void
  activeId?: string | null
}

export default function DemoScenarioSelector({ lang, onLoad, activeId = null }: Props) {
  return (
    <section className="panel no-print p-4">
      <p className="label mb-2.5">
        <PlayCircle className="mr-1 inline h-3 w-3" aria-hidden="true" />
        {t('demoTitle', lang)}
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_SCENARIOS.map((scenario) => {
          const active = scenario.id === activeId
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onLoad(scenario)}
              aria-pressed={active}
              className={
                active
                  ? 'focus-ring rounded-xl border border-teal/50 bg-teal/10 p-3 text-left transition'
                  : 'focus-ring rounded-xl border border-line bg-white/[0.02] p-3 text-left transition hover:border-chrome-deep hover:bg-white/[0.05]'
              }
            >
              <p className={active ? 'text-xs font-bold text-teal' : 'text-xs font-bold text-paper'}>
                {bi(scenario.title, lang)}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-faint">{bi(scenario.description, lang)}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
