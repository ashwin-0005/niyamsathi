/**
 * The expandable "show me the actual rule text" drawer.
 *
 * Split out of the result card because it is the trust anchor of the whole
 * product: it is the one place that reproduces source wording verbatim, and it
 * must always label demo text as demo text. Keeping it standalone means the
 * placeholder warning can never be accidentally dropped by a card redesign.
 */
import { useState } from 'react'
import { ChevronDown, FileText, ShieldAlert } from 'lucide-react'
import { pageLabel } from '../lib/engine'
import { bi, formatDate, t } from '../lib/i18n'
import type { Lang, Source, Version } from '../lib/types'

interface Props {
  source: Source
  version: Version
  lang: Lang
  /** Rendered open and non-collapsible (used by the printable slip). */
  alwaysOpen?: boolean
}

export default function CitationDrawer({ source, version, lang, alwaysOpen = false }: Props) {
  const [open, setOpen] = useState(false)
  const shown = alwaysOpen || open

  return (
    <div>
      {!alwaysOpen && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="focus-ring no-print inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-chrome-deep hover:text-paper"
        >
          <FileText className="h-3.5 w-3.5" />
          {open ? t('hideExcerpt', lang) : t('openExcerpt', lang)}
          <ChevronDown className={open ? 'h-3.5 w-3.5 rotate-180 transition-transform' : 'h-3.5 w-3.5 transition-transform'} />
        </button>
      )}

      {shown && (
        <div className={alwaysOpen ? '' : 'fade-in mt-3 panel-inset p-4'}>
          <p className="numeric text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
            {t('exactWording', lang)} — {source.ruleNumber}, {source.tableNumber}, {t('page', lang)} {pageLabel(source)}
          </p>
          <p className="mt-1 text-sm font-semibold text-paper">{bi(source.ruleTitle, lang)}</p>

          {source.excerptStatus === 'placeholder' && (
            <p className="tint-warn mt-2 flex gap-2 rounded-lg border px-2.5 py-2 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{t('placeholderText', lang)}</span>
            </p>
          )}

          <blockquote className="mt-3 border-l-2 border-teal/50 pl-3 text-sm leading-relaxed text-muted">
            {bi(source.excerpt, lang)}
          </blockquote>

          <p className="numeric mt-3 text-[11px] text-faint">
            {version.notification} · {t('effective', lang)} {formatDate(version.effectiveDate, lang)}
          </p>
        </div>
      )}
    </div>
  )
}
