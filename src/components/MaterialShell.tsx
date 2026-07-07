import { useState } from 'react'
import type { ReactNode } from 'react'
import { setSoundEnabled, soundEnabled } from '../lib/sound'

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

/** Consistent frame around every interactive material's work area. */
export function MaterialShell({ controls, help, mat = 'felt', sound = true, children }: MaterialShellProps) {
  const [soundOn, setSoundOn] = useState(() => soundEnabled())
  const soundToggle = sound !== false && (
    <button
      type="button"
      className="btn"
      onClick={() => {
        const next = !soundOn
        setSoundEnabled(next)
        setSoundOn(next)
      }}
    >
      {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
    </button>
  )
  return (
    <div className="material-shell">
      {help && (
        <details className="material-help no-print">
          <summary>How to use this material</summary>
          <div className="material-help-body">{help}</div>
        </details>
      )}
      {(controls || soundToggle) && (
        <div className="material-controls no-print">
          {controls}
          {soundToggle}
        </div>
      )}
      <div className={`material-stage mat-${mat}`}>{children}</div>
    </div>
  )
}
