import { Fragment, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LESSONS, lessonBySlug } from '../lessons/registry'
import { GENERATORS, generatorBySlug } from '../worksheets/registry'
import { MATERIALS, materialBySlug } from '../materials/registry'
import { STRANDS } from '../lib/strands'
import { PrintButton } from '../components/PrintButton'
import { SheetPreview } from '../components/SheetPreview'
import { BeadBar } from '../components/beads'
import { DAYS, DAY_LABELS, chunkJournal, parsePlan, serializePlan } from './state'
import type { Day, Plan, PlanItem, PlanValidity } from './state'

const KIND_LABELS: Record<PlanItem['kind'], string> = {
  lesson: 'Lesson',
  sheet: 'Worksheet',
  material: 'Material',
}

function shortDay(day: Day): string {
  return DAY_LABELS[day].slice(0, 3)
}

function itemName(item: PlanItem): string {
  if (item.kind === 'lesson') return lessonBySlug(item.slug)?.name ?? item.slug
  if (item.kind === 'sheet') return generatorBySlug(item.slug)?.name ?? item.slug
  return materialBySlug(item.slug)?.name ?? item.slug
}

function itemHref(item: PlanItem): string {
  if (item.kind === 'lesson') return `/lessons/${item.slug}`
  if (item.kind === 'sheet') return `/worksheets/${item.slug}${item.presetId ? `?preset=${item.presetId}` : ''}`
  return `/materials/${item.slug}`
}

function presetName(item: PlanItem): string | undefined {
  if (item.kind !== 'sheet' || !item.presetId) return undefined
  return generatorBySlug(item.slug)?.presets.find((p) => p.id === item.presetId)?.name
}

