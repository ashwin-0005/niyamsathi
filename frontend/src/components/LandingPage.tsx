/**
 * Marketing surface. Explains the product, then hands off to the dashboard.
 *
 * The hero visual is not a mockup: it runs the real `computePlotGeometry` over
 * the 200 sq m / 9 m demo scenario and renders it with the same isometric
 * component the dashboard uses. What a visitor sees on the landing page is
 * literally what the tool draws.
 */
import { useMemo } from 'react'
import {
  ArrowRight, BadgeCheck, BookOpenCheck, Check, FileSearch, Languages, LayoutGrid,
  Mic, ScrollText, ShieldAlert, Sparkles, X,
} from 'lucide-react'
import IsometricPlotScene from './IsometricPlotScene'
import { computePlotGeometry } from '../lib/geometry'
import { COMPLIANCE_STATUS_LABEL, t } from '../lib/i18n'
import type { Lang } from '../lib/types'

interface Props {
  lang: Lang
  onLangChange: (l: Lang) => void
  onStart: () => void
}

/* The hero scenario — the same numbers Demo Scenario 1 loads. */
const HERO_GEOMETRY = computePlotGeometry({
  plotArea: 200,
  plotWidth: 10,
  plotDepth: 20,
  roadWidth: 9,
  required: { front: 3, rear: 2, side: 1.5 },
  proposed: { front: null, rear: null, left: null, right: null },
})

const NAV = [
  { id: 'how', key: 'navHowItWorks' },
  { id: 'features', key: 'navFeatures' },
  { id: 'updates', key: 'navRuleUpdates' },
] as const

const FEATURES = [
  { icon: LayoutGrid, title: 'feat1Title', desc: 'feat1Desc' },
  { icon: Mic, title: 'feat2Title', desc: 'feat2Desc' },
  { icon: BookOpenCheck, title: 'feat3Title', desc: 'feat3Desc' },
  { icon: FileSearch, title: 'feat4Title', desc: 'feat4Desc' },
] as const

const BEFORE = ['before1', 'before2', 'before3', 'before4', 'before5'] as const
const AFTER = ['after1', 'after2', 'after3', 'after4', 'after5'] as const
const STEPS = [
  { title: 'how1Title', desc: 'how1Desc' },
  { title: 'how2Title', desc: 'how2Desc' },
  { title: 'how3Title', desc: 'how3Desc' },
] as const

function LangToggle({ lang, onLangChange }: { lang: Lang; onLangChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-line bg-white/[0.03] p-0.5" role="group" aria-label={t('langToggle', lang)}>
      <Languages className="ml-1.5 h-3.5 w-3.5 text-faint" aria-hidden="true" />
      {(['en', 'hi'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onLangChange(l)}
          aria-pressed={lang === l}
          className={
            lang === l
              ? 'focus-ring rounded-lg bg-chrome px-2.5 py-1 text-xs font-bold text-void'
              : 'focus-ring rounded-lg px-2.5 py-1 text-xs font-medium text-muted transition hover:text-paper'
          }
        >
          {l === 'en' ? 'EN' : 'हिं'}
        </button>
      ))}
    </div>
  )
}

