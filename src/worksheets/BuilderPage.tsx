import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { generatorBySlug } from './registry'
import type { ParamField } from './types'
import { commitNumber, draftNumber, resolveParams } from './params'
import { createRng, randomSeed } from '../lib/rng'
import { strandInfo } from '../lib/strands'
import { PrintButton } from '../components/PrintButton'
import { SheetPreview } from '../components/SheetPreview'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta } from '../components/Contents'
import { useHydrated } from '../components/useHydrated'
import NotFound from '../pages/NotFound'

function Field({
  field,
  value,
  onChange,
}: {
  field: ParamField
  value: number | string | boolean
  onChange: (v: number | string | boolean) => void
}) {
  if (field.kind === 'boolean') {
    return (
      <label className="field checkbox">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <span className="field-label">{field.label}</span>
        {field.help && <span className="field-help">{field.help}</span>}
      </label>
    )
  }
  if (field.kind === 'select') {
    return (
      <label className="field">
        <span className="field-label">{field.label}</span>
        <select value={String(value)} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {field.help && <span className="field-help">{field.help}</span>}
      </label>
    )
  }
  return <NumberField field={field} value={Number(value)} onChange={onChange} />
}

/**
 * Holds the typed text as a draft so a keystroke is never clamped mid-number
 * ("2" on the way to "25" in a 10–60 field). In-range values apply live; the
 * clamp happens on blur or Enter. resolveParams still clamps whatever the URL says.
 */
function NumberField({
  field,
  value,
  onChange,
}: {
  field: Extract<ParamField, { kind: 'number' }>
  value: number
  onChange: (v: number) => void
}) {
  // null = not editing, so the input mirrors the sheet (and follows preset changes).
  const [draft, setDraft] = useState<string | null>(null)

  function commit() {
    if (draft === null) return
    const n = commitNumber(draft, field.min, field.max)
    if (n !== null && n !== value) onChange(n)
    setDraft(null)
  }

  return (
    <label className="field">
      <span className="field-label">{field.label}</span>
      <input
        type="number"
        value={draft ?? String(value)}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        onChange={(e) => {
          setDraft(e.target.value)
          const n = draftNumber(e.target.value, field.min, field.max)
          if (n !== null && n !== value) onChange(n)
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
        }}
      />
      {field.help && <span className="field-help">{field.help}</span>}
    </label>
  )
}

export default function BuilderPage() {
  const { slug } = useParams()
  const def = slug ? generatorBySlug(slug) : undefined
  const [searchParams, setSearchParams] = useSearchParams()
  const fallbackSeed = useMemo(() => randomSeed(), [])
  // The fallback seed is picked per visit, so the problems (and the seed note)
  // wait for the browser: the prerendered page shows the form without them.
  const hydrated = useHydrated()

  const rawSeed = searchParams.get('seed')
  const seed = rawSeed !== null && !Number.isNaN(Number(rawSeed)) ? Number(rawSeed) : fallbackSeed
  const params = def ? resolveParams(def, searchParams) : {}
  const bw = searchParams.get('bw') === '1'
  const showKey = searchParams.get('key') !== '0'

  const paramsKey = JSON.stringify(params)
  const data = useMemo(
    () => (def ? def.generate(params, createRng(seed)) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params identity tracked via paramsKey
    [def, paramsKey, seed],
  )

  // Pin the seed into the URL on the first visit. Without this the page's own
  // promise — that this exact sheet reprints from its URL — is false until some
  // control is touched, and a reload or a shared link gives different problems.
  useEffect(() => {
    if (!def || rawSeed !== null) return
    const next = new URLSearchParams(searchParams)
    next.set('seed', String(seed))
    setSearchParams(next, { replace: true })
  }, [def, rawSeed, seed, searchParams, setSearchParams])

  if (!def) return <NotFound />

  // The select reflects the ?preset= param only until any individual field is
  // changed on top of it (at which point the sheet is custom again).
  const presetParam = searchParams.get('preset')
  const overridden = def.schema.some((f) => searchParams.get(f.key) !== null)
  const activePreset = !overridden && presetParam && def.presets.some((p) => p.id === presetParam) ? presetParam : ''
  // The help line under the select never disappears while a preset is the
  // starting point, so the form doesn't jump when a field is edited (S6-19).
  const basePreset = def.presets.find((p) => p.id === presetParam)
  const presetHelp = basePreset
    ? activePreset
      ? basePreset.description
      : `Based on “${basePreset.name}”, with your changes. ${basePreset.description}`
    : undefined

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    next.set('seed', String(seed))
    for (const [k, v] of Object.entries(patch)) next.set(k, v)
    setSearchParams(next, { replace: true })
  }

  const { Sheet, AnswerKey } = def

  return (
    <div className="builder">
      <PageHeader
        className="no-print"
        title={def.name}
        docTitle={`${def.name} worksheet`}
        meta={
          <>
            <AgeMeta ages={def.ages} />
            <span className="badge">{strandInfo(def.strand).name}</span>
          </>
        }
        lede={def.description}
        actions={
          <>
            <button type="button" className="btn has-icon" onClick={() => update({ seed: String(randomSeed()) })}>
              <Icon name="refresh" />
              <span className="btn-label">New problems</span>
            </button>
            <PrintButton />
          </>
        }
      />

      <div className="builder-layout">
        <aside className="builder-form panel no-print" aria-labelledby="sheet-settings">
          <h2 className="panel-label" id="sheet-settings">
            Sheet settings
          </h2>
          <div className="field-grid">
            {def.presets.length > 0 && (
              <label className="field">
                <span className="field-label">Preset</span>
                <select
                  value={activePreset}
                  onChange={(e) => {
                    if (e.target.value === '') return
                    // Drop the per-field overrides so the preset's params win, but
                    // keep the view toggles — picking a preset must not silently
                    // undo an ink-friendly or hide-the-key choice.
                    const next = new URLSearchParams(searchParams)
                    for (const f of def.schema) next.delete(f.key)
                    next.set('preset', e.target.value)
                    next.set('seed', String(seed))
                    setSearchParams(next, { replace: true })
                  }}
                >
                  <option value="">Choose a preset…</option>
                  {def.presets.map((p) => (
                    <option key={p.id} value={p.id} title={p.description}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {presetHelp && <span className="field-help">{presetHelp}</span>}
              </label>
            )}

            {def.schema.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={params[field.key]}
                onChange={(v) => update({ [field.key]: typeof v === 'boolean' ? (v ? '1' : '0') : String(v) })}
              />
            ))}

            <label className="field checkbox">
              <input type="checkbox" checked={bw} onChange={(e) => update({ bw: e.target.checked ? '1' : '0' })} />
              <span className="field-label">Ink-friendly black &amp; white</span>
            </label>
            <label className="field checkbox">
              <input
                type="checkbox"
                checked={showKey}
                onChange={(e) => update({ key: e.target.checked ? '1' : '0' })}
              />
              <span className="field-label">Include answer key page</span>
            </label>
          </div>
          <p className="panel-note">
            {hydrated && <>Seed {seed} — this exact sheet can be reprinted from this page's URL. </>}
            Practice happens on paper: print it, don't screen it. <Link to="/parents/using-this-site">Printing tips</Link>
          </p>
        </aside>

        <div className="builder-preview">
          {hydrated && (
            <SheetPreview bw={bw} desk>
              <Sheet data={data} params={params} />
              {showKey && <AnswerKey data={data} params={params} />}
            </SheetPreview>
          )}
        </div>
      </div>
    </div>
  )
}
