import { PlayCircle } from 'lucide-react'
import { DEMO_SCENARIOS, type DemoScenario } from '../lib/demoScenarios'
import { bi, t } from '../lib/i18n'
import type { Lang } from '../lib/types'

interface Props {
  lang: Lang
  onLoad: (scenario: DemoScenario) => void
}

export default function DemoScenarioSelector({ lang, onLoad }: Props) {
  return (
    <section className="card no-print p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <PlayCircle className="h-4 w-4 text-ink-400" />
        {t('demoTitle', lang)}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onLoad(scenario)}
            className="focus-ring rounded-xl border border-ink-200 bg-white p-3 text-left transition hover:border-ink-400 hover:shadow-sm"
          >
            <p className="text-sm font-semibold text-ink-900">{bi(scenario.title, lang)}</p>
            <p className="mt-1 text-xs text-ink-500">{bi(scenario.description, lang)}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