export default function LandingPage({ lang, onLangChange, onStart }: Props) {
  const heroGeometry = useMemo(() => HERO_GEOMETRY, [])

  return (
    <div lang={lang}>
      {/* ---- Header ---------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#/" className="focus-ring flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white/[0.04]">
              <ScrollText className="h-4.5 w-4.5 text-teal" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="display metal block text-base font-extrabold">{t('appName', lang)}</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
                {t('tagline', lang)}
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/5 hover:text-paper"
              >
                {t(item.key, lang)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LangToggle lang={lang} onLangChange={onLangChange} />
            <button type="button" onClick={onStart} className="btn btn-primary focus-ring hidden sm:inline-flex">
              {t('ctaCheckPlot', lang)}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ---- Hero ------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="rise">
            <span className="chip tint-saffron border text-[11px]">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {t('heroBadge', lang)}
            </span>

            <h1 className="display mt-5 text-4xl font-extrabold leading-[1.08] text-paper sm:text-5xl lg:text-6xl">
              {t('heroHeadline', lang)}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {t('heroSub', lang)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onStart} className="btn btn-primary focus-ring px-5 py-3 text-base">
                {t('ctaCheckPlot', lang)}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <a href="#how" className="btn btn-ghost focus-ring px-5 py-3 text-base">
                {t('ctaSeeHow', lang)}
              </a>
            </div>

            <p className="mt-6 flex items-start gap-2 text-xs text-faint">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron" aria-hidden="true" />
              {t('demoDataBadge', lang)}
            </p>
          </div>

          {/* Hero visual */}
          <div className="relative rise" style={{ animationDelay: '120ms' }}>
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
              style={{ background: 'radial-gradient(circle, #0f8e7e55 0%, transparent 70%)' }}
              aria-hidden="true"
            />
            <IsometricPlotScene
              geometry={heroGeometry}
              floors={2}
              lang={lang}
              showDimensions
              parallax
              className="relative mx-auto aspect-square w-full max-w-xl"
            />

            {/* Floating fact card */}
            <div
              className="panel fade-in absolute bottom-2 left-0 w-[16.5rem] p-3.5 sm:bottom-6 sm:left-2"
              style={{ animationDelay: '420ms' }}
            >
              <p className="numeric text-sm font-bold text-paper">{t('heroFactPlot', lang)}</p>
              <p className="numeric mt-0.5 text-xs text-muted">{t('heroFactRoad', lang)}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ok">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {COMPLIANCE_STATUS_LABEL.match[lang]}
              </p>
              <p className="numeric mt-1.5 border-t border-line pt-1.5 text-[11px] text-teal">
                {t('heroFactRule', lang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Problem → solution ---------------------------------------- */}
      <section id="updates" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="display text-3xl font-bold text-paper sm:text-4xl">{t('problemTitle', lang)}</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">{t('problemSub', lang)}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="panel p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">{t('beforeTitle', lang)}</p>
            <ul className="mt-4 space-y-3">
              {BEFORE.map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-muted">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-hidden="true" />
                  {t(key, lang)}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel border-teal/30 p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal">{t('afterTitle', lang)}</p>
            <ul className="mt-4 space-y-3">
              {AFTER.map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-paper">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
                  {t(key, lang)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---- Features --------------------------------------------------- */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="display text-3xl font-bold text-paper sm:text-4xl">{t('featuresTitle', lang)}</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">{t('featuresSub', lang)}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <article key={f.title} className="panel p-5 transition hover:border-chrome-deep">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-teal/30 bg-teal/10">
                  <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                </span>
                <h3 className="display mt-4 text-base font-bold text-paper">{t(f.title, lang)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(f.desc, lang)}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* ---- How it works ----------------------------------------------- */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="display text-3xl font-bold text-paper sm:text-4xl">{t('howTitle', lang)}</h2>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="panel relative p-6">
              <span className="display absolute right-5 top-4 text-5xl font-extrabold text-white/[0.05]" aria-hidden="true">
                {i + 1}
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-teal text-sm font-bold text-teal-ink">
                {i + 1}
              </span>
              <h3 className="display mt-4 text-base font-bold text-paper">{t(s.title, lang)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(s.desc, lang)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---- Final CTA --------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div
          className="panel relative overflow-hidden px-6 py-14 text-center sm:px-12"
          style={{ background: 'linear-gradient(135deg, #0b1b1f 0%, #0b0f18 45%, #141a33 100%)' }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #2fd3bb88, transparent)' }}
            aria-hidden="true"
          />
          <h2 className="display mx-auto max-w-2xl text-3xl font-extrabold leading-tight text-paper sm:text-4xl">
            {t('finalCtaHeadline', lang)}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted">{t('finalCtaSub', lang)}</p>
          <button type="button" onClick={onStart} className="btn btn-primary focus-ring mt-8 px-6 py-3 text-base">
            {t('ctaStartCheck', lang)}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* ---- Footer ------------------------------------------------------ */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="display metal text-base font-extrabold">{t('appName', lang)}</p>
              <p className="mt-1 text-xs text-faint">{t('tagline', lang)}</p>
            </div>
            <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
              {NAV.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="focus-ring text-sm text-muted transition hover:text-paper">
                  {t(item.key, lang)}
                </a>
              ))}
              <button type="button" onClick={onStart} className="focus-ring text-sm text-teal transition hover:text-teal-bright">
                {t('ctaCheckPlot', lang)}
              </button>
            </nav>
            <LangToggle lang={lang} onLangChange={onLangChange} />
          </div>

          <div className="hairline my-6" />

          <p className="max-w-3xl text-xs leading-relaxed text-faint">{t('landingDisclaimer', lang)}</p>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-faint">{t('footer', lang)}</p>
          <p className="mt-3 text-[11px] text-ghost">
            MP Bhumi Vikas Rules, 2012 · Bhopal Municipal Corporation
          </p>
        </div>
      </footer>
    </div>
  )
}
