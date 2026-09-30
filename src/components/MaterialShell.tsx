import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { setSoundEnabled, soundEnabled } from '../lib/sound'
import { Icon } from './Icon'

export interface MaterialShellProps {
  /** Buttons/selects for modes, reset, etc. Hidden when printing. */
  controls?: ReactNode
  /** Short how-to content shown in a collapsible box. */
  help?: ReactNode
  /** Background of the work area: green felt mat, wood table, or plain paper. */
  mat?: 'felt' | 'wood' | 'paper'
  /** Show the built-in sound on/off button at the end of the controls row. Default true. */
  sound?: boolean
  children: ReactNode
}

/**
 * Consistent frame around every interactive material's work area.
 *
 * Focus mode fills the viewport with the material and hides every written
 * instruction (help box and on-stage notes) — a calm, wordless presentation
 * surface for children who don't read yet. Esc or the Exit focus button exits.
 */
export function MaterialShell({ controls, help, mat = 'felt', sound = true, children }: MaterialShellProps) {
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
      className="btn has-icon"
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
    <button type="button" className="btn has-icon" onClick={() => setFocus((f) => !f)}>
      <Icon name={focus ? 'close' : 'focus'} />
      <span className="btn-label">{focus ? 'Exit focus' : 'Focus'}</span>
    </button>
  )

  return (
    <div className={`material-shell${focus ? ' focus-mode' : ''}`}>
      {help && (
        <details className="material-help no-print">
          <summary>How to use this material</summary>
          <div className="material-help-body">{help}</div>
        </details>
      )}
      <div className="material-controls no-print">
        {controls}
        {soundToggle}
        {focusToggle}
      </div>
      <div className={`material-stage mat-${mat}`}>{children}</div>
    </div>
  )
}
