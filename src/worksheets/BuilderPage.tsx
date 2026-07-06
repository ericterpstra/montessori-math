import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { generatorBySlug } from './registry'
import type { AnyGeneratorDef, ParamField, ParamValues } from './types'
import { createRng, randomSeed } from '../lib/rng'
import { strandInfo } from '../lib/strands'
import { PrintButton } from '../components/PrintButton'
import NotFound from '../pages/NotFound'

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Defaults ← preset (?preset=) ← individual URL params. */
function resolveParams(def: AnyGeneratorDef, searchParams: URLSearchParams): ParamValues {
  let params: ParamValues = { ...def.defaults }
  const presetId = searchParams.get('preset')
  if (presetId) {
    const preset = def.presets.find((p) => p.id === presetId)
    if (preset) params = { ...params, ...preset.params }
  }
  for (const field of def.schema) {
    const raw = searchParams.get(field.key)
    if (raw === null) continue
    if (field.kind === 'number') {
      const n = Number(raw)
      if (!Number.isNaN(n)) params[field.key] = clamp(n, field.min, field.max)
    } else if (field.kind === 'boolean') {
      params[field.key] = raw === '1' || raw === 'true'
    } else if (field.options.some((o) => o.value === raw)) {
      params[field.key] = raw
    }
  }
  return params
}

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
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {field.label}
        {field.help && <span className="field-help">{field.help}</span>}
      </label>
    )
  }
  if (field.kind === 'select') {
    return (
      <label className="field">
        {field.label}
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
  return (
    <label className="field">
      {field.label}
      <input
        type="number"
        value={Number(value)}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (!Number.isNaN(n)) onChange(clamp(n, field.min, field.max))
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

  if (!def) return <NotFound />

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    next.set('seed', String(seed))
    for (const [k, v] of Object.entries(patch)) next.set(k, v)
    setSearchParams(next, { replace: true })
  }

  const { Sheet, AnswerKey } = def

  return (
    <div className="builder">
      <div className="no-print">
        <h1>{def.name}</h1>
        <p>
          <span className="badge age">ages {def.ages[0]}–{def.ages[1]}</span>
          <span className="badge">{strandInfo(def.strand).name}</span>
        </p>
        <p className="page-intro">{def.description}</p>
      </div>

      <div className="builder-layout">
        <aside className="builder-form card no-print">
          {def.presets.length > 0 && (
            <div className="preset-row">
              <span className="section-label" style={{ margin: 0 }}>Presets</span>
              {def.presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="btn"
                  title={p.description}
                  onClick={() => {
                    const next = new URLSearchParams()
                    next.set('preset', p.id)
                    next.set('seed', String(seed))
                    setSearchParams(next, { replace: true })
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
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
            Ink-friendly black &amp; white
          </label>
          <label className="field checkbox">
            <input type="checkbox" checked={showKey} onChange={(e) => update({ key: e.target.checked ? '1' : '0' })} />
            Include answer key page
          </label>

          <div className="builder-actions">
            <button type="button" className="btn" onClick={() => update({ seed: String(randomSeed()) })}>
              🎲 New problems
            </button>
            <PrintButton />
          </div>
          <p className="field-help">
            Seed {seed} — this exact sheet can be reprinted from this page's URL. Practice happens on paper: print it,
            don't screen it. <Link to="/parents/using-this-site">Printing tips</Link>
          </p>
        </aside>

        <div className="builder-preview">
          <div className={`print-sheet${bw ? ' bw' : ''}`}>
            <Sheet data={data} params={params} />
            {showKey && <AnswerKey data={data} params={params} />}
          </div>
        </div>
      </div>
    </div>
  )
}
