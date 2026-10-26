import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import { generatorBySlug } from '../worksheets/registry'
import { resolveParams } from '../worksheets/params'
import type { AnyGeneratorDef } from '../worksheets/types'
import { kitBySlug } from '../kits/registry'
import { createRng } from '../lib/rng'
import { PageHeader } from '../components/PageHeader'
import { SheetPreview } from '../components/SheetPreview'
import { Icon } from '../components/Icon'
import { useHydrated } from '../components/useHydrated'
import { browserLabel, itemHref, pdfName, printAllItems, readSettings } from './printAll'
import type { PrintAllItem, PrintAllSettings } from './printAll'
import '../kits/kits.css'
import './print-all.css'

function thisBrowser(): string {
  return browserLabel(navigator.userAgent, navigator.maxTouchPoints)
}

/** A worksheet exactly as its builder renders it for this preset and seed. */
function WorksheetSheets({ def, presetId, settings }: { def: AnyGeneratorDef; presetId?: string; settings: PrintAllSettings }) {
  const params = useMemo(
    () => resolveParams(def, new URLSearchParams(presetId ? { preset: presetId } : {})),
    [def, presetId],
  )
  const data = useMemo(() => def.generate(params, createRng(settings.seed)), [def, params, settings.seed])
  const { Sheet, AnswerKey } = def
  return (
    <>
      <Sheet data={data} params={params} />
      {settings.key && <AnswerKey data={data} params={params} />}
    </>
  )
}

function PrintItem({
  item,
  settings,
  pages,
  skipped,
  breaksAfter,
  onPrint,
  onPages,
}: {
  item: PrintAllItem
  settings: PrintAllSettings
  pages: number | undefined
  /** Left off paper: another item is being printed on its own. */
  skipped: boolean
  /** Another printed item follows, so this one ends its last page. */
  breaksAfter: boolean
  onPrint: (item: PrintAllItem) => void
  onPages: (id: string, pages: number) => void
}) {
  const ref = useRef<HTMLElement>(null)
  const def = item.kind === 'worksheet' ? generatorBySlug(item.slug) : undefined
  const Pages = item.kind === 'kit' ? kitBySlug(item.slug)?.Pages : undefined

  // The Letter pages this item is laid out as — the count its PDF should have.
  useLayoutEffect(() => {
    onPages(item.id, ref.current?.querySelectorAll('.sheet-page').length ?? 0)
  }, [item.id, settings.seed, settings.key, onPages])

  const className = ['print-all-item', skipped && 'is-skipped', breaksAfter && 'breaks-after'].filter(Boolean).join(' ')
  return (
    <section ref={ref} className={className} aria-labelledby={`${item.id}-name`}>
      <header className="print-all-item-head no-print">
        <div>
          <h2 className="print-all-item-name" id={`${item.id}-name`}>
            {item.name}
          </h2>
          <p className="print-all-item-meta">
            {item.variant}
            {pages !== undefined && ` · ${pages} ${pages === 1 ? 'page' : 'pages'}`}
            {' · '}
            <Link to={itemHref(item, settings)}>Open its page</Link>
          </p>
        </div>
        <button type="button" className="btn has-icon" onClick={() => onPrint(item)}>
          <Icon name="print" />
          <span className="btn-label">Print this one</span>
        </button>
      </header>
      <SheetPreview bw={settings.bw} desk>
        {def && <WorksheetSheets def={def} presetId={item.presetId} settings={settings} />}
        {Pages && <Pages />}
      </SheetPreview>
    </section>
  )
}

function SeedField({ seed, onChange }: { seed: number; onChange: (seed: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <label className="field">
      <span className="field-label">Seed</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft ?? String(seed)}
        onChange={(e) => {
          setDraft(e.target.value)
          if (/^\d{1,10}$/.test(e.target.value)) onChange(Number(e.target.value))
        }}
        onBlur={() => setDraft(null)}
      />
      <span className="field-help">The same seed gives the same problems in every browser.</span>
    </label>
  )
}

/**
 * Every worksheet and kit on one page, for saving PDFs from different
 * browsers and comparing them. Not linked from anywhere and kept out of
 * search (src/prerender/routes.ts). Each sheet keeps the builder's print
 * structure (.builder-preview > SheetPreview), so its pages lay out as they
 * do on the sheet's own page.
 */
