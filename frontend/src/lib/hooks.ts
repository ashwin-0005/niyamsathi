/**
 * Browser-capability hooks. Every one of these must survive server rendering:
 * `scripts/rendertest.tsx` runs the whole app through `renderToStaticMarkup`,
 * where `window`, `navigator` and `speechSynthesis` do not exist. So all
 * feature detection happens inside `useEffect` (never during render, never at
 * module scope) and the first paint always assumes "not supported / no motion
 * preference" — the safe, non-crashing default.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lang } from './types'

/* -------------------------------------------------------------------------
   Reduced motion
------------------------------------------------------------------------- */

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/* -------------------------------------------------------------------------
   Hash routing — two views, no router dependency
------------------------------------------------------------------------- */

export type View = 'landing' | 'dashboard'

const VIEW_HASH: Record<View, string> = { landing: '#/', dashboard: '#/check' }

function viewFromHash(hash: string): View {
  return hash.startsWith('#/check') ? 'dashboard' : 'landing'
}

/** Reads `#/check?demo=violation` — lets a demo be linked to directly. */
function demoFromHash(hash: string): string | null {
  const q = hash.indexOf('?')
  if (q === -1) return null
  return new URLSearchParams(hash.slice(q + 1)).get('demo')
}

/**
 * Keeps a two-value view in sync with the URL hash so Back/Forward and direct
 * links work, without pulling in a router. Server render always yields
 * 'landing'; the real hash is adopted on mount.
 */
export function useHashView(): [View, (v: View) => void, string | null] {
  const [view, setView] = useState<View>('landing')
  const [demoId, setDemoId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const read = () => {
      setView(viewFromHash(window.location.hash))
      setDemoId(demoFromHash(window.location.hash))
    }
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [])

  const navigate = useCallback((v: View) => {
    setView(v)
    if (typeof window !== 'undefined') {
      if (window.location.hash !== VIEW_HASH[v]) window.location.hash = VIEW_HASH[v]
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [])

  return [view, navigate, demoId]
}

/* -------------------------------------------------------------------------
   Speech recognition / synthesis (Web Speech API)
------------------------------------------------------------------------- */

interface SpeechRecognitionAlternativeLike { transcript: string }
interface SpeechRecognitionResultLike {
  readonly length: number
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternativeLike
}
interface SpeechRecognitionResultListLike {
  readonly length: number
  [index: number]: SpeechRecognitionResultLike
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: SpeechRecognitionResultListLike
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** BCP-47 tags the Indian English / Hindi voices are registered under. */
const SPEECH_LANG: Record<Lang, string> = { en: 'en-IN', hi: 'hi-IN' }

export interface VoiceInput {
  supported: boolean
  listening: boolean
  /** Live partial transcript while the user is still speaking. */
  interim: string
  error: string | null
  start: () => void
  stop: () => void
}

/**
 * Speech-to-text. `onFinal` fires once with the settled transcript so the
 * caller can drop it straight into the question box — recognition never
 * submits a query by itself, the clerk always confirms what was heard.
 */
export function useSpeechInput(lang: Lang, onFinal: (text: string) => void): VoiceInput {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  // Held in a ref so `start` never has to be rebuilt when the caller passes a
  // fresh closure on every render.
  const onFinalRef = useRef(onFinal)
  onFinalRef.current = onFinal

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null)
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
    setInterim('')
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setSupported(false)
      return
    }
    recognitionRef.current?.abort()

    const rec = new Ctor()
    rec.lang = SPEECH_LANG[lang]
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onresult = (e) => {
      let settled = ''
      let pending = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) settled += text
        else pending += text
      }
      setInterim(pending)
      if (settled.trim()) {
        setInterim('')
        onFinalRef.current(settled.trim())
      }
    }
    rec.onerror = (e) => {
      // "aborted" is what our own stop() produces — not a real fault.
      if (e.error !== 'aborted') setError(e.error ?? 'unknown')
      setListening(false)
    }
    rec.onend = () => {
      setListening(false)
      setInterim('')
    }

    setError(null)
    recognitionRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setError('start-failed')
      setListening(false)
    }
  }, [lang])

  useEffect(() => () => recognitionRef.current?.abort(), [])

  return { supported, listening, interim, error, start, stop }
}

export interface VoiceOutput {
  supported: boolean
  speaking: boolean
  speak: (text: string) => void
  cancel: () => void
}

/** Text-to-speech for the concise spoken summary. */
export function useSpeechOutput(lang: Lang): VoiceOutput {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = SPEECH_LANG[lang]
      utter.rate = lang === 'hi' ? 0.92 : 0.98
      utter.onend = () => setSpeaking(false)
      utter.onerror = () => setSpeaking(false)
      setSpeaking(true)
      window.speechSynthesis.speak(utter)
    },
    [lang],
  )

  // Leaving the page or switching language mid-sentence should not keep talking.
  useEffect(() => cancel, [cancel])

  return { supported, speaking, speak, cancel }
}
