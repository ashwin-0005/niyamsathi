/**
 * App shell: owns the language choice and which of the two experiences is on
 * screen, and nothing else.
 *
 * Routing is a hash-synced view flag rather than a router dependency — there
 * are exactly two destinations, and keeping them in the hash means Back,
 * Forward and a pasted `#/check` link all behave, with no route table to fall
 * out of sync.
 */
import { useState } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import { useHashView } from './lib/hooks'
import type { Lang } from './lib/types'

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const [view, navigate, demoId] = useHashView()

  return view === 'dashboard' ? (
    <Dashboard
      lang={lang}
      onLangChange={setLang}
      onExit={() => navigate('landing')}
      initialScenarioId={demoId}
    />
  ) : (
    <LandingPage lang={lang} onLangChange={setLang} onStart={() => navigate('dashboard')} />
  )
}