export default function PrintAllPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // The browser's name and the page counts come from the browser, so the
  // prerendered page carries the settings without the sheets.
  const hydrated = useHydrated()
  const settings = readSettings(searchParams)
  const { presets, kits } = settings
  const items = useMemo(() => printAllItems({ presets, kits }), [presets, kits])

  const [only, setOnly] = useState<string | null>(null)
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({})
  const onPages = useCallback(
    (id: string, pages: number) => setPageCounts((prev) => (prev[id] === pages ? prev : { ...prev, [id]: pages })),
    [],
  )
  const totalPages = items.reduce((sum, item) => sum + (pageCounts[item.id] ?? 0), 0)

  // The Print buttons arm the print they start. Any other print — ⌘P, the
  // menu, iOS's share sheet — prints everything under its own name.
  const armed = useRef(false)
  const settingsRef = useRef(settings)
  useEffect(() => {
    settingsRef.current = settings
  })
  useEffect(() => {
    const beforePrint = () => {
      if (armed.current) {
        armed.current = false
        return
      }
      flushSync(() => setOnly(null))
      document.title = pdfName(null, settingsRef.current, thisBrowser())
    }
    const afterPrint = () => {
      armed.current = false
    }
    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
  }, [])

  // The title (the PDF's name) stays until the next print or leaving the
  // page: Safari's print() returns while its dialog is still open, and the
  // dialog reads the title, and lays the page out again, until it closes.
  const print = (item: PrintAllItem | null) => {
    flushSync(() => setOnly(item ? item.id : null))
    document.title = pdfName(item, settings, thisBrowser())
    armed.current = true
    window.print()
  }

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(patch)) next.set(k, v)
    setSearchParams(next, { replace: true })
  }

  const lastPrinted = only === null ? items.length - 1 : -1

  return (
    <div className="builder print-all">
      <PageHeader
        className="no-print"
        kicker="Print check"
        title="Print everything"
        lede="Every worksheet and kit on one page, for saving PDFs from different browsers and comparing them. Nothing on the site links here."
        actions={
          <button type="button" className="btn primary has-icon" onClick={() => print(null)}>
            <Icon name="print" />
            <span className="btn-label">Print everything</span>
          </button>
        }
      />

      <div className="builder-layout">
        <aside className="builder-form panel no-print" aria-labelledby="print-all-settings">
          <h2 className="panel-label" id="print-all-settings">
            What to print
          </h2>
          <div className="field-grid">
            <SeedField seed={settings.seed} onChange={(seed) => update({ seed: String(seed) })} />
            <label className="field checkbox">
              <input type="checkbox" checked={settings.bw} onChange={(e) => update({ bw: e.target.checked ? '1' : '0' })} />
              <span className="field-label">Ink-friendly black &amp; white</span>
            </label>
            <label className="field checkbox">
              <input type="checkbox" checked={settings.key} onChange={(e) => update({ key: e.target.checked ? '1' : '0' })} />
              <span className="field-label">Include answer key pages</span>
            </label>
            <label className="field checkbox">
              <input
                type="checkbox"
                checked={settings.presets}
                onChange={(e) => update({ presets: e.target.checked ? '1' : '0' })}
              />
              <span className="field-label">Every worksheet preset too</span>
            </label>
            <label className="field checkbox">
              <input type="checkbox" checked={settings.kits} onChange={(e) => update({ kits: e.target.checked ? '1' : '0' })} />
              <span className="field-label">The make-it-yourself kits</span>
            </label>
          </div>
          {hydrated && (
            <p className="panel-note">
              {items.length} printables, {totalPages} Letter pages. Print everything saves as{' '}
              <strong className="print-all-filename">{pdfName(null, settings, thisBrowser())}.pdf</strong>
            </p>
          )}
          <p className="panel-note">
            Each PDF is named after its sheet, settings and browser, so the Safari and Chrome files for one sheet sort
            side by side. A PDF with more pages than listed here has something spilling onto an extra page. Leave the
            print dialog at its defaults to see what parents get.
          </p>
        </aside>

        <div className="builder-preview">
          {hydrated &&
            items.map((item, i) => (
              <PrintItem
                key={item.id}
                item={item}
                settings={settings}
                pages={pageCounts[item.id]}
                skipped={only !== null && only !== item.id}
                breaksAfter={i < lastPrinted}
                onPrint={print}
                onPages={onPages}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