/** Format YYYY-MM-DD without UTC-parse pitfalls (split, never Date.parse). */
function formatWeekOf(weekOf: string): string {
  const [y, m, d] = weekOf.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function PickerRow({
  name,
  checked,
  day,
  onToggle,
  onDay,
  presetControl,
}: {
  name: string
  checked: boolean
  day: Day | undefined
  onToggle: (on: boolean) => void
  onDay: (day: string) => void
  presetControl?: ReactNode
}) {
  return (
    <div className="planner-row">
      <label>
        <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
        <span className="planner-row-name">{name}</span>
      </label>
      {presetControl}
      <select aria-label={`Day for ${name}`} value={day ?? ''} disabled={!checked} onChange={(e) => onDay(e.target.value)}>
        <option value="">Any day</option>
        {DAYS.map((d) => (
          <option key={d} value={d}>
            {DAY_LABELS[d]}
          </option>
        ))}
      </select>
    </div>
  )
}

function ParentPlanPage({ plan }: { plan: Plan }) {
  const groups: { label: string; items: PlanItem[] }[] = []
  for (const d of DAYS) {
    const items = plan.items.filter((i) => i.day === d)
    if (items.length > 0) groups.push({ label: DAY_LABELS[d], items })
  }
  const anyDay = plan.items.filter((i) => !i.day)
  if (anyDay.length > 0) groups.push({ label: 'Any day', items: anyDay })

  return (
    <section className="sheet-page">
      <div className="sheet-header">
        <p className="sheet-title">Weekly work plan</p>
        <span className="name-date">
          Week of {plan.weekOf ? formatWeekOf(plan.weekOf) : <span className="blank" />}
        </span>
      </div>
      <table className="plan-table">
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.label}>
              <tr>
                <td className="plan-day-heading" colSpan={3}>
                  {group.label}
                </td>
              </tr>
              {group.items.map((item, i) => (
                <tr key={i}>
                  <td>{itemName(item)}</td>
                  <td>
                    <span className="plan-badge">{KIND_LABELS[item.kind]}</span>
                  </td>
                  <td>{presetName(item) ? <span className="plan-preset">{presetName(item)}</span> : null}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
      <p className="plan-footnote">Nothing about this plan is stored — bookmark this page's URL to keep it.</p>
    </section>
  )
}

function JournalPage({ page, pageIndex }: { page: PlanItem[]; pageIndex: number }) {
  return (
    <section className="sheet-page">
      <h2 className="journal-title">My Work</h2>
      {pageIndex === 0 ? (
        <p className="journal-name-line">
          <span className="name-date">
            Name <span className="blank" />
          </span>
        </p>
      ) : (
        <p className="journal-continued">(continued)</p>
      )}
      {page.map((item, i) => (
        <div className="journal-row" key={i}>
          <span className="journal-check" aria-hidden="true" />
          <span className="journal-item-name">{itemName(item)}</span>
          {item.day && <span className="journal-day">{shortDay(item.day)}</span>}
        </div>
      ))}
      <div className="journal-footer">
        <BeadBar n={10} beadSize={26} />
      </div>
    </section>
  )
}

export default function PlannerPage() {
  const valid: PlanValidity = useMemo(
    () => ({
      lessons: new Set(LESSONS.map((l) => l.slug)),
      sheets: new Set(GENERATORS.map((g) => g.slug)),
      presets: new Map(GENERATORS.map((g) => [g.slug, new Set(g.presets.map((p) => p.id))])),
      materials: new Set(MATERIALS.map((m) => m.slug)),
    }),
    [],
  )

  // Single source of truth: parse the plan from the URL on every render and
  // write every change straight back. No React state duplicates the plan.
  const [searchParams, setSearchParams] = useSearchParams()
  const plan = parsePlan(searchParams, valid)
  const bw = searchParams.get('bw') === '1'

  const write = (next: Plan, nextBw = bw) => {
    const qs = serializePlan(next)
    setSearchParams(qs + (nextBw ? `${qs ? '&' : ''}bw=1` : ''), { replace: true })
  }

  // Ephemeral UI only — not plan data.
  const [copied, setCopied] = useState(false)
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt('Copy this link:', window.location.href) // http-LAN fallback: clipboard API needs a secure context
    }
  }

  const isChecked = (kind: PlanItem['kind'], slug: string) =>
    plan.items.some((i) => i.kind === kind && i.slug === slug)

  const firstItem = (kind: PlanItem['kind'], slug: string) =>
    plan.items.find((i) => i.kind === kind && i.slug === slug)

  const toggle = (kind: PlanItem['kind'], slug: string, on: boolean) => {
    const items = on
      ? [...plan.items, { kind, slug }]
      : plan.items.filter((i) => !(i.kind === kind && i.slug === slug))
    write({ ...plan, items })
  }

  /** Replace the first kind+slug match, rebuilding the item without undefined-valued keys. */
  const editFirst = (kind: PlanItem['kind'], slug: string, patch: { day?: string; presetId?: string }) => {
    const idx = plan.items.findIndex((i) => i.kind === kind && i.slug === slug)
    if (idx === -1) return
    const old = plan.items[idx]
    const next: PlanItem = { kind: old.kind, slug: old.slug }
    const presetId = 'presetId' in patch ? patch.presetId : old.presetId
    const day = 'day' in patch ? patch.day : old.day
    if (kind === 'sheet' && presetId) next.presetId = presetId
    if (day && (DAYS as readonly string[]).includes(day)) next.day = day as Day
    write({ ...plan, items: plan.items.map((i, j) => (j === idx ? next : i)) })
  }

  const removeAt = (index: number) => {
    write({ ...plan, items: plan.items.filter((_, i) => i !== index) })
  }

  const setWeekOf = (value: string) => {
    write(value ? { items: plan.items, weekOf: value } : { items: plan.items })
  }

  const renderRow = (kind: PlanItem['kind'], slug: string, name: string, presetControl?: ReactNode) => {
    const checked = isChecked(kind, slug)
    return (
      <PickerRow
        key={slug}
        name={name}
        checked={checked}
        day={firstItem(kind, slug)?.day}
        onToggle={(on) => toggle(kind, slug, on)}
        onDay={(day) => editFirst(kind, slug, { day })}
        presetControl={presetControl}
      />
    )
  }

  const journalPages = chunkJournal(plan.items)

  return (
    <div className="planner">
      <div className="no-print">
        <h1>Plan the week</h1>
        <p className="page-intro">
          Pick lessons, worksheets, and materials for the week, then print two pages: a parent plan and a "My Work"
          journal your child checks off in pencil as work is finished. The whole plan lives in this page's URL —
          bookmark it or copy the link to keep it. Nothing is stored anywhere.
        </p>
      </div>

      <div className="planner-layout no-print">
        <div>
          <p className="section-label">Lessons</p>
          {STRANDS.map((strand) => {
            const items = LESSONS.filter((l) => l.strand === strand.id).sort((a, b) => a.sequence - b.sequence)
            if (items.length === 0) return null
            return (
              <section key={strand.id}>
                <h3>{strand.name}</h3>
                {items.map((l) => renderRow('lesson', l.slug, l.name))}
              </section>
            )
          })}

          <p className="section-label">Worksheets</p>
          {GENERATORS.map((g) =>
            renderRow(
              'sheet',
              g.slug,
              g.name,
              <select
                aria-label={`Preset for ${g.name}`}
                value={firstItem('sheet', g.slug)?.presetId ?? ''}
                disabled={!isChecked('sheet', g.slug)}
                onChange={(e) => editFirst('sheet', g.slug, { presetId: e.target.value })}
              >
                <option value="">Default settings</option>
                {g.presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>,
            ),
          )}

          <p className="section-label">Materials</p>
          {MATERIALS.map((m) => renderRow('material', m.slug, m.name))}
        </div>

        <aside className="card planner-shelf">
          <h2>This week's shelf</h2>
          <label className="field">
            Week of (optional)
            <input type="date" value={plan.weekOf ?? ''} onChange={(e) => setWeekOf(e.target.value)} />
          </label>
          {plan.items.length === 0 ? (
            <p>Nothing picked yet — check items on the left.</p>
          ) : (
            <ul>
              {plan.items.map((item, i) => {
                const name = itemName(item)
                return (
                  <li key={`${item.kind}-${item.slug}-${i}`}>
                    <Link to={itemHref(item)}>{name}</Link>
                    {item.day && <span>{shortDay(item.day)}</span>}
                    <button
                      type="button"
                      className="planner-remove"
                      aria-label={`Remove ${name}`}
                      onClick={() => removeAt(i)}
                    >
                      ×
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="planner-actions">
            <button type="button" className="btn" onClick={copyLink}>
              {copied ? 'Copied' : '🔗 Copy link'}
            </button>
            <PrintButton />
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (window.confirm('Clear this plan?')) setSearchParams('', { replace: true })
              }}
            >
              Clear week
            </button>
          </div>
          <label className="field checkbox">
            <input type="checkbox" checked={bw} onChange={(e) => write(plan, e.target.checked)} />
            Ink-friendly black &amp; white
          </label>
        </aside>
      </div>

      <div className="planner-preview">
        {plan.items.length > 0 ? (
          <SheetPreview bw={bw}>
            <ParentPlanPage plan={plan} />
            {journalPages.map((page, pageIndex) => (
              <JournalPage key={pageIndex} page={page} pageIndex={pageIndex} />
            ))}
          </SheetPreview>
        ) : (
          <p className="no-print">Check a few items above and the printable plan and journal will preview here.</p>
        )}
      </div>
    </div>
  )
}
