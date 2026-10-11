/**
 * Microphone + speaker affordances for the question box.
 *
 * Deliberately a small control strip rather than a conversational surface:
 * voice is an input convenience here, not the product. Two rules hold it to
 * that: recognised speech is always shown as editable text before anything is
 * searched (the clerk confirms what was heard — it is never auto-submitted),
 * and the spoken reply carries only the headline figure and rule number while
 * the full citation stays on screen where it can be read and checked.
 */
import { Loader2, Mic, MicOff, Square, Volume2, VolumeX } from 'lucide-react'
import { t } from '../lib/i18n'
import type { Lang } from '../lib/types'
import type { VoiceInput, VoiceOutput } from '../lib/hooks'

interface Props {
  lang: Lang
  input: VoiceInput
  output: VoiceOutput
  /** Concise sentence to read aloud; null hides the speaker button. */
  spokenSummary: string | null
}

export default function VoiceAssistantControl({ lang, input, output, spokenSummary }: Props) {
  const { supported, listening, interim, error, start, stop } = input

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={listening ? stop : start}
          disabled={!supported}
          aria-pressed={listening}
          aria-label={listening ? t('stopListening', lang) : t('askByVoice', lang)}
          className={
            listening
              ? 'focus-ring relative inline-flex items-center gap-2 rounded-xl border border-bad/40 bg-bad/15 px-3 py-2 text-sm font-semibold text-bad'
              : 'btn btn-ghost px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40'
          }
        >
          {listening ? (
            <>
              <span className="relative grid h-4 w-4 place-items-center">
                <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                <span className="listen-ring absolute inset-0 rounded-full ring-2 ring-bad" aria-hidden="true" />
              </span>
              {t('listening', lang)}
            </>
          ) : (
            <>
              {supported ? <Mic className="h-4 w-4" aria-hidden="true" /> : <MicOff className="h-4 w-4" aria-hidden="true" />}
              {t('askByVoice', lang)}
            </>
          )}
        </button>

        {/* Listening waveform — presentational only. */}
        {listening && (
          <span className="flex h-6 items-end gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="wave-bar w-0.5 rounded-full bg-bad"
                style={{ height: '100%', animationDelay: `${i * 110}ms` }}
              />
            ))}
          </span>
        )}

        {spokenSummary && output.supported && (
          <button
            type="button"
            onClick={() => (output.speaking ? output.cancel() : output.speak(spokenSummary))}
            aria-pressed={output.speaking}
            aria-label={output.speaking ? t('stopSpeaking', lang) : t('speakAnswer', lang)}
            className="btn btn-ghost px-3 py-2 text-sm"
          >
            {output.speaking ? (
              <>
                <VolumeX className="h-4 w-4" aria-hidden="true" /> {t('stopSpeaking', lang)}
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" aria-hidden="true" /> {t('speakAnswer', lang)}
              </>
            )}
          </button>
        )}

        {output.speaking && (
          <span className="inline-flex items-center gap-1.5 text-xs text-teal" role="status">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            {t('speaking', lang)}
          </span>
        )}
      </div>

      {listening && interim && (
        <p className="panel-inset px-3 py-2 text-sm text-muted" role="status">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
            {t('voiceHeard', lang)}:{' '}
          </span>
          {interim}
        </p>
      )}

      {!supported && (
        <p className="text-xs text-faint">{t('voiceUnsupported', lang)}</p>
      )}

      {error && !listening && (
        <p className="text-xs text-warn" role="status">{t('voiceError', lang)}</p>
      )}
    </div>
  )
}
