import { useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { setSoundEnabled, soundEnabled } from '../lib/sound'
import { Icon } from './Icon'
import { MaterialNameContext } from './MaterialNameContext'
import { plateCaption } from './plateCaption'
import type { MatSurface } from './plateCaption'

export interface MaterialShellProps {
  /** Buttons/selects for modes, reset, etc. Hidden when printing. */
  controls?: ReactNode
  /** Short how-to content shown in a collapsible box. */
  help?: ReactNode
  /** Background of the work area: green felt mat, wood table, or plain paper. */
  mat?: MatSurface
  /** Show the built-in sound on/off button at the end of the controls row. Default true. */
  sound?: boolean
  children: ReactNode
}

/**
 * Consistent frame around every interactive material's work area (The Album,
 * PRD 19): a ruled toolbar (the material's own controls left, Sound and Focus
 * right), the how-to disclosure line, then the material on a mounted plate
 * with a caption. Everything inside .material-stage is the material itself:
 * it takes the Album's type (global.css) and keeps its own colours and layout.
 *
 * Focus mode fills the viewport with the material and hides every written
 * instruction (help box, plate caption and on-stage notes) — a calm, wordless
 * presentation surface for children who don't read yet. Esc or the Exit focus
 * button exits.
 */
export function MaterialShell({ controls, help, mat = 'felt', sound = true, children }: MaterialShellProps) {
  const materialName = useContext(MaterialNameContext)
  const [soundOn, setSoundOn] = useState(() => soundEnabled())
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    if (!focus) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocus(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('has-focus-mode')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('has-focus-mode')
    }
  }, [focus])

  const soundToggle = sound !== false && (
    <button
      type="button"
      className="btn has-icon btn-utility"
      onClick={() => {
        const next = !soundOn
        setSoundEnabled(next)
        setSoundOn(next)
      }}
    >
      <Icon name={soundOn ? 'sound' : 'sound-off'} />
      <span className="btn-label">{soundOn ? 'Sound on' : 'Sound off'}</span>
    </button>
  )

  const focusToggle = (
    <button type="button" className="btn has-icon btn-utility" onClick={() => setFocus((f) => !f)}>
      <Icon name={focus ? 'close' : 'focus'} />
      <span className="btn-label">{focus ? 'Exit focus' : 'Focus'}</span>
    </button>
  )

  return (
    <div className={`material-shell${focus ? ' focus-mode' : ''}`}>
      <div className="material-controls material-toolbar no-print">
        {controls ? <div className="material-task">{controls}</div> : null}
        <div className="material-utility" role="group" aria-label="Sound and focus">
          {soundToggle}
          {focusToggle}
        </div>
      </div>
      {help && (
        <details className="material-help no-print">
          <summary>
            <span className="material-help-mark" aria-hidden="true" />
            How to use this material
          </summary>
          <div className="material-help-body">{help}</div>
        </details>
      )}
      <figure className="material-plate">
        <div className="material-stage-frame">
          <div className={`material-stage mat-${mat}`}>{children}</div>
        </div>
        <figcaption className="plate-caption">
          <span className="plate-no">Plate.</span> {plateCaption(materialName, mat)}
        </figcaption>
      </figure>
    </div>
  )
}
